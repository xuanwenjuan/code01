package com.oiledumbrella.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.oiledumbrella.annotation.OperationLog;
import com.oiledumbrella.annotation.RequiresRole;
import com.oiledumbrella.dto.CustomOrderCreateDTO;
import com.oiledumbrella.dto.CustomOrderDTO;
import com.oiledumbrella.dto.OrderCompleteDTO;
import com.oiledumbrella.dto.OrderMaterialLockDTO;
import com.oiledumbrella.entity.*;
import com.oiledumbrella.enums.OrderStatusEnum;
import com.oiledumbrella.exception.BusinessException;
import com.oiledumbrella.mapper.*;
import com.oiledumbrella.vo.CustomOrderDetailVO;
import com.oiledumbrella.vo.OrderMaterialVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomOrderService {

    private final CustomOrderMapper orderMapper;
    private final OrderFlowLogMapper flowLogMapper;
    private final OrderMaterialMapper orderMaterialMapper;
    private final UmbrellaStyleService styleService;
    private final MaterialService materialService;
    private final SysUserMapper userMapper;

    public Page<CustomOrder> page(Integer pageNum, Integer pageSize, String orderStatus, String keyword) {
        Page<CustomOrder> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<CustomOrder> wrapper = new LambdaQueryWrapper<>();
        if (orderStatus != null && !orderStatus.isEmpty()) {
            wrapper.eq(CustomOrder::getOrderStatus, orderStatus);
        }
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(CustomOrder::getOrderNo, keyword)
                    .or().like(CustomOrder::getCustomerName, keyword)
                    .or().like(CustomOrder::getCustomerPhone, keyword));
        }
        wrapper.orderByDesc(CustomOrder::getCreateTime);
        return orderMapper.selectPage(page, wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(operationType = "创建", businessType = "工单管理", description = "创建定制工单")
    public void create(CustomOrderCreateDTO dto, Long operatorId) {
        CustomOrder order = new CustomOrder();
        BeanUtils.copyProperties(dto, order);

        String orderNo = "ORD" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        order.setOrderNo(orderNo);
        order.setOrderStatus(OrderStatusEnum.PENDING_DEPOSIT.getCode());
        order.setTotalPrice(order.getUnitPrice().multiply(new BigDecimal(order.getQuantity())));

        if (order.getDeposit() == null) {
            order.setDeposit(order.getTotalPrice().multiply(new BigDecimal("0.3")));
        }
        order.setDepositStatus(0);
        order.setOperatorId(operatorId);

        orderMapper.insert(order);

        saveFlowLog(order.getId(), null, OrderStatusEnum.PENDING_DEPOSIT.getCode(), operatorId, "创建工单");
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(operationType = "支付", businessType = "工单管理", description = "支付定金")
    public void payDeposit(Long orderId, Long operatorId) {
        CustomOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatusEnum.PENDING_DEPOSIT.getCode().equals(order.getOrderStatus())) {
            throw new BusinessException("当前状态不支持支付定金");
        }

        String previousStatus = order.getOrderStatus();
        order.setDepositStatus(1);
        order.setDepositPayTime(LocalDateTime.now());
        order.setOrderStatus(OrderStatusEnum.DESIGN_CONFIRMED.getCode());
        order.setOperatorId(operatorId);
        orderMapper.updateById(order);

        saveFlowLog(orderId, previousStatus, OrderStatusEnum.DESIGN_CONFIRMED.getCode(), operatorId, "支付定金");
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(operationType = "定稿", businessType = "工单管理", description = "工单定稿锁定原料")
    public void confirmDesign(OrderMaterialLockDTO lockDTO, Long operatorId) {
        CustomOrder order = orderMapper.selectById(lockDTO.getOrderId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatusEnum.DESIGN_CONFIRMED.getCode().equals(order.getOrderStatus())) {
            throw new BusinessException("当前状态不支持定稿操作");
        }

        String previousStatus = order.getOrderStatus();
        
        for (OrderMaterialLockDTO.MaterialItem item : lockDTO.getMaterials()) {
            materialService.lockStock(item.getMaterialId(), item.getQuantity());
        }

        List<OrderMaterial> orderMaterials = new ArrayList<>();
        for (OrderMaterialLockDTO.MaterialItem item : lockDTO.getMaterials()) {
            Material material = materialService.getById(item.getMaterialId());
            OrderMaterial om = new OrderMaterial();
            om.setOrderId(lockDTO.getOrderId());
            om.setMaterialId(item.getMaterialId());
            om.setQuantity(item.getQuantity());
            om.setUnitPrice(material.getUnitPrice());
            om.setTotalPrice(material.getUnitPrice().multiply(item.getQuantity()));
            om.setOperatorId(operatorId);
            om.setLockStatus(1);
            om.setLockTime(LocalDateTime.now());
            orderMaterialMapper.insert(om);
            orderMaterials.add(om);
        }

        order.setOrderStatus(OrderStatusEnum.IN_PRODUCTION.getCode());
        order.setOperatorId(operatorId);
        orderMapper.updateById(order);

        saveFlowLog(lockDTO.getOrderId(), previousStatus, OrderStatusEnum.IN_PRODUCTION.getCode(), operatorId, "设计定稿，锁定原料库存");
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(operationType = "完工", businessType = "工单管理", description = "工单完工")
    public void completeOrder(OrderCompleteDTO completeDTO, Long operatorId) {
        CustomOrder order = orderMapper.selectById(completeDTO.getOrderId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatusEnum.IN_PRODUCTION.getCode().equals(order.getOrderStatus())) {
            throw new BusinessException("当前状态不支持完工操作");
        }

        String previousStatus = order.getOrderStatus();

        BigDecimal laborCostTotal = BigDecimal.ZERO;
        if (completeDTO.getLaborCosts() != null) {
            for (OrderCompleteDTO.LaborCost laborCost : completeDTO.getLaborCosts()) {
                BigDecimal cost = laborCost.getWorkHours().multiply(laborCost.getHourlyWage());
                laborCostTotal = laborCostTotal.add(cost);
            }
        }

        BigDecimal materialCostTotal = BigDecimal.ZERO;
        BigDecimal scrapCostTotal = BigDecimal.ZERO;
        List<OrderMaterial> materials = orderMaterialMapper.selectList(
                new LambdaQueryWrapper<OrderMaterial>().eq(OrderMaterial::getOrderId, completeDTO.getOrderId())
        );

        for (OrderMaterial material : materials) {
            materialCostTotal = materialCostTotal.add(material.getTotalPrice());
            materialService.unlockStock(material.getMaterialId(), material.getQuantity());
            materialService.outStock(material.getBatchId() != null ? material.getBatchId() : 0L,
                    material.getQuantity(), operatorId);
        }

        if (completeDTO.getMaterialScraps() != null) {
            for (OrderCompleteDTO.MaterialScrap scrap : completeDTO.getMaterialScraps()) {
                Material material = materialService.getById(scrap.getMaterialId());
                scrapCostTotal = scrapCostTotal.add(material.getUnitPrice().multiply(scrap.getQuantity()));
                materialService.scrapStock(scrap.getMaterialId(), scrap.getQuantity(), scrap.getReason(), operatorId);
            }
        }

        order.setOrderStatus(OrderStatusEnum.COMPLETED.getCode());
        order.setActualFinishDate(LocalDate.now());
        order.setOperatorId(operatorId);
        orderMapper.updateById(order);

        saveFlowLog(completeDTO.getOrderId(), previousStatus, OrderStatusEnum.COMPLETED.getCode(), operatorId,
                "工单完工 - 人工成本: " + laborCostTotal + ", 原料成本: " + materialCostTotal + ", 报废成本: " + scrapCostTotal);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(operationType = "取消", businessType = "工单管理", description = "取消工单")
    public void cancelOrder(Long orderId, Long operatorId, String reason) {
        CustomOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (OrderStatusEnum.COMPLETED.getCode().equals(order.getOrderStatus())) {
            throw new BusinessException("已完成工单不能取消");
        }

        String previousStatus = order.getOrderStatus();

        List<OrderMaterial> materials = orderMaterialMapper.selectList(
                new LambdaQueryWrapper<OrderMaterial>().eq(OrderMaterial::getOrderId, orderId)
        );
        for (OrderMaterial material : materials) {
            if (material.getLockStatus() != null && material.getLockStatus() == 1) {
                materialService.unlockStock(material.getMaterialId(), material.getQuantity());
            }
        }

        order.setOrderStatus(OrderStatusEnum.CANCELLED.getCode());
        order.setOperatorId(operatorId);
        orderMapper.updateById(order);

        saveFlowLog(orderId, previousStatus, OrderStatusEnum.CANCELLED.getCode(), operatorId, "取消工单: " + reason);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(operationType = "分配工匠", businessType = "工单管理", description = "分配制伞工匠")
    public void assignArtisan(Long orderId, Long artisanId, Long operatorId) {
        CustomOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        SysUser artisan = userMapper.selectById(artisanId);
        if (artisan == null) {
            throw new BusinessException("工匠不存在");
        }

        String previousStatus = order.getOrderStatus();
        order.setArtisanId(artisanId);
        order.setOperatorId(operatorId);
        orderMapper.updateById(order);

        saveFlowLog(orderId, previousStatus, order.getOrderStatus(), operatorId, "分配工匠: " + artisan.getRealName());
    }

    public CustomOrderDetailVO getDetail(Long orderId) {
        CustomOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            return null;
        }

        CustomOrderDetailVO vo = new CustomOrderDetailVO();
        BeanUtils.copyProperties(order, vo);

        UmbrellaStyle style = styleService.getById(order.getStyleId());
        if (style != null) {
            vo.setStyleName(style.getStyleName());
        }

        List<OrderMaterial> materials = orderMaterialMapper.selectList(
                new LambdaQueryWrapper<OrderMaterial>().eq(OrderMaterial::getOrderId, orderId)
        );
        List<OrderMaterialVO> materialVOList = materials.stream().map(m -> {
            OrderMaterialVO mvo = new OrderMaterialVO();
            BeanUtils.copyProperties(m, mvo);
            Material material = materialService.getById(m.getMaterialId());
            if (material != null) {
                mvo.setMaterialName(material.getMaterialName());
                mvo.setMaterialCode(material.getMaterialCode());
            }
            mvo.setLockStatusName(m.getLockStatus() == 1 ? "已锁定" : "未锁定");
            return mvo;
        }).collect(Collectors.toList());
        vo.setMaterials(materialVOList);

        List<OrderFlowLog> flowLogs = getFlowLogs(orderId);
        vo.setFlowLogs(flowLogs);

        return vo;
    }

    public void update(CustomOrder order) {
        orderMapper.updateById(order);
    }

    public List<OrderFlowLog> getFlowLogs(Long orderId) {
        return flowLogMapper.selectList(
                new LambdaQueryWrapper<OrderFlowLog>()
                        .eq(OrderFlowLog::getOrderId, orderId)
                        .orderByAsc(OrderFlowLog::getCreateTime)
        );
    }

    public List<CustomOrder> getExpiredPendingOrders() {
        LocalDateTime expireTime = LocalDateTime.now().minusHours(24);
        return orderMapper.selectList(
                new LambdaQueryWrapper<CustomOrder>()
                        .eq(CustomOrder::getOrderStatus, OrderStatusEnum.PENDING_DEPOSIT.getCode())
                        .eq(CustomOrder::getDepositStatus, 0)
                        .lt(CustomOrder::getCreateTime, expireTime)
        );
    }

    private void saveFlowLog(Long orderId, String previousStatus, String currentStatus, Long operatorId, String remark) {
        OrderFlowLog log = new OrderFlowLog();
        log.setOrderId(orderId);
        log.setPreviousStatus(previousStatus);
        log.setCurrentStatus(currentStatus);
        log.setOperatorId(operatorId);
        log.setRemark(remark);

        if (operatorId != null) {
            SysUser user = userMapper.selectById(operatorId);
            if (user != null) {
                log.setOperatorName(user.getRealName());
            }
        }

        flowLogMapper.insert(log);
    }
}
