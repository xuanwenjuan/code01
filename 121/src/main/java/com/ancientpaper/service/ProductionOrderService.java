package com.ancientpaper.service;

import com.ancientpaper.dto.OrderMaterialDTO;
import com.ancientpaper.dto.ProductionOrderDTO;
import com.ancientpaper.entity.MaterialLockRecord;
import com.ancientpaper.entity.OrderMaterial;
import com.ancientpaper.entity.PaperCategory;
import com.ancientpaper.entity.ProductionCost;
import com.ancientpaper.entity.ProductionOrder;
import com.ancientpaper.enums.OrderStatusEnum;
import com.ancientpaper.exception.BusinessException;
import com.ancientpaper.mapper.OrderMaterialMapper;
import com.ancientpaper.mapper.PaperCategoryMapper;
import com.ancientpaper.mapper.ProductionCostMapper;
import com.ancientpaper.mapper.ProductionOrderMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionOrderService {

    private final ProductionOrderMapper orderMapper;
    private final OrderMaterialMapper orderMaterialMapper;
    private final PaperCategoryMapper categoryMapper;
    private final ForageMaterialService materialService;
    private final ProductionCostMapper productionCostMapper;

    public IPage<ProductionOrder> getOrderPage(Integer pageNum, Integer pageSize, Integer status, Long categoryId) {
        Page<ProductionOrder> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(ProductionOrder::getStatus, status);
        }
        if (categoryId != null) {
            wrapper.eq(ProductionOrder::getCategoryId, categoryId);
        }
        wrapper.orderByDesc(ProductionOrder::getCreateTime);
        return orderMapper.selectPage(page, wrapper);
    }

    public ProductionOrder getOrderById(Long id) {
        return orderMapper.selectById(id);
    }

    public List<OrderMaterial> getOrderMaterials(Long orderId) {
        return orderMaterialMapper.selectList(new LambdaQueryWrapper<OrderMaterial>()
                .eq(OrderMaterial::getOrderId, orderId));
    }

    @Transactional(rollbackFor = Exception.class)
    public void createOrder(ProductionOrderDTO dto) {
        PaperCategory category = categoryMapper.selectById(dto.getCategoryId());
        if (category == null) {
            throw new BusinessException("纸品分类不存在");
        }
        if (category.getStatus() == 0) {
            throw new BusinessException("该纸型已下架，无法创建工单");
        }

        ProductionOrder order = new ProductionOrder();
        BeanUtils.copyProperties(dto, order);
        String orderNo = generateOrderNo();
        order.setOrderNo(orderNo);
        order.setStatus(OrderStatusEnum.PENDING_SOAK.getCode());
        order.setActualQuantity(BigDecimal.ZERO);
        order.setCreateTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.insert(order);

        if (dto.getMaterials() != null && !dto.getMaterials().isEmpty()) {
            for (OrderMaterialDTO materialDTO : dto.getMaterials()) {
                materialService.lockMaterial(order.getId(), 
                    materialDTO.getMaterialId(), 
                    materialDTO.getQuantity(), 
                    "工单创建锁定原料");

                OrderMaterial orderMaterial = new OrderMaterial();
                orderMaterial.setOrderId(order.getId());
                orderMaterial.setMaterialId(materialDTO.getMaterialId());
                orderMaterial.setQuantity(materialDTO.getQuantity());
                orderMaterial.setCreateTime(LocalDateTime.now());
                orderMaterial.setUpdateTime(LocalDateTime.now());
                orderMaterialMapper.insert(orderMaterial);
            }
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void startSoak(Long id) {
        ProductionOrder order = getOrderAndCheckStatus(id, OrderStatusEnum.PENDING_SOAK.getCode());
        order.setSoakStartTime(LocalDateTime.now());
        order.setStatus(OrderStatusEnum.SOAKING.getCode());
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void finishSoak(Long id) {
        ProductionOrder order = getOrderAndCheckStatus(id, OrderStatusEnum.SOAKING.getCode());
        order.setSoakEndTime(LocalDateTime.now());
        order.setStatus(OrderStatusEnum.PENDING_PULP.getCode());
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void startPulp(Long id) {
        ProductionOrder order = getOrderAndCheckStatus(id, OrderStatusEnum.PENDING_PULP.getCode());
        order.setPulpStartTime(LocalDateTime.now());
        order.setStatus(OrderStatusEnum.PULPING.getCode());
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void finishPulp(Long id) {
        ProductionOrder order = getOrderAndCheckStatus(id, OrderStatusEnum.PULPING.getCode());
        order.setPulpEndTime(LocalDateTime.now());
        order.setStatus(OrderStatusEnum.PENDING_PAPER.getCode());
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void startPaper(Long id) {
        ProductionOrder order = getOrderAndCheckStatus(id, OrderStatusEnum.PENDING_PAPER.getCode());
        order.setPaperStartTime(LocalDateTime.now());
        order.setStatus(OrderStatusEnum.PAPERING.getCode());
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void finishPaper(Long id) {
        ProductionOrder order = getOrderAndCheckStatus(id, OrderStatusEnum.PAPERING.getCode());
        order.setPaperEndTime(LocalDateTime.now());
        order.setStatus(OrderStatusEnum.PENDING_DRY.getCode());
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void startDry(Long id) {
        ProductionOrder order = getOrderAndCheckStatus(id, OrderStatusEnum.PENDING_DRY.getCode());
        order.setDryStartTime(LocalDateTime.now());
        order.setStatus(OrderStatusEnum.DRYING.getCode());
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void finishDry(Long id) {
        ProductionOrder order = getOrderAndCheckStatus(id, OrderStatusEnum.DRYING.getCode());
        order.setDryEndTime(LocalDateTime.now());
        order.setStatus(OrderStatusEnum.PENDING_CALENDER.getCode());
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void startCalender(Long id) {
        ProductionOrder order = getOrderAndCheckStatus(id, OrderStatusEnum.PENDING_CALENDER.getCode());
        order.setCalenderStartTime(LocalDateTime.now());
        order.setStatus(OrderStatusEnum.CALENDERING.getCode());
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void finishCalender(Long id) {
        ProductionOrder order = getOrderAndCheckStatus(id, OrderStatusEnum.CALENDERING.getCode());
        order.setCalenderEndTime(LocalDateTime.now());
        order.setStatus(OrderStatusEnum.PENDING_CUT.getCode());
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void startCut(Long id) {
        ProductionOrder order = getOrderAndCheckStatus(id, OrderStatusEnum.PENDING_CUT.getCode());
        order.setCutStartTime(LocalDateTime.now());
        order.setStatus(OrderStatusEnum.CUTTING.getCode());
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void finishCut(Long id, BigDecimal actualQuantity) {
        ProductionOrder order = getOrderAndCheckStatus(id, OrderStatusEnum.CUTTING.getCode());
        order.setCutEndTime(LocalDateTime.now());
        order.setActualQuantity(actualQuantity);
        order.setStatus(OrderStatusEnum.PENDING_WAREHOUSE.getCode());
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void inWarehouse(Long id, BigDecimal laborCost, BigDecimal workHourCost,
                             BigDecimal waterCost, BigDecimal energyCost,
                             BigDecimal equipmentLoss, BigDecimal wasteRate) {
        ProductionOrder order = getOrderAndCheckStatus(id, OrderStatusEnum.PENDING_WAREHOUSE.getCode());
        order.setInWarehouseTime(LocalDateTime.now());
        order.setStatus(OrderStatusEnum.FINISHED.getCode());
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.updateById(order);

        List<OrderMaterial> orderMaterials = getOrderMaterials(id);
        for (OrderMaterial om : orderMaterials) {
            materialService.consumeLockedMaterial(id, om.getMaterialId());
        }

        ProductionCost cost = new ProductionCost();
        cost.setOrderId(id);
        cost.setCategoryId(order.getCategoryId());
        cost.setLaborCost(laborCost);
        cost.setWorkHourCost(workHourCost);
        cost.setWaterCost(waterCost);
        cost.setEnergyCost(energyCost);
        cost.setEquipmentLoss(equipmentLoss);
        cost.setWasteRate(wasteRate);
        cost.setProductionQuantity(order.getActualQuantity());
        cost.setCreateTime(LocalDateTime.now());
        cost.setUpdateTime(LocalDateTime.now());

        BigDecimal totalMaterialCost = BigDecimal.ZERO;
        for (OrderMaterial om : orderMaterials) {
            totalMaterialCost = totalMaterialCost.add(
                om.getQuantity().multiply(BigDecimal.valueOf(10))
            );
        }
        cost.setMaterialCost(totalMaterialCost);

        BigDecimal totalCost = totalMaterialCost
            .add(laborCost)
            .add(workHourCost)
            .add(waterCost)
            .add(energyCost)
            .add(equipmentLoss);
        cost.setTotalCost(totalCost);

        if (order.getActualQuantity().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal unitCost = totalCost.divide(order.getActualQuantity(), 2, 
                java.math.RoundingMode.HALF_UP);
            cost.setUnitCost(unitCost);
        }

        productionCostMapper.insert(cost);
    }

    @Transactional(rollbackFor = Exception.class)
    public void cancelOrder(Long id, String reason) {
        ProductionOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (order.getStatus().equals(OrderStatusEnum.FINISHED.getCode())) {
            throw new BusinessException("已完工工单无法取消");
        }

        order.setStatus(OrderStatusEnum.CANCELLED.getCode());
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.updateById(order);

        List<OrderMaterial> orderMaterials = getOrderMaterials(id);
        for (OrderMaterial om : orderMaterials) {
            materialService.unlockMaterial(id, om.getMaterialId());
        }
    }

    private ProductionOrder getOrderAndCheckStatus(Long id, Integer expectedStatus) {
        ProductionOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!order.getStatus().equals(expectedStatus)) {
            throw new BusinessException("工单状态不正确，当前状态: " + 
                getStatusDesc(order.getStatus()));
        }
        return order;
    }

    private String generateOrderNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        Long count = orderMapper.selectCount(new LambdaQueryWrapper<ProductionOrder>()
                .apply("DATE_FORMAT(create_time, '%Y%m%d') = {0}", dateStr));
        return "PO" + dateStr + String.format("%04d", count + 1);
    }

    private String getStatusDesc(Integer status) {
        for (OrderStatusEnum e : OrderStatusEnum.values()) {
            if (e.getCode().equals(status)) {
                return e.getDesc();
            }
        }
        return "未知状态";
    }
}
