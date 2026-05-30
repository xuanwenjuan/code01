package com.foundry.impeller.service;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.foundry.impeller.annotation.OperationLog;
import com.foundry.impeller.dto.WorkOrderMaterialDTO;
import com.foundry.impeller.dto.WorkOrderStatusDTO;
import com.foundry.impeller.entity.*;
import com.foundry.impeller.enums.WorkOrderStatus;
import com.foundry.impeller.exception.BusinessException;
import com.foundry.impeller.mapper.*;
import com.foundry.impeller.util.UserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionWorkOrderService {

    private final ProductionWorkOrderMapper workOrderMapper;
    private final WorkOrderMaterialMapper workOrderMaterialMapper;
    private final ProductionLogMapper productionLogMapper;
    private final MaterialMapper materialMapper;
    private final MaterialService materialService;
    private final CostAccountingService costAccountingService;
    private final ProductCategoryService categoryService;

    public Page<ProductionWorkOrder> list(int page, int size, String status) {
        LambdaQueryWrapper<ProductionWorkOrder> wrapper = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            wrapper.eq(ProductionWorkOrder::getStatus, status);
        }
        wrapper.orderByDesc(ProductionWorkOrder::getCreateTime);
        return workOrderMapper.selectPage(new Page<>(page, size), wrapper);
    }

    public ProductionWorkOrder getDetail(Long id) {
        ProductionWorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            return null;
        }
        LambdaQueryWrapper<WorkOrderMaterial> materialWrapper = new LambdaQueryWrapper<>();
        materialWrapper.eq(WorkOrderMaterial::getWorkOrderId, id);
        workOrder.setMaterials(workOrderMaterialMapper.selectList(materialWrapper));

        LambdaQueryWrapper<ProductionLog> logWrapper = new LambdaQueryWrapper<>();
        logWrapper.eq(ProductionLog::getWorkOrderId, id)
                .orderByAsc(ProductionLog::getCreateTime);
        workOrder.setLogs(productionLogMapper.selectList(logWrapper));
        return workOrder;
    }

    @Transactional(rollbackFor = Exception.class)
    public void create(ProductionWorkOrder workOrder) {
        categoryService.checkCategoryAvailable(workOrder.getProductCategoryId());

        String workOrderNo = "WO" + DateUtil.format(LocalDateTime.now(), "yyyyMMddHHmmss");
        workOrder.setWorkOrderNo(workOrderNo);
        workOrder.setStatus(WorkOrderStatus.PENDING.getCode());
        workOrder.setActualQuantity(0);
        workOrder.setDefectiveQuantity(0);
        workOrderMapper.insert(workOrder);

        if (workOrder.getMaterials() != null && !workOrder.getMaterials().isEmpty()) {
            for (WorkOrderMaterial material : workOrder.getMaterials()) {
                material.setWorkOrderId(workOrder.getId());
                workOrderMaterialMapper.insert(material);
            }
        }

        saveProductionLog(workOrder.getId(), "创建工单", "创建生产工单，工单号：" + workOrderNo);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(value = "状态流转", module = "生产工单")
    public void processStatus(WorkOrderStatusDTO statusDTO) {
        ProductionWorkOrder workOrder = workOrderMapper.selectById(statusDTO.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        WorkOrderStatus currentStatus = WorkOrderStatus.valueOf(workOrder.getStatus());
        if (WorkOrderStatus.FINISHED.equals(currentStatus)) {
            throw new BusinessException("工单已完成，无法继续流转");
        }
        if (WorkOrderStatus.FROZEN.equals(currentStatus)) {
            throw new BusinessException("工单已冻结，无法继续流转");
        }

        checkRolePermission(currentStatus);

        WorkOrderStatus nextStatus = WorkOrderStatus.getNextStatus(currentStatus);
        if (nextStatus == null) {
            throw new BusinessException("当前工单状态无法继续流转");
        }

        if (WorkOrderStatus.PENDING.equals(currentStatus)) {
            workOrder.setActualStartTime(LocalDateTime.now());
            if (statusDTO.getMaterials() != null && !statusDTO.getMaterials().isEmpty()) {
                List<MaterialStockLock> lockList = new ArrayList<>();
                for (WorkOrderMaterialDTO materialDTO : statusDTO.getMaterials()) {
                    MaterialStockLock lock = new MaterialStockLock();
                    lock.setMaterialId(materialDTO.getMaterialId());
                    lock.setMaterialName(materialDTO.getMaterialName());
                    lock.setLockQuantity(materialDTO.getUsageQuantity());
                    lock.setLockType("PRODUCTION");
                    lockList.add(lock);
                }
                materialService.lockStock(workOrder.getId(), lockList);
            }
        }

        if (statusDTO.getActualQuantity() != null) {
            workOrder.setActualQuantity(statusDTO.getActualQuantity());
        }
        if (statusDTO.getDefectiveQuantity() != null) {
            workOrder.setDefectiveQuantity(statusDTO.getDefectiveQuantity());
        }

        if (WorkOrderStatus.FINISHED.equals(nextStatus)) {
            workOrder.setFinishTime(LocalDateTime.now());
            materialService.deductStock(workOrder.getId());
            if (statusDTO.getMaterials() != null && !statusDTO.getMaterials().isEmpty()) {
                for (WorkOrderMaterialDTO materialDTO : statusDTO.getMaterials()) {
                    WorkOrderMaterial workOrderMaterial = new WorkOrderMaterial();
                    workOrderMaterial.setWorkOrderId(workOrder.getId());
                    workOrderMaterial.setMaterialId(materialDTO.getMaterialId());
                    workOrderMaterial.setMaterialName(materialDTO.getMaterialName());
                    workOrderMaterial.setUsageQuantity(materialDTO.getUsageQuantity());
                    workOrderMaterial.setUnit(materialDTO.getUnit());
                    workOrderMaterialMapper.insert(workOrderMaterial);
                }
            }
            generateCostAccounting(workOrder);
        }

        workOrder.setStatus(nextStatus.getCode());
        workOrderMapper.updateById(workOrder);

        String content = statusDTO.getRemark() != null ? statusDTO.getRemark() : "";
        saveProductionLog(workOrder.getId(), nextStatus.getDesc(), content);
    }

    private void generateCostAccounting(ProductionWorkOrder workOrder) {
        CostAccounting costAccounting = new CostAccounting();
        costAccounting.setStatisticsDate(LocalDate.now());
        costAccounting.setProductCategoryId(workOrder.getProductCategoryId());
        costAccounting.setProductCategoryName(categoryService.getById(workOrder.getProductCategoryId()).getCategoryName());
        costAccounting.setProductionQuantity(workOrder.getActualQuantity() != null ? workOrder.getActualQuantity() : 0);

        BigDecimal rawMaterialCost = calculateRawMaterialCost(workOrder.getId());
        costAccounting.setRawMaterialCost(rawMaterialCost);

        BigDecimal sandMaterialCost = calculateSandMaterialCost();
        costAccounting.setSandMaterialCost(sandMaterialCost);

        BigDecimal energyCost = calculateEnergyCost(workOrder.getActualQuantity());
        costAccounting.setEnergyCost(energyCost);

        BigDecimal laborCost = calculateLaborCost(workOrder.getActualQuantity());
        costAccounting.setLaborCost(laborCost);

        BigDecimal defectiveCost = calculateDefectiveCost(workOrder.getId());
        costAccounting.setDefectiveCost(defectiveCost);

        costAccountingService.create(costAccounting);
    }

    private BigDecimal calculateRawMaterialCost(Long workOrderId) {
        LambdaQueryWrapper<WorkOrderMaterial> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrderMaterial::getWorkOrderId, workOrderId);
        List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectList(wrapper);
        BigDecimal total = BigDecimal.ZERO;
        for (WorkOrderMaterial material : materials) {
            Material m = materialMapper.selectById(material.getMaterialId());
            if (m != null && m.getUnitPrice() != null) {
                total = total.add(m.getUnitPrice().multiply(material.getUsageQuantity()));
            }
        }
        return total;
    }

    private BigDecimal calculateSandMaterialCost() {
        return new BigDecimal("100");
    }

    private BigDecimal calculateEnergyCost(Integer quantity) {
        if (quantity == null || quantity == 0) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal("50").multiply(new BigDecimal(quantity));
    }

    private BigDecimal calculateLaborCost(Integer quantity) {
        if (quantity == null || quantity == 0) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal("30").multiply(new BigDecimal(quantity));
    }

    private BigDecimal calculateDefectiveCost(Long workOrderId) {
        return new BigDecimal("0");
    }

    @Transactional(rollbackFor = Exception.class)
    public void freezeOrder(Long id) {
        ProductionWorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (!WorkOrderStatus.PENDING.getCode().equals(workOrder.getStatus())) {
            throw new BusinessException("只有待开炉的工单可以冻结");
        }
        workOrder.setStatus(WorkOrderStatus.FROZEN.getCode());
        workOrderMapper.updateById(workOrder);
        saveProductionLog(id, "冻结工单", "冻结超时未开炉工单");
    }

    public List<ProductionWorkOrder> getPendingTimeoutOrders() {
        LambdaQueryWrapper<ProductionWorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionWorkOrder::getStatus, WorkOrderStatus.PENDING.getCode())
                .lt(ProductionWorkOrder::getPlanStartTime, LocalDateTime.now().minusHours(24));
        return workOrderMapper.selectList(wrapper);
    }

    private void saveProductionLog(Long workOrderId, String operationType, String content) {
        ProductionLog log = new ProductionLog();
        log.setWorkOrderId(workOrderId);
        log.setOperationType(operationType);
        log.setOperationContent(content);
        log.setOperatorId(UserContext.getUserId());
        log.setOperatorName(UserContext.getUsername());
        log.setOperatorRole(UserContext.getRole());
        productionLogMapper.insert(log);
    }

    private void checkRolePermission(WorkOrderStatus currentStatus) {
        String currentRole = UserContext.getRole();
        if (currentRole == null) {
            throw new BusinessException(401, "用户未登录");
        }

        boolean hasPermission = switch (currentStatus) {
            case PENDING, MELTING, SAND_MOLDING, COOLING -> "PROCESS".equals(currentRole) || "ADMIN".equals(currentRole);
            case GRINDING, BALANCING -> "TEAM_LEADER".equals(currentRole) || "ADMIN".equals(currentRole);
            case ANTIRUST -> "INSPECTOR".equals(currentRole) || "ADMIN".equals(currentRole);
            default -> false;
        };

        if (!hasPermission) {
            throw new BusinessException(403, "当前角色无权限执行此操作");
        }
    }

    public void delete(Long id) {
        workOrderMapper.deleteById(id);
    }
}
