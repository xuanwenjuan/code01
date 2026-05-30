package com.camping.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.camping.annotation.RequiresRole;
import com.camping.context.UserContext;
import com.camping.dto.MaterialQueryDTO;
import com.camping.dto.OrderMaterialAllocateDTO;
import com.camping.dto.StockLossRegisterDTO;
import com.camping.entity.*;
import com.camping.enums.*;
import com.camping.exception.BusinessException;
import com.camping.mapper.*;
import com.camping.vo.MaterialVO;
import com.camping.vo.OrderCostDetailVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MaterialService extends ServiceImpl<MaterialMapper, Material> {

    private final StringRedisTemplate stringRedisTemplate;
    private final StockLockMapper stockLockMapper;
    private final StockLossMapper stockLossMapper;
    private final GroupOrderMapper groupOrderMapper;
    private final OrderMaterialMapper orderMaterialMapper;
    private final SysUserMapper sysUserMapper;

    private static final String CATEGORY_TREE_KEY = "category:tree:all";
    private static final String MATERIAL_STOCK_KEY = "material:stock:";

    public Page<MaterialVO> queryPage(MaterialQueryDTO dto) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        if (dto.getKeyword() != null && !dto.getKeyword().isEmpty()) {
            wrapper.and(w -> w.like(Material::getName, dto.getKeyword())
                    .or().like(Material::getBatchCode, dto.getKeyword())
                    .or().like(Material::getSpec, dto.getKeyword()));
        }
        if (dto.getType() != null) {
            wrapper.eq(Material::getType, dto.getType());
        }
        if (dto.getStatus() != null) {
            wrapper.eq(Material::getStatus, dto.getStatus());
        }
        if (dto.getBatchCode() != null && !dto.getBatchCode().isEmpty()) {
            wrapper.like(Material::getBatchCode, dto.getBatchCode());
        }
        wrapper.orderByDesc(Material::getCreateTime);

        Page<Material> page = page(new Page<>(dto.getPageNum(), dto.getPageSize()), wrapper);
        Page<MaterialVO> voPage = new Page<>();
        BeanUtils.copyProperties(page, voPage);
        voPage.setRecords(page.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList()));
        return voPage;
    }

    private MaterialVO convertToVO(Material material) {
        MaterialVO vo = new MaterialVO();
        BeanUtils.copyProperties(material, vo);
        vo.setTypeName(EnumUtils.getMaterialTypeName(material.getType()));
        vo.setStatusName(EnumUtils.getMaterialStatusName(material.getStatus()));
        return vo;
    }

    @RequiresRole({RoleEnum.ADMIN, RoleEnum.WAREHOUSE})
    @Transactional(rollbackFor = Exception.class)
    public void stockIn(Long materialId, BigDecimal quantity, String batchCode, String remark) {
        Material material = getById(materialId);
        if (material == null) {
            throw new BusinessException("物料不存在");
        }
        material.setQuantity(material.getQuantity().add(quantity));
        updateMaterialStatus(material);
        updateById(material);
        clearMaterialCache();
        log.info("物料入库成功，物料：{}，入库数量：{}，操作人：{}", material.getName(), quantity, UserContext.getUserId());
    }

    @Transactional(rollbackFor = Exception.class)
    public void allocateOrderMaterials(OrderMaterialAllocateDTO dto) {
        GroupOrder order = groupOrderMapper.selectById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        if (!OrderStatusEnum.PREPARE_MATERIAL.getCode().equals(order.getStatus())) {
            throw new BusinessException("当前订单状态不支持分配物料");
        }
        for (OrderMaterialAllocateDTO.MaterialItem item : dto.getMaterials()) {
            Material material = getById(item.getMaterialId());
            if (material == null) {
                throw new BusinessException("物料不存在：" + item.getMaterialId());
            }
            if (material.getQuantity().compareTo(item.getQuantity()) < 0) {
                throw new BusinessException("物料库存不足，物料：" + material.getName() + "，当前库存：" + material.getQuantity());
            }
        }
        orderMaterialMapper.delete(new LambdaQueryWrapper<OrderMaterial>()
                .eq(OrderMaterial::getOrderId, dto.getOrderId()));
        stockLockMapper.delete(new LambdaQueryWrapper<StockLock>()
                .eq(StockLock::getOrderId, dto.getOrderId())
                .eq(StockLock::getStatus, 1));
        for (OrderMaterialAllocateDTO.MaterialItem item : dto.getMaterials()) {
            OrderMaterial orderMaterial = new OrderMaterial();
            orderMaterial.setOrderId(dto.getOrderId());
            orderMaterial.setMaterialId(item.getMaterialId());
            orderMaterial.setMaterialName(item.getMaterialName());
            orderMaterial.setQuantity(item.getQuantity());
            orderMaterial.setUnitPrice(item.getUnitPrice());
            orderMaterial.setTotalPrice(item.getUnitPrice().multiply(item.getQuantity()));
            orderMaterial.setRemark(item.getRemark());
            orderMaterialMapper.insert(orderMaterial);
            StockLock stockLock = new StockLock();
            stockLock.setOrderId(dto.getOrderId());
            stockLock.setOrderNo(order.getOrderNo());
            stockLock.setMaterialId(item.getMaterialId());
            stockLock.setMaterialName(item.getMaterialName());
            stockLock.setLockQuantity(item.getQuantity());
            stockLock.setLockType(1);
            stockLock.setStatus(1);
            stockLock.setExpireTime(LocalDateTime.now().plusDays(30));
            stockLockMapper.insert(stockLock);
            Material material = getById(item.getMaterialId());
            material.setQuantity(material.getQuantity().subtract(item.getQuantity()));
            updateMaterialStatus(material);
            updateById(material);
        }
        log.info("订单物料分配成功，订单号：{}，物料数量：{}", order.getOrderNo(), dto.getMaterials().size());
    }

    @RequiresRole({RoleEnum.ADMIN, RoleEnum.WAREHOUSE})
    @Transactional(rollbackFor = Exception.class)
    public void registerStockLoss(StockLossRegisterDTO dto) {
        GroupOrder order = groupOrderMapper.selectById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        if (!OrderStatusEnum.COMPLETED.getCode().equals(order.getStatus())
                && !OrderStatusEnum.SHIPPED.getCode().equals(order.getStatus())) {
            throw new BusinessException("当前订单状态不支持损耗登记");
        }
        SysUser operator = sysUserMapper.selectById(UserContext.getUserId());
        for (StockLossRegisterDTO.LossItem item : dto.getItems()) {
            OrderMaterial orderMaterial = orderMaterialMapper.selectOne(new LambdaQueryWrapper<OrderMaterial>()
                    .eq(OrderMaterial::getOrderId, dto.getOrderId())
                    .eq(OrderMaterial::getMaterialId, item.getMaterialId()));
            if (orderMaterial == null) {
                throw new BusinessException("该订单未包含此物料：" + item.getMaterialId());
            }
            StockLoss stockLoss = new StockLoss();
            stockLoss.setOrderId(dto.getOrderId());
            stockLoss.setOrderNo(order.getOrderNo());
            stockLoss.setMaterialId(item.getMaterialId());
            stockLoss.setMaterialName(orderMaterial.getMaterialName());
            stockLoss.setLossQuantity(item.getLossQuantity());
            stockLoss.setLossType(item.getLossType());
            stockLoss.setLossReason(dto.getLossReason());
            stockLoss.setUnitPrice(orderMaterial.getUnitPrice());
            stockLoss.setTotalAmount(orderMaterial.getUnitPrice().multiply(item.getLossQuantity()));
            stockLoss.setOperatorId(UserContext.getUserId());
            stockLoss.setOperatorName(operator != null ? operator.getRealName() : "");
            stockLoss.setStatus(1);
            stockLoss.setRemark(item.getRemark());
            stockLossMapper.insert(stockLoss);
        }
        log.info("订单损耗登记成功，订单号：{}，损耗物料数量：{}", order.getOrderNo(), dto.getItems().size());
    }

    public OrderCostDetailVO calculateOrderCost(Long orderId) {
        GroupOrder order = groupOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        List<OrderMaterial> materials = orderMaterialMapper.selectList(new LambdaQueryWrapper<OrderMaterial>()
                .eq(OrderMaterial::getOrderId, orderId));
        List<StockLoss> losses = stockLossMapper.selectList(new LambdaQueryWrapper<StockLoss>()
                .eq(StockLoss::getOrderId, orderId));
        BigDecimal materialCost = materials.stream()
                .map(OrderMaterial::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal materialLossAmount = losses.stream()
                .map(StockLoss::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal processingCost = order.getTotalAmount().multiply(new BigDecimal("0.1"));
        BigDecimal shippingCost = new BigDecimal("50");
        BigDecimal operationCost = order.getTotalAmount().multiply(new BigDecimal("0.05"));
        BigDecimal totalCost = materialCost.add(materialLossAmount)
                .add(processingCost)
                .add(shippingCost)
                .add(operationCost);
        BigDecimal grossProfit = order.getTotalAmount().subtract(totalCost);
        BigDecimal grossProfitRate = order.getTotalAmount().compareTo(BigDecimal.ZERO) > 0
                ? grossProfit.divide(order.getTotalAmount(), 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
                : BigDecimal.ZERO;
        OrderCostDetailVO vo = new OrderCostDetailVO();
        vo.setOrderId(orderId);
        vo.setOrderNo(order.getOrderNo());
        vo.setGroupName(order.getGroupName());
        vo.setTotalSales(order.getTotalAmount());
        vo.setMaterialCost(materialCost);
        vo.setMaterialLossAmount(materialLossAmount);
        vo.setProcessingCost(processingCost);
        vo.setShippingCost(shippingCost);
        vo.setOperationCost(operationCost);
        vo.setTotalCost(totalCost);
        vo.setGrossProfit(grossProfit);
        vo.setGrossProfitRate(grossProfitRate);
        vo.setOrderStatus(order.getStatus());
        vo.setOrderStatusName(EnumUtils.getOrderStatusName(order.getStatus()));
        vo.setCreateTime(order.getCreateTime());
        vo.setUpdateTime(order.getUpdateTime());
        List<OrderCostDetailVO.MaterialLossItem> lossItems = losses.stream()
                .map(loss -> {
                    OrderCostDetailVO.MaterialLossItem item = new OrderCostDetailVO.MaterialLossItem();
                    item.setMaterialId(loss.getMaterialId());
                    item.setMaterialName(loss.getMaterialName());
                    item.setLossQuantity(loss.getLossQuantity());
                    item.setLossType(EnumUtils.getLossTypeName(loss.getLossType()));
                    item.setLossReason(loss.getLossReason());
                    item.setUnitPrice(loss.getUnitPrice());
                    item.setTotalAmount(loss.getTotalAmount());
                    return item;
                }).collect(Collectors.toList());
        vo.setLossItems(lossItems);
        return vo;
    }

    private void updateMaterialStatus(Material material) {
        if (material.getQuantity() == null) {
            material.setStatus(MaterialStatusEnum.SUFFICIENT.getCode());
            return;
        }
        if (material.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            material.setStatus(MaterialStatusEnum.OUT_OF_STOCK.getCode());
        } else if (material.getWarningQuantity() != null
                && material.getQuantity().compareTo(material.getWarningQuantity()) <= 0) {
            material.setStatus(MaterialStatusEnum.TIGHT.getCode());
        } else {
            material.setStatus(MaterialStatusEnum.SUFFICIENT.getCode());
        }
    }

    private void clearMaterialCache() {
        try {
            Set<String> keys = stringRedisTemplate.keys(MATERIAL_STOCK_KEY + "*");
            if (keys != null && !keys.isEmpty()) {
                stringRedisTemplate.delete(keys);
            }
        } catch (Exception e) {
            log.warn("清除物料缓存失败", e);
        }
    }

    public void releaseStockLock(Long orderId) {
        List<StockLock> locks = stockLockMapper.selectList(new LambdaQueryWrapper<StockLock>()
                .eq(StockLock::getOrderId, orderId)
                .eq(StockLock::getStatus, 1));
        for (StockLock lock : locks) {
            Material material = getById(lock.getMaterialId());
            if (material != null) {
                material.setQuantity(material.getQuantity().add(lock.getLockQuantity()));
                updateMaterialStatus(material);
                updateById(material);
            }
            lock.setStatus(2);
            stockLockMapper.updateById(lock);
        }
        log.info("订单库存已释放，订单号：{}", orderId);
    }
}
