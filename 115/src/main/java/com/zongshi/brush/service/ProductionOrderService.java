package com.zongshi.brush.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zongshi.brush.dto.CraftConfirmDTO;
import com.zongshi.brush.dto.OrderCompleteDTO;
import com.zongshi.brush.dto.OrderMaterialDTO;
import com.zongshi.brush.dto.ProductionOrderDTO;
import com.zongshi.brush.entity.*;
import com.zongshi.brush.exception.BusinessException;
import com.zongshi.brush.mapper.*;
import com.zongshi.brush.util.UserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductionOrderService extends ServiceImpl<ProductionOrderMapper, ProductionOrder> {

    private final BrushCategoryMapper brushCategoryMapper;
    private final OrderMaterialMapper orderMaterialMapper;
    private final OrderStatusLogMapper orderStatusLogMapper;
    private final MaterialArchiveService materialArchiveService;
    private final SysUserMapper sysUserMapper;

    @Transactional(rollbackFor = Exception.class)
    public Long createOrder(ProductionOrderDTO dto) {
        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionOrder::getOrderNo, dto.getOrderNo());
        wrapper.eq(ProductionOrder::getIsDeleted, 0);
        Long count = this.baseMapper.selectCount(wrapper);
        if (count > 0) {
            throw new BusinessException("工单编号已存在");
        }

        validateCategory(dto.getCategoryId());

        ProductionOrder order = new ProductionOrder();
        BeanUtils.copyProperties(dto, order);
        initOrder(order);

        this.baseMapper.insert(order);

        saveStatusLog(order.getId(), order.getOrderNo(), null, 1, "创建工单");

        return order.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public void confirmCraft(CraftConfirmDTO dto) {
        ProductionOrder order = getOrderById(dto.getOrderId());

        if (order.getIsCraftConfirmed() != null && order.getIsCraftConfirmed() == 1) {
            throw new BusinessException("该工单工艺已确认");
        }

        if (CollectionUtils.isEmpty(dto.getMaterials())) {
            throw new BusinessException("原料清单不能为空");
        }

        for (OrderMaterialDTO materialDTO : dto.getMaterials()) {
            materialArchiveService.lockMaterial(
                order.getId(),
                materialDTO.getMaterialId(),
                materialDTO.getUsageQuantity(),
                "工单工艺锁定原料"
            );
        }

        order.setCraftType(dto.getCraftType());
        order.setIsCraftConfirmed(1);
        order.setCraftConfirmTime(LocalDateTime.now());
        order.setOrderStatus(2);
        this.baseMapper.updateById(order);

        for (OrderMaterialDTO materialDTO : dto.getMaterials()) {
            OrderMaterial orderMaterial = new OrderMaterial();
            orderMaterial.setOrderId(order.getId());
            orderMaterial.setMaterialId(materialDTO.getMaterialId());
            orderMaterial.setMaterialName(materialDTO.getMaterialName());
            orderMaterial.setUsageQuantity(materialDTO.getUsageQuantity());
            orderMaterial.setUnitPrice(materialDTO.getUnitPrice());
            orderMaterial.setTotalPrice(materialDTO.getUsageQuantity().multiply(materialDTO.getUnitPrice()));
            orderMaterial.setCreateTime(LocalDateTime.now());
            orderMaterialMapper.insert(orderMaterial);
        }

        saveStatusLog(order.getId(), order.getOrderNo(), 1, 2, "工艺确认");
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateOrder(ProductionOrderDTO dto) {
        if (dto.getId() == null) {
            throw new BusinessException("工单ID不能为空");
        }

        ProductionOrder exist = getOrderById(dto.getId());

        if (exist.getIsCraftConfirmed() != null && exist.getIsCraftConfirmed() == 1) {
            throw new BusinessException("工艺已确认，无法修改工单");
        }

        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionOrder::getOrderNo, dto.getOrderNo());
        wrapper.eq(ProductionOrder::getIsDeleted, 0);
        wrapper.ne(ProductionOrder::getId, dto.getId());
        Long count = this.baseMapper.selectCount(wrapper);
        if (count > 0) {
            throw new BusinessException("工单编号已存在");
        }

        if (!dto.getCategoryId().equals(exist.getCategoryId())) {
            validateCategory(dto.getCategoryId());
        }

        ProductionOrder order = new ProductionOrder();
        BeanUtils.copyProperties(dto, order);
        this.baseMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteOrder(Long id) {
        ProductionOrder order = getOrderById(id);

        if (order.getIsCraftConfirmed() != null && order.getIsCraftConfirmed() == 1) {
            materialArchiveService.unlockAllMaterialByOrder(id);
        }

        this.baseMapper.deleteById(id);
    }

    public ProductionOrder getOrderById(Long id) {
        ProductionOrder order = this.baseMapper.selectById(id);
        if (order == null || order.getIsDeleted() == 1) {
            throw new BusinessException("工单不存在");
        }
        return order;
    }

    public Page<ProductionOrder> getOrderPage(
            Integer pageNum, Integer pageSize, String orderNo,
            Integer orderStatus, Long categoryId) {
        Page<ProductionOrder> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionOrder::getIsDeleted, 0);
        if (StringUtils.hasText(orderNo)) {
            wrapper.like(ProductionOrder::getOrderNo, orderNo);
        }
        if (orderStatus != null) {
            wrapper.eq(ProductionOrder::getOrderStatus, orderStatus);
        }
        if (categoryId != null) {
            wrapper.eq(ProductionOrder::getCategoryId, categoryId);
        }
        wrapper.orderByDesc(ProductionOrder::getCreateTime);
        return this.baseMapper.selectPage(page, wrapper);
    }

    public List<OrderMaterial> getOrderMaterials(Long orderId) {
        return orderMaterialMapper.selectByOrderId(orderId);
    }

    public List<OrderStatusLog> getOrderStatusLogs(Long orderId) {
        LambdaQueryWrapper<OrderStatusLog> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderStatusLog::getOrderId, orderId);
        wrapper.orderByAsc(OrderStatusLog::getCreateTime);
        return orderStatusLogMapper.selectList(wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    public void startProcessing(Long orderId, Integer targetStatus) {
        ProductionOrder order = getOrderById(orderId);

        if (order.getIsCraftConfirmed() == null || order.getIsCraftConfirmed() == 0) {
            throw new BusinessException("请先确认工艺");
        }

        validateStatusTransition(order.getOrderStatus(), targetStatus);

        if (targetStatus == 3 && order.getStartTime() == null) {
            order.setStartTime(LocalDateTime.now());
            SysUser user = sysUserMapper.selectById(UserContext.getUserId());
            if (user != null) {
                order.setWorkerId(user.getId());
                order.setWorkerName(user.getRealName());
            }
        }

        Integer fromStatus = order.getOrderStatus();
        order.setOrderStatus(targetStatus);
        this.baseMapper.updateById(order);

        String desc = getStatusDescription(targetStatus);
        saveStatusLog(orderId, order.getOrderNo(), fromStatus, targetStatus, desc);
    }

    @Transactional(rollbackFor = Exception.class)
    public void completeOrder(OrderCompleteDTO dto) {
        ProductionOrder order = getOrderById(dto.getOrderId());

        if (order.getOrderStatus() < 7) {
            throw new BusinessException("请先完成所有工序");
        }
        if (order.getOrderStatus() == 9) {
            throw new BusinessException("工单已完成");
        }

        List<OrderMaterial> materials = orderMaterialMapper.selectByOrderId(dto.getOrderId());
        BigDecimal materialCost = BigDecimal.ZERO;
        for (OrderMaterial material : materials) {
            materialCost = materialCost.add(material.getTotalPrice());
            materialArchiveService.consumeMaterial(
                dto.getOrderId(),
                material.getMaterialId(),
                material.getUsageQuantity()
            );
        }

        BigDecimal laborCost = dto.getLaborCost() != null ? dto.getLaborCost() : BigDecimal.ZERO;
        BigDecimal processLossCost = dto.getProcessLossCost() != null ? dto.getProcessLossCost() : BigDecimal.ZERO;
        BigDecimal defectiveCost = dto.getDefectiveCost() != null ? dto.getDefectiveCost() : BigDecimal.ZERO;
        BigDecimal totalCost = materialCost.add(laborCost).add(processLossCost).add(defectiveCost);
        BigDecimal unitCost = BigDecimal.ZERO;
        if (dto.getActualQuantity() > 0) {
            unitCost = totalCost.divide(new BigDecimal(dto.getActualQuantity()), 2, BigDecimal.ROUND_HALF_UP);
        }

        order.setActualQuantity(dto.getActualQuantity());
        order.setDefectiveQuantity(dto.getDefectiveQuantity() != null ? dto.getDefectiveQuantity() : 0);
        order.setMaterialCost(materialCost);
        order.setLaborCost(laborCost);
        order.setProcessLossCost(processLossCost);
        order.setDefectiveCost(defectiveCost);
        order.setTotalCost(totalCost);
        order.setUnitCost(unitCost);
        order.setActualFinishTime(LocalDateTime.now());
        order.setOrderStatus(9);
        order.setRemark(dto.getRemark());
        this.baseMapper.updateById(order);

        saveStatusLog(order.getId(), order.getOrderNo(), 8, 9, "工单完成入库");
    }

    @Transactional(rollbackFor = Exception.class)
    public void pauseOrder(Long id) {
        ProductionOrder order = getOrderById(id);

        if (order.getOrderStatus() == 10) {
            throw new BusinessException("工单已暂停");
        }
        if (order.getOrderStatus() == 9) {
            throw new BusinessException("工单已完成，不能暂停");
        }

        if (order.getIsCraftConfirmed() != null && order.getIsCraftConfirmed() == 1) {
            materialArchiveService.unlockAllMaterialByOrder(id);
        }

        Integer fromStatus = order.getOrderStatus();
        order.setOrderStatus(10);
        this.baseMapper.updateById(order);

        saveStatusLog(id, order.getOrderNo(), fromStatus, 10, "工单暂停");
    }

    @Transactional(rollbackFor = Exception.class)
    public void resumeOrder(Long id) {
        ProductionOrder order = getOrderById(id);

        if (order.getOrderStatus() != 10) {
            throw new BusinessException("仅已暂停的工单可恢复");
        }

        order.setOrderStatus(1);
        order.setIsTimeout(0);
        order.setIsCraftConfirmed(0);
        this.baseMapper.updateById(order);

        saveStatusLog(id, order.getOrderNo(), 10, 1, "工单恢复");
    }

    @Transactional(rollbackFor = Exception.class)
    public void processTimeoutOrders() {
        List<Integer> processingStatus = List.of(1, 2, 3, 4, 5, 6, 7);
        List<ProductionOrder> timeoutOrders = this.baseMapper.selectTimeoutOrders(processingStatus);
        for (ProductionOrder order : timeoutOrders) {
            if (order.getIsCraftConfirmed() != null && order.getIsCraftConfirmed() == 1) {
                materialArchiveService.unlockAllMaterialByOrder(order.getId());
            }

            Integer fromStatus = order.getOrderStatus();
            order.setOrderStatus(10);
            order.setIsTimeout(1);
            this.baseMapper.updateById(order);

            saveStatusLog(order.getId(), order.getOrderNo(), fromStatus, 10, "工单超时自动暂停");
        }
    }

    private void validateCategory(Long categoryId) {
        if (categoryId == null) {
            throw new BusinessException("笔型类目不能为空");
        }
        BrushCategory category = brushCategoryMapper.selectById(categoryId);
        if (category == null || category.getIsDeleted() == 1) {
            throw new BusinessException("关联类目不存在");
        }
        if (category.getStatus() == 0) {
            throw new BusinessException("该类目已下架停产，不能创建生产工单");
        }
    }

    private void initOrder(ProductionOrder order) {
        if (order.getPriority() == null) {
            order.setPriority(2);
        }
        order.setOrderStatus(1);
        order.setIsTimeout(0);
        order.setIsCraftConfirmed(0);
        if (order.getActualQuantity() == null) {
            order.setActualQuantity(0);
        }
        if (order.getDefectiveQuantity() == null) {
            order.setDefectiveQuantity(0);
        }
    }

    private void saveStatusLog(Long orderId, String orderNo, Integer fromStatus, Integer toStatus, String desc) {
        OrderStatusLog log = new OrderStatusLog();
        log.setOrderId(orderId);
        log.setOrderNo(orderNo);
        log.setFromStatus(fromStatus);
        log.setToStatus(toStatus);
        log.setOperationDesc(desc);
        log.setOperatorId(UserContext.getUserId());
        log.setOperatorName(UserContext.getUsername());
        log.setCreateTime(LocalDateTime.now());
        orderStatusLogMapper.insert(log);
    }

    private void validateStatusTransition(Integer currentStatus, Integer targetStatus) {
        if (targetStatus < 2 || targetStatus > 8) {
            throw new BusinessException("无效的状态");
        }
        if (!targetStatus.equals(currentStatus + 1)) {
            throw new BusinessException("工单状态必须按顺序流转");
        }
    }

    private String getStatusDescription(Integer status) {
        switch (status) {
            case 1: return "待开工";
            case 2: return "工艺确认";
            case 3: return "毛料梳理脱脂中";
            case 4: return "笔尖塑形中";
            case 5: return "笔杆修磨中";
            case 6: return "组合嵌装中";
            case 7: return "修锋整笔中";
            case 8: return "待验收";
            case 9: return "已完成";
            case 10: return "已暂停";
            default: return "未知状态";
        }
    }
}
