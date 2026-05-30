package com.horncomb.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.horncomb.annotation.OperationLog;
import com.horncomb.common.BusinessException;
import com.horncomb.common.Constants;
import com.horncomb.dto.WorkOrderDTO;
import com.horncomb.dto.WorkOrderStatusDTO;
import com.horncomb.entity.CombCategory;
import com.horncomb.entity.HornMaterial;
import com.horncomb.entity.ProductionWorkOrder;
import com.horncomb.mapper.CombCategoryMapper;
import com.horncomb.mapper.HornMaterialMapper;
import com.horncomb.mapper.ProductionWorkOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class ProductionWorkOrderService {

    private final ProductionWorkOrderMapper workOrderMapper;
    private final HornMaterialMapper hornMaterialMapper;
    private final CombCategoryMapper combCategoryMapper;
    private final HornMaterialService hornMaterialService;

    public IPage<ProductionWorkOrder> page(int pageNum, int pageSize, String status, Long craftsmanId, Long categoryId) {
        Page<ProductionWorkOrder> page = new Page<>(pageNum, pageSize);
        return workOrderMapper.selectPage(page,
                new LambdaQueryWrapper<ProductionWorkOrder>()
                        .eq(StringUtils.hasText(status), ProductionWorkOrder::getStatus, status)
                        .eq(craftsmanId != null, ProductionWorkOrder::getCraftsmanId, craftsmanId)
                        .eq(categoryId != null, ProductionWorkOrder::getCategoryId, categoryId)
                        .orderByDesc(ProductionWorkOrder::getCreateTime)
        );
    }

    public ProductionWorkOrder getById(Long id) {
        ProductionWorkOrder order = workOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        return order;
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "工单管理", type = "创建", description = "创建生产工单")
    public void create(WorkOrderDTO dto) {
        CombCategory category = combCategoryMapper.selectById(dto.getCategoryId());
        if (category == null) {
            throw new BusinessException("梳型类目不存在");
        }
        if (category.getStatus() == 0) {
            throw new BusinessException("该梳型款式已下架，无法创建工单");
        }

        HornMaterial material = hornMaterialMapper.selectById(dto.getMaterialId());
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        if (material.getQuantity() < dto.getProductionQuantity()) {
            throw new BusinessException("原料库存不足，无法创建工单");
        }
        if (Constants.STOCK_STATUS_OUT.equals(material.getStockStatus())) {
            throw new BusinessException("原料已断货，无法创建工单");
        }

        ProductionWorkOrder order = new ProductionWorkOrder();
        BeanUtils.copyProperties(dto, order);
        order.setId(null);
        order.setOrderNo(generateOrderNo());
        order.setMaterialBatchNo(material.getBatchNo());
        order.setStatus(Constants.ORDER_STATUS_PENDING);
        order.setPassQuantity(0);
        order.setFailQuantity(0);
        order.setLockQuantity(dto.getProductionQuantity());
        order.setConsumableCost(dto.getConsumableCost() != null ? dto.getConsumableCost() : BigDecimal.ZERO);

        BigDecimal materialCost = material.getUnitPrice().multiply(dto.getMaterialUsage() != null ? dto.getMaterialUsage() : BigDecimal.ZERO);
        order.setMaterialCost(materialCost);

        if (dto.getHourlyWage() != null && dto.getWorkHours() != null) {
            order.setTotalLaborCost(dto.getHourlyWage().multiply(dto.getWorkHours()));
        }

        workOrderMapper.insert(order);

        hornMaterialService.lockStock(dto.getMaterialId(), dto.getProductionQuantity(), order.getId());
    }

    private String generateOrderNo() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        Random random = new Random();
        int suffix = random.nextInt(1000);
        return "WO" + date + String.format("%03d", suffix);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "工单管理", type = "状态流转", description = "工单状态变更")
    public void updateStatus(WorkOrderStatusDTO dto) {
        ProductionWorkOrder order = workOrderMapper.selectById(dto.getId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (Constants.ORDER_STATUS_FINISHED.equals(order.getStatus())) {
            throw new BusinessException("工单已完成，无法修改状态");
        }
        if (Constants.ORDER_STATUS_SUSPENDED.equals(order.getStatus())) {
            throw new BusinessException("工单已搁置，无法修改状态");
        }

        String newStatus = dto.getStatus();
        String currentStatus = order.getStatus();

        validateStatusTransition(currentStatus, newStatus);

        LocalDateTime now = LocalDateTime.now();

        switch (newStatus) {
            case "CUTTING":
                order.setCutStartTime(now);
                break;
            case "GRINDING":
                order.setCutEndTime(now);
                order.setGrindStartTime(now);
                break;
            case "CARVING":
                order.setGrindEndTime(now);
                order.setCarveStartTime(now);
                break;
            case "POLISHING":
                order.setCarveEndTime(now);
                order.setPolishStartTime(now);
                break;
            case "TRIMMING":
                order.setPolishEndTime(now);
                order.setTrimStartTime(now);
                break;
            case "INSPECTING":
                order.setTrimEndTime(now);
                order.setInspectStartTime(now);
                break;
            case "FINISHED":
                order.setInspectEndTime(now);
                if (dto.getPassQuantity() != null) {
                    order.setPassQuantity(dto.getPassQuantity());
                }
                if (dto.getFailQuantity() != null) {
                    order.setFailQuantity(dto.getFailQuantity());
                }
                if (dto.getWorkHours() != null) {
                    order.setWorkHours(dto.getWorkHours());
                    if (order.getHourlyWage() != null) {
                        order.setTotalLaborCost(order.getHourlyWage().multiply(dto.getWorkHours()));
                    }
                }
                calculateProductionCost(order);
                break;
            default:
                throw new BusinessException("无效的工单状态");
        }

        order.setStatus(newStatus);
        workOrderMapper.updateById(order);
    }

    private void validateStatusTransition(String currentStatus, String newStatus) {
        List<String> validTransitions = getValidNextStatuses(currentStatus);
        if (!validTransitions.contains(newStatus)) {
            throw new BusinessException("无法从当前状态流转到目标状态");
        }
    }

    private List<String> getValidNextStatuses(String currentStatus) {
        return switch (currentStatus) {
            case "PENDING" -> List.of("CUTTING");
            case "CUTTING" -> List.of("GRINDING");
            case "GRINDING" -> List.of("CARVING");
            case "CARVING" -> List.of("POLISHING");
            case "POLISHING" -> List.of("TRIMMING");
            case "TRIMMING" -> List.of("INSPECTING");
            case "INSPECTING" -> List.of("FINISHED");
            default -> List.of();
        };
    }

    private void calculateProductionCost(ProductionWorkOrder order) {
        int totalProduced = order.getPassQuantity() + order.getFailQuantity();

        BigDecimal totalMaterialUsed = order.getMaterialCost();

        BigDecimal materialWastageCost = BigDecimal.ZERO;
        if (order.getFailQuantity() > 0) {
            double failRatio = (double) order.getFailQuantity() / totalProduced;
            materialWastageCost = totalMaterialUsed.multiply(new BigDecimal(failRatio * 0.5));
        }

        BigDecimal processWastageCost = order.getMaterialCost().multiply(new BigDecimal("0.05"));

        BigDecimal totalLaborCost = order.getTotalLaborCost() != null ? order.getTotalLaborCost() : BigDecimal.ZERO;
        BigDecimal consumableCost = order.getConsumableCost() != null ? order.getConsumableCost() : BigDecimal.ZERO;

        BigDecimal totalCost = totalMaterialUsed
                .add(totalLaborCost)
                .add(consumableCost)
                .add(materialWastageCost)
                .add(processWastageCost);

        BigDecimal unitCost = BigDecimal.ZERO;
        if (order.getPassQuantity() > 0) {
            unitCost = totalCost.divide(new BigDecimal(order.getPassQuantity()), 4, RoundingMode.HALF_UP);
        }

        order.setMaterialWastageCost(materialWastageCost);
        order.setProcessWastageCost(processWastageCost);
        order.setTotalCost(totalCost);
        order.setUnitCost(unitCost);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "工单管理", type = "搁置", description = "搁置工单")
    public void suspend(Long id) {
        ProductionWorkOrder order = workOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (Constants.ORDER_STATUS_FINISHED.equals(order.getStatus())) {
            throw new BusinessException("工单已完成，无法搁置");
        }

        if (order.getLockQuantity() != null && order.getLockQuantity() > 0) {
            hornMaterialService.unlockStock(order.getMaterialId(), order.getLockQuantity());
            order.setLockQuantity(0);
        }

        order.setStatus(Constants.ORDER_STATUS_SUSPENDED);
        workOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "工单管理", type = "重启", description = "重启搁置工单")
    public void restart(Long id) {
        ProductionWorkOrder order = workOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!Constants.ORDER_STATUS_SUSPENDED.equals(order.getStatus())) {
            throw new BusinessException("只有搁置的工单才能重启");
        }

        HornMaterial material = hornMaterialMapper.selectById(order.getMaterialId());
        if (material == null || material.getQuantity() < order.getProductionQuantity()) {
            throw new BusinessException("原料库存不足，无法重启工单");
        }

        hornMaterialService.lockStock(order.getMaterialId(), order.getProductionQuantity(), id);
        order.setLockQuantity(order.getProductionQuantity());
        order.setStatus(Constants.ORDER_STATUS_PENDING);
        workOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "工单管理", type = "删除", description = "删除工单")
    public void delete(Long id) {
        ProductionWorkOrder order = workOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        if (!Constants.ORDER_STATUS_FINISHED.equals(order.getStatus())
                && order.getLockQuantity() != null && order.getLockQuantity() > 0) {
            hornMaterialService.unlockStock(order.getMaterialId(), order.getLockQuantity());
        }

        workOrderMapper.deleteById(id);
    }
}
