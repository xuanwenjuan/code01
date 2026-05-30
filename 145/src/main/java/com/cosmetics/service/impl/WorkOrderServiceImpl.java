package com.cosmetics.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cosmetics.common.PageQuery;
import com.cosmetics.common.ResultCode;
import com.cosmetics.context.UserContext;
import com.cosmetics.dto.MaterialOutDTO;
import com.cosmetics.dto.ProcessRecordDTO;
import com.cosmetics.dto.WorkOrderCreateDTO;
import com.cosmetics.dto.WorkOrderMaterialDTO;
import com.cosmetics.entity.*;
import com.cosmetics.enums.WorkOrderStatusEnum;
import com.cosmetics.exception.BusinessException;
import com.cosmetics.mapper.*;
import com.cosmetics.service.MaterialBatchService;
import com.cosmetics.service.WorkOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class WorkOrderServiceImpl implements WorkOrderService {

    private final WorkOrderMapper workOrderMapper;
    private final ProductMapper productMapper;
    private final FormulaMapper formulaMapper;
    private final FormulaDetailMapper formulaDetailMapper;
    private final WorkOrderMaterialMapper workOrderMaterialMapper;
    private final MaterialMapper materialMapper;
    private final MaterialBatchMapper materialBatchMapper;
    private final WorkProcessMapper workProcessMapper;
    private final QualityInspectionMapper qualityInspectionMapper;
    private final FinishedProductMapper finishedProductMapper;
    private final CostStatisticsMapper costStatisticsMapper;
    private final UserMapper userMapper;
    private final MaterialBatchService materialBatchService;

    @Override
    public Page<WorkOrder> getPage(PageQuery pageQuery, Long productId, Integer status, Integer priority) {
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        if (productId != null) {
            wrapper.eq(WorkOrder::getProductId, productId);
        }
        if (status != null) {
            wrapper.eq(WorkOrder::getStatus, status);
        }
        if (priority != null) {
            wrapper.eq(WorkOrder::getPriority, priority);
        }
        wrapper.orderByAsc(WorkOrder::getPriority)
                .orderByDesc(WorkOrder::getCreateTime);

        return workOrderMapper.selectPage(
                new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()),
                wrapper
        );
    }

    @Override
    public WorkOrder getById(Long id) {
        return workOrderMapper.selectById(id);
    }

    @Override
    public String generateOrderNo() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "WO" + dateStr;

        Long count = workOrderMapper.selectCount(
                new LambdaQueryWrapper<WorkOrder>()
                        .likeRight(WorkOrder::getOrderNo, prefix)
        );

        return String.format("%s%04d", prefix, count + 1);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void create(WorkOrderCreateDTO createDTO) {
        Product product = productMapper.selectById(createDTO.getProductId());
        if (product == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND.getCode(), "产品不存在");
        }
        if (product.getStatus() == 0) {
            throw new BusinessException("该产品已下架停产，无法创建工单");
        }

        Formula formula = formulaMapper.selectById(createDTO.getFormulaId());
        if (formula == null) {
            throw new BusinessException(ResultCode.FORMULA_NOT_FOUND);
        }
        if (formula.getStatus() == 0) {
            throw new BusinessException("该配方已禁用，无法创建工单");
        }

        WorkOrder workOrder = new WorkOrder();
        workOrder.setOrderNo(generateOrderNo());
        workOrder.setProductId(createDTO.getProductId());
        workOrder.setFormulaId(createDTO.getFormulaId());
        workOrder.setPlanQuantity(createDTO.getPlanQuantity());
        workOrder.setActualQuantity(BigDecimal.ZERO);
        workOrder.setUnit(createDTO.getUnit() != null ? createDTO.getUnit() : "kg");
        workOrder.setStatus(WorkOrderStatusEnum.PENDING.getCode());
        workOrder.setPriority(createDTO.getPriority() != null ? createDTO.getPriority() : 3);
        workOrder.setLeaderId(UserContext.getUserId());
        workOrder.setQcId(createDTO.getQcId());
        workOrder.setPlanStartDate(createDTO.getPlanStartDate());
        workOrder.setPlanEndDate(createDTO.getPlanEndDate());
        workOrder.setAutoSuspend(0);
        workOrder.setRemark(createDTO.getRemark());

        workOrderMapper.insert(workOrder);

        if (createDTO.getMaterials() != null && !createDTO.getMaterials().isEmpty()) {
            for (WorkOrderMaterialDTO materialDTO : createDTO.getMaterials()) {
                addWorkOrderMaterial(workOrder.getId(), materialDTO);
            }
        } else {
            List<FormulaDetail> formulaDetails = formulaDetailMapper.selectList(
                    new LambdaQueryWrapper<FormulaDetail>()
                            .eq(FormulaDetail::getFormulaId, createDTO.getFormulaId())
            );
            for (FormulaDetail detail : formulaDetails) {
                WorkOrderMaterial wom = new WorkOrderMaterial();
                wom.setWorkOrderId(workOrder.getId());
                wom.setMaterialId(detail.getMaterialId());
                wom.setPlanQuantity(detail.getDosage().multiply(createDTO.getPlanQuantity()));
                wom.setActualQuantity(BigDecimal.ZERO);
                wom.setUnit(detail.getDosageUnit());
                workOrderMaterialMapper.insert(wom);
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void startProduction(Long id) {
        WorkOrder workOrder = getWorkOrder(id);
        if (!WorkOrderStatusEnum.PENDING.getCode().equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCode.WORKORDER_STATUS_ERROR);
        }

        if (workOrder.getIsFormulaConfirmed() == null || workOrder.getIsFormulaConfirmed() != 1) {
            throw new BusinessException("请先确认配方并锁定原料库存后再投产");
        }

        workOrder.setStatus(WorkOrderStatusEnum.WEIGHING.getCode());
        workOrder.setActualStartTime(LocalDateTime.now());
        workOrderMapper.updateById(workOrder);

        createWorkProcess(id, 1, "原料称量");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void processNext(Long id, ProcessRecordDTO processDTO) {
        WorkOrder workOrder = getWorkOrder(id);
        if (workOrder.getStatus() <= 0 || workOrder.getStatus() >= 8) {
            throw new BusinessException(ResultCode.WORKORDER_STATUS_ERROR);
        }

        int currentProcess = workOrder.getStatus() - 1;
        completeWorkProcess(id, currentProcess, processDTO);

        WorkOrderStatusEnum nextStatus = WorkOrderStatusEnum.getNextStatus(workOrder.getStatus());
        if (nextStatus != null && nextStatus.getCode() <= 7) {
            workOrder.setStatus(nextStatus.getCode());
            workOrderMapper.updateById(workOrder);
            createWorkProcess(id, nextStatus.getCode() - 1, nextStatus.getDesc());
        } else if (nextStatus != null && nextStatus.getCode() == 8) {
            workOrder.setStatus(WorkOrderStatusEnum.QC_PENDING.getCode());
            workOrderMapper.updateById(workOrder);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void suspend(Long id, String reason) {
        WorkOrder workOrder = getWorkOrder(id);
        if (workOrder.getStatus() <= 0 || workOrder.getStatus() >= 11) {
            throw new BusinessException(ResultCode.WORKORDER_STATUS_ERROR);
        }
        workOrder.setStatus(WorkOrderStatusEnum.SUSPENDED.getCode());
        workOrder.setRemark(reason);
        workOrderMapper.updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void resume(Long id) {
        WorkOrder workOrder = getWorkOrder(id);
        if (!WorkOrderStatusEnum.SUSPENDED.getCode().equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCode.WORKORDER_STATUS_ERROR);
        }
        workOrder.setStatus(WorkOrderStatusEnum.PENDING.getCode());
        workOrderMapper.updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancel(Long id, String reason) {
        WorkOrder workOrder = getWorkOrder(id);
        if (workOrder.getStatus() >= 10) {
            throw new BusinessException("工单已进入入库阶段，无法取消");
        }
        workOrder.setStatus(WorkOrderStatusEnum.CANCELLED.getCode());
        workOrder.setRemark(reason);
        workOrderMapper.updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void qualityCheck(Long id, QualityInspection inspection) {
        WorkOrder workOrder = getWorkOrder(id);
        if (!WorkOrderStatusEnum.QC_PENDING.getCode().equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCode.WORKORDER_STATUS_ERROR);
        }

        inspection.setWorkOrderId(id);
        inspection.setInspectorId(UserContext.getUserId());
        inspection.setInspectionTime(LocalDateTime.now());
        qualityInspectionMapper.insert(inspection);

        if (inspection.getInspectionResult() == 1) {
            workOrder.setStatus(WorkOrderStatusEnum.QC_PASSED.getCode());
            workOrder.setActualQuantity(inspection.getQualifiedQuantity());
        } else if (inspection.getInspectionResult() == 2) {
            workOrder.setStatus(WorkOrderStatusEnum.SUSPENDED.getCode());
            workOrder.setRemark("质检不合格");
        }
        workOrderMapper.updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void finishWarehousing(Long id, BigDecimal actualQuantity, Long operatorId) {
        WorkOrder workOrder = getWorkOrder(id);
        if (!WorkOrderStatusEnum.QC_PASSED.getCode().equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCode.WORKORDER_STATUS_ERROR);
        }

        FinishedProduct finishedProduct = new FinishedProduct();
        finishedProduct.setProductId(workOrder.getProductId());
        finishedProduct.setWorkOrderId(id);
        finishedProduct.setBatchNo(generateFinishedBatchNo());
        finishedProduct.setQuantity(actualQuantity);
        finishedProduct.setRemainingQuantity(actualQuantity);
        finishedProduct.setUnit(workOrder.getUnit());
        finishedProduct.setProductionDate(LocalDate.now());
        finishedProduct.setWarehouseTime(LocalDateTime.now());
        finishedProduct.setOperatorId(operatorId != null ? operatorId : UserContext.getUserId());
        finishedProduct.setStatus(1);
        finishedProductMapper.insert(finishedProduct);

        workOrder.setStatus(WorkOrderStatusEnum.COMPLETED.getCode());
        workOrder.setActualQuantity(actualQuantity);
        workOrder.setActualEndTime(LocalDateTime.now());
        workOrderMapper.updateById(workOrder);

        calculateCost(id, actualQuantity);

        unlockStock(id);
    }

    @Override
    public List<WorkOrderMaterial> getWorkOrderMaterials(Long workOrderId) {
        return workOrderMaterialMapper.selectList(
                new LambdaQueryWrapper<WorkOrderMaterial>()
                        .eq(WorkOrderMaterial::getWorkOrderId, workOrderId)
        );
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addWorkOrderMaterial(Long workOrderId, WorkOrderMaterialDTO materialDTO) {
        WorkOrder workOrder = getWorkOrder(workOrderId);
        if (workOrder.getStatus() > WorkOrderStatusEnum.WEIGHING.getCode()) {
            throw new BusinessException("工单已开始生产，无法添加用料");
        }

        Material material = materialMapper.selectById(materialDTO.getMaterialId());
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND.getCode(), "原料不存在");
        }

        WorkOrderMaterial wom = new WorkOrderMaterial();
        wom.setWorkOrderId(workOrderId);
        wom.setMaterialId(materialDTO.getMaterialId());
        wom.setMaterialBatchId(materialDTO.getMaterialBatchId());
        wom.setPlanQuantity(materialDTO.getPlanQuantity());
        wom.setActualQuantity(BigDecimal.ZERO);
        wom.setUnit(materialDTO.getUnit() != null ? materialDTO.getUnit() : material.getUnit());
        workOrderMaterialMapper.insert(wom);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void removeWorkOrderMaterial(Long id) {
        WorkOrderMaterial wom = workOrderMaterialMapper.selectById(id);
        if (wom == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND.getCode(), "工单用料不存在");
        }

        WorkOrder workOrder = getWorkOrder(wom.getWorkOrderId());
        if (workOrder.getStatus() > WorkOrderStatusEnum.WEIGHING.getCode()) {
            throw new BusinessException("工单已开始生产，无法删除用料");
        }

        workOrderMaterialMapper.deleteById(id);
    }

    @Override
    public List<WorkProcess> getWorkProcesses(Long workOrderId) {
        return workProcessMapper.selectList(
                new LambdaQueryWrapper<WorkProcess>()
                        .eq(WorkProcess::getWorkOrderId, workOrderId)
                        .orderByAsc(WorkProcess::getProcessType)
        );
    }

    @Override
    public Map<String, Object> getWorkOrderProgress(Long workOrderId) {
        Map<String, Object> progress = new HashMap<>();
        WorkOrder workOrder = getWorkOrder(workOrderId);

        int totalSteps = 7;
        int completedSteps = 0;
        if (workOrder.getStatus() >= WorkOrderStatusEnum.WEIGHING.getCode()) completedSteps++;
        if (workOrder.getStatus() >= WorkOrderStatusEnum.MIXING.getCode()) completedSteps++;
        if (workOrder.getStatus() >= WorkOrderStatusEnum.EMULSIFYING.getCode()) completedSteps++;
        if (workOrder.getStatus() >= WorkOrderStatusEnum.FILTERING.getCode()) completedSteps++;
        if (workOrder.getStatus() >= WorkOrderStatusEnum.FILLING.getCode()) completedSteps++;
        if (workOrder.getStatus() >= WorkOrderStatusEnum.LABELING.getCode()) completedSteps++;
        if (workOrder.getStatus() >= WorkOrderStatusEnum.QC_PENDING.getCode()) completedSteps++;

        progress.put("workOrder", workOrder);
        progress.put("totalSteps", totalSteps);
        progress.put("completedSteps", completedSteps);
        progress.put("progressPercent", (completedSteps * 100) / totalSteps);
        progress.put("processes", getWorkProcesses(workOrderId));
        progress.put("materials", getWorkOrderMaterials(workOrderId));

        return progress;
    }

    @Override
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();

        Long totalOrders = workOrderMapper.selectCount(new LambdaQueryWrapper<>());
        Long pendingOrders = workOrderMapper.selectCount(
                new LambdaQueryWrapper<WorkOrder>().eq(WorkOrder::getStatus, WorkOrderStatusEnum.PENDING.getCode())
        );
        Long processingOrders = workOrderMapper.selectCount(
                new LambdaQueryWrapper<WorkOrder>()
                        .ge(WorkOrder::getStatus, WorkOrderStatusEnum.WEIGHING.getCode())
                        .le(WorkOrder::getStatus, WorkOrderStatusEnum.LABELING.getCode())
        );
        Long completedOrders = workOrderMapper.selectCount(
                new LambdaQueryWrapper<WorkOrder>().eq(WorkOrder::getStatus, WorkOrderStatusEnum.COMPLETED.getCode())
        );
        Long suspendedOrders = workOrderMapper.selectCount(
                new LambdaQueryWrapper<WorkOrder>().eq(WorkOrder::getStatus, WorkOrderStatusEnum.SUSPENDED.getCode())
        );

        stats.put("totalOrders", totalOrders);
        stats.put("pendingOrders", pendingOrders);
        stats.put("processingOrders", processingOrders);
        stats.put("completedOrders", completedOrders);
        stats.put("suspendedOrders", suspendedOrders);

        return stats;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void pickMaterial(Long workOrderId, Long materialBatchId, BigDecimal quantity) {
        WorkOrder workOrder = getWorkOrder(workOrderId);
        if (workOrder.getStatus() != WorkOrderStatusEnum.WEIGHING.getCode()) {
            throw new BusinessException("只有在原料称量阶段才能领料");
        }

        MaterialBatch batch = materialBatchMapper.selectById(materialBatchId);
        if (batch == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND.getCode(), "原料批次不存在");
        }

        WorkOrderMaterial wom = workOrderMaterialMapper.selectOne(
                new LambdaQueryWrapper<WorkOrderMaterial>()
                        .eq(WorkOrderMaterial::getWorkOrderId, workOrderId)
                        .eq(WorkOrderMaterial::getMaterialId, batch.getMaterialId())
        );
        if (wom == null) {
            throw new BusinessException("该工单未包含此原料");
        }

        MaterialOutDTO outDTO = new MaterialOutDTO();
        outDTO.setMaterialBatchId(materialBatchId);
        outDTO.setQuantity(quantity);
        outDTO.setWorkOrderId(workOrderId);
        outDTO.setRemark("工单生产领料");
        materialBatchService.warehouseOut(outDTO);

        wom.setMaterialBatchId(materialBatchId);
        wom.setActualQuantity(wom.getActualQuantity().add(quantity));
        workOrderMaterialMapper.updateById(wom);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchPickMaterial(Long workOrderId, List<Map<String, Object>> pickList) {
        for (Map<String, Object> pick : pickList) {
            Long materialBatchId = Long.valueOf(pick.get("materialBatchId").toString());
            BigDecimal quantity = new BigDecimal(pick.get("quantity").toString());
            pickMaterial(workOrderId, materialBatchId, quantity);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void confirmFormula(Long workOrderId) {
        WorkOrder workOrder = getWorkOrder(workOrderId);
        if (!WorkOrderStatusEnum.PENDING.getCode().equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCode.WORKORDER_STATUS_ERROR.getCode(), "只有待投产状态的工单才能确认配方");
        }

        List<WorkOrderMaterial> materials = getWorkOrderMaterials(workOrderId);
        if (materials.isEmpty()) {
            throw new BusinessException("工单用料清单为空，请先添加工单用料");
        }

        for (WorkOrderMaterial wom : materials) {
            BigDecimal requiredQuantity = wom.getPlanQuantity();
            List<MaterialBatch> availableBatches = materialBatchService.getAvailableBatches(wom.getMaterialId());

            BigDecimal totalAvailable = availableBatches.stream()
                    .map(batch -> {
                        BigDecimal remaining = batch.getRemainingQuantity();
                        BigDecimal locked = batch.getLockedQuantity() != null ? batch.getLockedQuantity() : BigDecimal.ZERO;
                        return remaining.subtract(locked);
                    })
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (totalAvailable.compareTo(requiredQuantity) < 0) {
                Material material = materialMapper.selectById(wom.getMaterialId());
                throw new BusinessException(ResultCode.INVENTORY_SHORTAGE.getCode(),
                        "原料【" + (material != null ? material.getName() : wom.getMaterialId()) + "】库存不足，可用：" + totalAvailable + "，需要：" + requiredQuantity);
            }

            BigDecimal remainingToLock = requiredQuantity;
            for (MaterialBatch batch : availableBatches) {
                if (remainingToLock.compareTo(BigDecimal.ZERO) <= 0) break;

                BigDecimal available = batch.getRemainingQuantity().subtract(
                        batch.getLockedQuantity() != null ? batch.getLockedQuantity() : BigDecimal.ZERO);
                BigDecimal toLock = available.min(remainingToLock);

                if (toLock.compareTo(BigDecimal.ZERO) > 0) {
                    batch.setLockedQuantity((batch.getLockedQuantity() != null ? batch.getLockedQuantity() : BigDecimal.ZERO).add(toLock));
                    materialBatchMapper.updateById(batch);
                    remainingToLock = remainingToLock.subtract(toLock);
                }
            }
        }

        workOrder.setIsFormulaConfirmed(1);
        workOrderMapper.updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void unlockStock(Long workOrderId) {
        WorkOrder workOrder = getWorkOrder(workOrderId);

        List<WorkOrderMaterial> materials = getWorkOrderMaterials(workOrderId);
        for (WorkOrderMaterial wom : materials) {
            if (wom.getMaterialBatchId() != null) {
                MaterialBatch batch = materialBatchMapper.selectById(wom.getMaterialBatchId());
                if (batch != null && batch.getLockedQuantity() != null) {
                    BigDecimal actualUsed = wom.getActualQuantity() != null ? wom.getActualQuantity() : BigDecimal.ZERO;
                    BigDecimal toUnlock = batch.getLockedQuantity().subtract(actualUsed);
                    if (toUnlock.compareTo(BigDecimal.ZERO) > 0) {
                        batch.setLockedQuantity(batch.getLockedQuantity().subtract(toUnlock));
                        materialBatchMapper.updateById(batch);
                    }
                }
            } else {
                BigDecimal remainingToUnlock = wom.getPlanQuantity().subtract(
                        wom.getActualQuantity() != null ? wom.getActualQuantity() : BigDecimal.ZERO);
                if (remainingToUnlock.compareTo(BigDecimal.ZERO) > 0) {
                    List<MaterialBatch> batches = materialBatchMapper.selectList(
                            new LambdaQueryWrapper<MaterialBatch>()
                                    .eq(MaterialBatch::getMaterialId, wom.getMaterialId())
                                    .gt(MaterialBatch::getLockedQuantity, BigDecimal.ZERO)
                                    .orderByAsc(MaterialBatch::getExpiryDate)
                    );
                    for (MaterialBatch batch : batches) {
                        if (remainingToUnlock.compareTo(BigDecimal.ZERO) <= 0) break;
                        BigDecimal toUnlock = batch.getLockedQuantity().min(remainingToUnlock);
                        batch.setLockedQuantity(batch.getLockedQuantity().subtract(toUnlock));
                        materialBatchMapper.updateById(batch);
                        remainingToUnlock = remainingToUnlock.subtract(toUnlock);
                    }
                }
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void autoSuspendOverdue() {
        LocalDate today = LocalDate.now();
        List<WorkOrder> orders = workOrderMapper.selectList(
                new LambdaQueryWrapper<WorkOrder>()
                        .eq(WorkOrder::getStatus, WorkOrderStatusEnum.PENDING.getCode())
                        .lt(WorkOrder::getPlanStartDate, today)
        );

        for (WorkOrder order : orders) {
            order.setStatus(WorkOrderStatusEnum.SUSPENDED.getCode());
            order.setAutoSuspend(1);
            order.setRemark("超期未投产，系统自动暂停");
            workOrderMapper.updateById(order);
        }
    }

    private WorkOrder getWorkOrder(Long id) {
        WorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.WORKORDER_NOT_FOUND);
        }
        return workOrder;
    }

    private void createWorkProcess(Long workOrderId, Integer processType, String processName) {
        WorkProcess process = new WorkProcess();
        process.setWorkOrderId(workOrderId);
        process.setProcessType(processType);
        process.setOperatorId(UserContext.getUserId());
        process.setStartTime(LocalDateTime.now());
        process.setStatus(1);
        workProcessMapper.insert(process);
    }

    private void completeWorkProcess(Long workOrderId, Integer processType, ProcessRecordDTO processDTO) {
        WorkProcess process = workProcessMapper.selectOne(
                new LambdaQueryWrapper<WorkProcess>()
                        .eq(WorkProcess::getWorkOrderId, workOrderId)
                        .eq(WorkProcess::getProcessType, processType)
                        .eq(WorkProcess::getStatus, 1)
                        .orderByDesc(WorkProcess::getCreateTime)
                        .last("LIMIT 1")
        );
        if (process != null) {
            process.setEndTime(LocalDateTime.now());
            process.setStatus(2);
            if (processDTO != null) {
                process.setEquipment(processDTO.getEquipment());
                process.setRemark(processDTO.getRemark());
                Map<String, Object> params = new HashMap<>();
                if (processDTO.getTemperature() != null) {
                    params.put("temperature", processDTO.getTemperature());
                }
                if (processDTO.getStirringSpeed() != null) {
                    params.put("stirringSpeed", processDTO.getStirringSpeed());
                }
                if (processDTO.getProcessParams() != null) {
                    params.put("processParams", processDTO.getProcessParams());
                }
                if (processDTO.getQualityCheck() != null) {
                    params.put("qualityCheck", processDTO.getQualityCheck());
                }
                if (!params.isEmpty()) {
                    process.setParameters(params.toString());
                }
            }
            workProcessMapper.updateById(process);
        }
    }

    private String generateFinishedBatchNo() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "FP" + dateStr;

        Long count = finishedProductMapper.selectCount(
                new LambdaQueryWrapper<FinishedProduct>()
                        .likeRight(FinishedProduct::getBatchNo, prefix)
        );

        return String.format("%s%04d", prefix, count + 1);
    }

    private void calculateCost(Long workOrderId, BigDecimal actualQuantity) {
        WorkOrder workOrder = getWorkOrder(workOrderId);
        List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectList(
                new LambdaQueryWrapper<WorkOrderMaterial>()
                        .eq(WorkOrderMaterial::getWorkOrderId, workOrderId)
        );

        BigDecimal materialCost = BigDecimal.ZERO;
        BigDecimal totalPlanQuantity = BigDecimal.ZERO;
        BigDecimal totalActualQuantity = BigDecimal.ZERO;

        for (WorkOrderMaterial wom : materials) {
            BigDecimal planQty = wom.getPlanQuantity() != null ? wom.getPlanQuantity() : BigDecimal.ZERO;
            BigDecimal actualQty = wom.getActualQuantity() != null ? wom.getActualQuantity() : BigDecimal.ZERO;
            totalPlanQuantity = totalPlanQuantity.add(planQty);
            totalActualQuantity = totalActualQuantity.add(actualQty);

            if (wom.getMaterialBatchId() != null) {
                MaterialBatch batch = materialBatchMapper.selectById(wom.getMaterialBatchId());
                if (batch != null && batch.getUnitPrice() != null) {
                    materialCost = materialCost.add(batch.getUnitPrice().multiply(actualQty));
                }
            }
        }

        BigDecimal materialLoss = totalActualQuantity.subtract(totalPlanQuantity);
        if (materialLoss.compareTo(BigDecimal.ZERO) < 0) {
            materialLoss = BigDecimal.ZERO;
        }

        BigDecimal theoreticalOutput = workOrder.getPlanQuantity();
        BigDecimal productionLossQuantity = theoreticalOutput.subtract(actualQuantity);
        if (productionLossQuantity.compareTo(BigDecimal.ZERO) < 0) {
            productionLossQuantity = BigDecimal.ZERO;
        }

        BigDecimal scrapCost = BigDecimal.ZERO;
        if (actualQuantity.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal unitMaterialCost = materialCost.divide(actualQuantity, 6, RoundingMode.HALF_UP);
            scrapCost = unitMaterialCost.multiply(productionLossQuantity);
        }

        BigDecimal totalCost = materialCost.add(scrapCost);
        BigDecimal unitCost = actualQuantity.compareTo(BigDecimal.ZERO) > 0
                ? totalCost.divide(actualQuantity, 4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        CostStatistics cost = new CostStatistics();
        cost.setWorkOrderId(workOrderId);
        cost.setMaterialCost(materialCost);
        cost.setPackagingCost(BigDecimal.ZERO);
        cost.setEnergyCost(BigDecimal.ZERO);
        cost.setLaborCost(BigDecimal.ZERO);
        cost.setScrapCost(scrapCost);
        cost.setTotalCost(totalCost);
        cost.setUnitCost(unitCost);
        cost.setStatisticsTime(LocalDateTime.now());
        costStatisticsMapper.insert(cost);
    }
}
