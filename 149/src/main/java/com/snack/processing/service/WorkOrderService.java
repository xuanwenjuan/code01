package com.snack.processing.service;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.snack.processing.annotation.OperationLog;
import com.snack.processing.common.Result;
import com.snack.processing.common.ResultCode;
import com.snack.processing.common.enums.ProcessStatusEnum;
import com.snack.processing.common.enums.WorkOrderStatusEnum;
import com.snack.processing.dto.workorder.*;
import com.snack.processing.entity.MaterialStock;
import com.snack.processing.entity.WorkOrder;
import com.snack.processing.entity.WorkOrderMaterial;
import com.snack.processing.entity.WorkOrderProcess;
import com.snack.processing.exception.BusinessException;
import com.snack.processing.mapper.MaterialStockMapper;
import com.snack.processing.mapper.WorkOrderMapper;
import com.snack.processing.mapper.WorkOrderMaterialMapper;
import com.snack.processing.mapper.WorkOrderProcessMapper;
import com.snack.processing.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkOrderService extends ServiceImpl<WorkOrderMapper, WorkOrder> {

    private final WorkOrderMapper workOrderMapper;
    private final WorkOrderProcessMapper processMapper;
    private final WorkOrderMaterialMapper materialMapper;
    private final MaterialStockMapper stockMapper;

    private static final List<Map<String, String>> DEFAULT_PROCESSES = Arrays.asList(
            Map.of("code", "CLEANING", "name", "原料清洗分拣"),
            Map.of("code", "SEASONING", "name", "调味腌制"),
            Map.of("code", "BAKING", "name", "烘烤灭菌"),
            Map.of("code", "PACKAGING", "name", "定量分装"),
            Map.of("code", "CODING", "name", "封口打码"),
            Map.of("code", "QC", "name", "质检抽检"),
            Map.of("code", "WAREHOUSING", "name", "成品入库")
    );

    @OperationLog(module = "生产工单管理", operation = "创建工单", description = "创建新的生产工单并锁定物料库存")
    @Transactional(rollbackFor = Exception.class)
    public Result<WorkOrder> createWorkOrder(WorkOrderAddDTO dto) {
        String orderNo = generateOrderNo();

        if (dto.getMaterials() != null && !dto.getMaterials().isEmpty()) {
            for (WorkOrderMaterialDTO materialDTO : dto.getMaterials()) {
                BigDecimal totalAvailable = stockMapper.selectList(
                                new LambdaQueryWrapper<MaterialStock>()
                                        .eq(MaterialStock::getMaterialId, materialDTO.getMaterialId())
                                        .ne(MaterialStock::getStockStatus, 3))
                        .stream()
                        .map(MaterialStock::getAvailableQuantity)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                if (totalAvailable.compareTo(materialDTO.getPlanQuantity()) < 0) {
                    throw new BusinessException(ResultCode.STOCK_NOT_ENOUGH,
                            "材料【" + materialDTO.getMaterialName() + "】可用库存不足，当前可用：" + totalAvailable + "，需要：" + materialDTO.getPlanQuantity());
                }
            }
        }

        WorkOrder workOrder = new WorkOrder();
        workOrder.setOrderNo(orderNo);
        workOrder.setSnackCategoryId(dto.getSnackCategoryId());
        workOrder.setSnackCategoryName(dto.getSnackCategoryName());
        workOrder.setProductName(dto.getProductName());
        workOrder.setPlanQuantity(dto.getPlanQuantity());
        workOrder.setActualQuantity(BigDecimal.ZERO);
        workOrder.setUnit(dto.getUnit() != null ? dto.getUnit() : "kg");
        workOrder.setPlanStartTime(dto.getPlanStartTime());
        workOrder.setPlanEndTime(dto.getPlanEndTime());
        workOrder.setStatus(WorkOrderStatusEnum.PENDING.getCode());
        workOrder.setPriority(dto.getPriority() != null ? dto.getPriority() : 0);
        workOrder.setProcessEnginnerId(dto.getProcessEnginnerId());
        workOrder.setProcessEnginnerName(dto.getProcessEnginnerName());
        workOrder.setProductionLeaderId(dto.getProductionLeaderId());
        workOrder.setProductionLeaderName(dto.getProductionLeaderName());
        workOrder.setQcInspectorId(dto.getQcInspectorId());
        workOrder.setQcInspectorName(dto.getQcInspectorName());
        workOrder.setIsOverdue(0);
        workOrder.setTotalCost(BigDecimal.ZERO);
        workOrder.setRemark(dto.getRemark());

        StringBuilder processOrder = new StringBuilder();
        for (int i = 0; i < DEFAULT_PROCESSES.size(); i++) {
            if (i > 0) {
                processOrder.append(",");
            }
            processOrder.append(DEFAULT_PROCESSES.get(i).get("code"));
        }
        workOrder.setProcessOrder(processOrder.toString());
        workOrder.setCurrentProcess(DEFAULT_PROCESSES.get(0).get("code"));

        workOrderMapper.insert(workOrder);

        for (int i = 0; i < DEFAULT_PROCESSES.size(); i++) {
            Map<String, String> process = DEFAULT_PROCESSES.get(i);
            WorkOrderProcess orderProcess = new WorkOrderProcess();
            orderProcess.setWorkOrderId(workOrder.getId());
            orderProcess.setProcessCode(process.get("code"));
            orderProcess.setProcessName(process.get("name"));
            orderProcess.setSortOrder(i + 1);
            orderProcess.setStatus(ProcessStatusEnum.PENDING.getCode());
            orderProcess.setOutputQuantity(BigDecimal.ZERO);
            orderProcess.setDefectiveQuantity(BigDecimal.ZERO);
            orderProcess.setEnergyConsumption(BigDecimal.ZERO);
            orderProcess.setLaborHours(BigDecimal.ZERO);
            processMapper.insert(orderProcess);
        }

        if (dto.getMaterials() != null && !dto.getMaterials().isEmpty()) {
            for (WorkOrderMaterialDTO materialDTO : dto.getMaterials()) {
                WorkOrderMaterial material = new WorkOrderMaterial();
                material.setWorkOrderId(workOrder.getId());
                material.setMaterialId(materialDTO.getMaterialId());
                material.setMaterialName(materialDTO.getMaterialName());
                material.setMaterialCode(materialDTO.getMaterialCode());
                material.setPlanQuantity(materialDTO.getPlanQuantity());
                material.setActualQuantity(BigDecimal.ZERO);
                material.setUnit(materialDTO.getUnit());
                material.setUnitPrice(materialDTO.getUnitPrice());
                material.setTotalAmount(BigDecimal.ZERO);
                material.setWasteQuantity(BigDecimal.ZERO);
                materialMapper.insert(material);

                lockMaterialStock(materialDTO.getMaterialId(), materialDTO.getPlanQuantity());
            }
        }

        return Result.success(workOrder);
    }

    @Transactional(rollbackFor = Exception.class)
    public void lockMaterialStock(Long materialId, BigDecimal quantity) {
        List<MaterialStock> stocks = stockMapper.selectList(
                new LambdaQueryWrapper<MaterialStock>()
                        .eq(MaterialStock::getMaterialId, materialId)
                        .ne(MaterialStock::getStockStatus, 3)
                        .gt(MaterialStock::getAvailableQuantity, BigDecimal.ZERO)
                        .orderByAsc(MaterialStock::getExpireDate));

        BigDecimal remainingQuantity = quantity;

        for (MaterialStock stock : stocks) {
            if (remainingQuantity.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }

            BigDecimal availableQty = stock.getAvailableQuantity();
            BigDecimal lockQty = remainingQuantity.min(availableQty);

            stock.setAvailableQuantity(availableQty.subtract(lockQty));
            stock.setLockedQuantity(stock.getLockedQuantity().add(lockQty));
            stockMapper.updateById(stock);

            remainingQuantity = remainingQuantity.subtract(lockQty);
        }

        if (remainingQuantity.compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessException(ResultCode.STOCK_NOT_ENOUGH, "库存锁定失败，剩余未锁定数量：" + remainingQuantity);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void unlockMaterialStock(Long materialId, BigDecimal quantity) {
        List<MaterialStock> stocks = stockMapper.selectList(
                new LambdaQueryWrapper<MaterialStock>()
                        .eq(MaterialStock::getMaterialId, materialId)
                        .gt(MaterialStock::getLockedQuantity, BigDecimal.ZERO)
                        .orderByDesc(MaterialStock::getExpireDate));

        BigDecimal remainingQuantity = quantity;

        for (MaterialStock stock : stocks) {
            if (remainingQuantity.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }

            BigDecimal lockedQty = stock.getLockedQuantity();
            BigDecimal unlockQty = remainingQuantity.min(lockedQty);

            stock.setAvailableQuantity(stock.getAvailableQuantity().add(unlockQty));
            stock.setLockedQuantity(lockedQty.subtract(unlockQty));
            stockMapper.updateById(stock);

            remainingQuantity = remainingQuantity.subtract(unlockQty);
        }
    }

    @OperationLog(module = "生产工单管理", operation = "开始生产", description = "开始工单生产")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> startProduction(Long id) {
        WorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        if (!WorkOrderStatusEnum.PENDING.getCode().equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR, "只有待生产的工单才能开始生产");
        }

        workOrder.setStatus(WorkOrderStatusEnum.IN_PRODUCTION.getCode());
        workOrder.setActualStartTime(LocalDateTime.now());
        workOrderMapper.updateById(workOrder);

        WorkOrderProcess firstProcess = processMapper.selectOne(new LambdaQueryWrapper<WorkOrderProcess>()
                .eq(WorkOrderProcess::getWorkOrderId, id)
                .eq(WorkOrderProcess::getSortOrder, 1));

        if (firstProcess != null) {
            firstProcess.setStatus(ProcessStatusEnum.IN_PROGRESS.getCode());
            firstProcess.setStartTime(LocalDateTime.now());
            processMapper.updateById(firstProcess);
        }

        return Result.success();
    }

    @OperationLog(module = "生产工单管理", operation = "开始工序", description = "开始工单某一工序")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> startProcess(ProcessStartDTO dto) {
        WorkOrder workOrder = workOrderMapper.selectById(dto.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        if (!WorkOrderStatusEnum.IN_PRODUCTION.getCode().equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR, "只有生产中的工单才能执行工序");
        }

        if (!dto.getProcessCode().equals(workOrder.getCurrentProcess())) {
            throw new BusinessException(ResultCode.ORDER_OPERATION_NOT_ALLOWED, "当前工序不匹配，请按顺序执行");
        }

        WorkOrderProcess process = processMapper.selectOne(new LambdaQueryWrapper<WorkOrderProcess>()
                .eq(WorkOrderProcess::getWorkOrderId, dto.getWorkOrderId())
                .eq(WorkOrderProcess::getProcessCode, dto.getProcessCode()));

        if (process == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND, "工序不存在");
        }

        if (!ProcessStatusEnum.PENDING.getCode().equals(process.getStatus())) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR, "工序状态不允许开始");
        }

        process.setStatus(ProcessStatusEnum.IN_PROGRESS.getCode());
        process.setStartTime(LocalDateTime.now());
        process.setOperatorId(SecurityUtil.getCurrentUserId());
        process.setOperatorName(dto.getOperatorName());
        process.setEquipment(dto.getEquipment());
        processMapper.updateById(process);

        return Result.success();
    }

    @OperationLog(module = "生产工单管理", operation = "完成工序", description = "完成工单某一工序")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> completeProcess(ProcessCompleteDTO dto) {
        WorkOrder workOrder = workOrderMapper.selectById(dto.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        if (!WorkOrderStatusEnum.IN_PRODUCTION.getCode().equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR, "只有生产中的工单才能执行工序");
        }

        if (!dto.getProcessCode().equals(workOrder.getCurrentProcess())) {
            throw new BusinessException(ResultCode.ORDER_OPERATION_NOT_ALLOWED, "当前工序不匹配，请按顺序执行");
        }

        WorkOrderProcess process = processMapper.selectOne(new LambdaQueryWrapper<WorkOrderProcess>()
                .eq(WorkOrderProcess::getWorkOrderId, dto.getWorkOrderId())
                .eq(WorkOrderProcess::getProcessCode, dto.getProcessCode()));

        if (process == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND, "工序不存在");
        }

        if (!ProcessStatusEnum.IN_PROGRESS.getCode().equals(process.getStatus())) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR, "工序状态不允许完成");
        }

        process.setStatus(ProcessStatusEnum.COMPLETED.getCode());
        process.setEndTime(LocalDateTime.now());
        if (process.getStartTime() != null) {
            process.setDuration(Duration.between(process.getStartTime(), process.getEndTime()).toMinutes());
        }
        process.setOutputQuantity(dto.getOutputQuantity());
        process.setDefectiveQuantity(dto.getDefectiveQuantity());
        process.setEnergyConsumption(dto.getEnergyConsumption());
        process.setLaborHours(dto.getLaborHours());
        process.setRemark(dto.getRemark());
        processMapper.updateById(process);

        List<WorkOrderProcess> allProcesses = processMapper.selectList(new LambdaQueryWrapper<WorkOrderProcess>()
                .eq(WorkOrderProcess::getWorkOrderId, dto.getWorkOrderId())
                .orderByAsc(WorkOrderProcess::getSortOrder));

        int currentIndex = -1;
        for (int i = 0; i < allProcesses.size(); i++) {
            if (allProcesses.get(i).getProcessCode().equals(dto.getProcessCode())) {
                currentIndex = i;
                break;
            }
        }

        if (currentIndex < allProcesses.size() - 1) {
            WorkOrderProcess nextProcess = allProcesses.get(currentIndex + 1);
            workOrder.setCurrentProcess(nextProcess.getProcessCode());

            if ("QC".equals(nextProcess.getProcessCode())) {
                workOrder.setStatus(WorkOrderStatusEnum.QC_INSPECTION.getCode());
            }
        } else {
            workOrder.setStatus(WorkOrderStatusEnum.COMPLETED.getCode());
            workOrder.setActualEndTime(LocalDateTime.now());
            workOrder.setActualQuantity(dto.getOutputQuantity());
            workOrder.setCurrentProcess("");

            BigDecimal totalCost = calculateTotalCost(dto.getWorkOrderId());
            workOrder.setTotalCost(totalCost);
        }

        workOrderMapper.updateById(workOrder);

        return Result.success();
    }

    @OperationLog(module = "生产工单管理", operation = "暂停工单", description = "暂停生产工单")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> pauseWorkOrder(Long id) {
        WorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        if (!WorkOrderStatusEnum.IN_PRODUCTION.getCode().equals(workOrder.getStatus())
                && !WorkOrderStatusEnum.QC_INSPECTION.getCode().equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR, "只有生产中或质检中的工单才能暂停");
        }

        workOrder.setStatus(WorkOrderStatusEnum.PAUSED.getCode());
        workOrderMapper.updateById(workOrder);

        List<WorkOrderProcess> processes = processMapper.selectList(new LambdaQueryWrapper<WorkOrderProcess>()
                .eq(WorkOrderProcess::getWorkOrderId, id)
                .eq(WorkOrderProcess::getStatus, ProcessStatusEnum.IN_PROGRESS.getCode()));

        for (WorkOrderProcess process : processes) {
            process.setStatus(ProcessStatusEnum.PENDING.getCode());
            process.setStartTime(null);
            processMapper.updateById(process);
        }

        return Result.success();
    }

    @OperationLog(module = "生产工单管理", operation = "恢复工单", description = "恢复已暂停的生产工单")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> resumeWorkOrder(Long id) {
        WorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        if (!WorkOrderStatusEnum.PAUSED.getCode().equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR, "只有已暂停的工单才能恢复");
        }

        String currentProcessCode = workOrder.getCurrentProcess();
        if ("QC".equals(currentProcessCode)) {
            workOrder.setStatus(WorkOrderStatusEnum.QC_INSPECTION.getCode());
        } else {
            workOrder.setStatus(WorkOrderStatusEnum.IN_PRODUCTION.getCode());
        }

        workOrderMapper.updateById(workOrder);

        return Result.success();
    }

    @OperationLog(module = "生产工单管理", operation = "取消工单", description = "取消生产工单并释放锁定库存")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> cancelWorkOrder(Long id) {
        WorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        if (WorkOrderStatusEnum.COMPLETED.getCode().equals(workOrder.getStatus())
                || WorkOrderStatusEnum.CANCELLED.getCode().equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR, "已完成或已取消的工单无法取消");
        }

        workOrder.setStatus(WorkOrderStatusEnum.CANCELLED.getCode());
        workOrderMapper.updateById(workOrder);

        List<WorkOrderProcess> processes = processMapper.selectList(new LambdaQueryWrapper<WorkOrderProcess>()
                .eq(WorkOrderProcess::getWorkOrderId, id)
                .ne(WorkOrderProcess::getStatus, ProcessStatusEnum.COMPLETED.getCode()));

        for (WorkOrderProcess process : processes) {
            process.setStatus(ProcessStatusEnum.SKIPPED.getCode());
            processMapper.updateById(process);
        }

        List<WorkOrderMaterial> materials = materialMapper.selectList(
                new LambdaQueryWrapper<WorkOrderMaterial>()
                        .eq(WorkOrderMaterial::getWorkOrderId, id));

        for (WorkOrderMaterial material : materials) {
            BigDecimal usedQty = material.getActualQuantity() != null ? material.getActualQuantity() : BigDecimal.ZERO;
            BigDecimal lockedQty = material.getPlanQuantity().subtract(usedQty);
            if (lockedQty.compareTo(BigDecimal.ZERO) > 0) {
                unlockMaterialStock(material.getMaterialId(), lockedQty);
            }
        }

        return Result.success();
    }

    @OperationLog(module = "生产工单管理", operation = "登记用料", description = "登记工单实际用料")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> recordMaterialUsage(Long workOrderId, Long materialId, String batchNo, BigDecimal actualQuantity, BigDecimal wasteQuantity) {
        WorkOrder workOrder = workOrderMapper.selectById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        WorkOrderMaterial orderMaterial = materialMapper.selectOne(new LambdaQueryWrapper<WorkOrderMaterial>()
                .eq(WorkOrderMaterial::getWorkOrderId, workOrderId)
                .eq(WorkOrderMaterial::getMaterialId, materialId));

        if (orderMaterial == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND, "工单中不存在该材料");
        }

        MaterialStock stock = stockMapper.selectOne(new LambdaQueryWrapper<MaterialStock>()
                .eq(MaterialStock::getBatchNo, batchNo));

        if (stock == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND, "库存批次不存在");
        }

        if (stock.getAvailableQuantity().compareTo(actualQuantity) < 0) {
            throw new BusinessException(ResultCode.STOCK_NOT_ENOUGH);
        }

        stock.setAvailableQuantity(stock.getAvailableQuantity().subtract(actualQuantity));
        stock.setUsedQuantity(stock.getUsedQuantity().add(actualQuantity));
        stockMapper.updateById(stock);

        BigDecimal totalAmount = actualQuantity.multiply(stock.getUnitPrice());
        orderMaterial.setActualQuantity(orderMaterial.getActualQuantity().add(actualQuantity));
        orderMaterial.setBatchNo(batchNo);
        orderMaterial.setUnitPrice(stock.getUnitPrice());
        orderMaterial.setTotalAmount(orderMaterial.getTotalAmount().add(totalAmount));
        orderMaterial.setWasteQuantity(orderMaterial.getWasteQuantity().add(wasteQuantity != null ? wasteQuantity : BigDecimal.ZERO));
        materialMapper.updateById(orderMaterial);

        return Result.success();
    }

    public Result<WorkOrder> getWorkOrderDetail(Long id) {
        WorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        List<WorkOrderProcess> processes = processMapper.selectList(new LambdaQueryWrapper<WorkOrderProcess>()
                .eq(WorkOrderProcess::getWorkOrderId, id)
                .orderByAsc(WorkOrderProcess::getSortOrder));
        workOrder.setProcesses(processes);

        List<WorkOrderMaterial> materials = materialMapper.selectList(new LambdaQueryWrapper<WorkOrderMaterial>()
                .eq(WorkOrderMaterial::getWorkOrderId, id));
        workOrder.setMaterials(materials);

        return Result.success(workOrder);
    }

    public Result<IPage<WorkOrder>> getWorkOrderPage(WorkOrderQueryDTO dto) {
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(dto.getOrderNo() != null, WorkOrder::getOrderNo, dto.getOrderNo())
                .eq(dto.getSnackCategoryId() != null, WorkOrder::getSnackCategoryId, dto.getSnackCategoryId())
                .like(dto.getProductName() != null, WorkOrder::getProductName, dto.getProductName())
                .eq(dto.getStatus() != null, WorkOrder::getStatus, dto.getStatus())
                .eq(dto.getIsOverdue() != null, WorkOrder::getIsOverdue, dto.getIsOverdue())
                .ge(dto.getPlanStartTimeStart() != null, WorkOrder::getPlanStartTime, dto.getPlanStartTimeStart())
                .le(dto.getPlanStartTimeEnd() != null, WorkOrder::getPlanStartTime, dto.getPlanStartTimeEnd())
                .eq(dto.getProcessEnginnerId() != null, WorkOrder::getProcessEnginnerId, dto.getProcessEnginnerId())
                .eq(dto.getProductionLeaderId() != null, WorkOrder::getProductionLeaderId, dto.getProductionLeaderId())
                .eq(dto.getQcInspectorId() != null, WorkOrder::getQcInspectorId, dto.getQcInspectorId())
                .orderByDesc(WorkOrder::getPriority)
                .orderByDesc(WorkOrder::getCreateTime);

        IPage<WorkOrder> page = workOrderMapper.selectPage(dto.buildPage(), wrapper);
        return Result.success(page);
    }

    public Result<List<WorkOrderProcess>> getWorkOrderProcesses(Long workOrderId) {
        List<WorkOrderProcess> processes = processMapper.selectList(new LambdaQueryWrapper<WorkOrderProcess>()
                .eq(WorkOrderProcess::getWorkOrderId, workOrderId)
                .orderByAsc(WorkOrderProcess::getSortOrder));
        return Result.success(processes);
    }

    public Result<List<WorkOrderMaterial>> getWorkOrderMaterials(Long workOrderId) {
        List<WorkOrderMaterial> materials = materialMapper.selectList(new LambdaQueryWrapper<WorkOrderMaterial>()
                .eq(WorkOrderMaterial::getWorkOrderId, workOrderId));
        return Result.success(materials);
    }

    private BigDecimal calculateTotalCost(Long workOrderId) {
        List<WorkOrderMaterial> materials = materialMapper.selectList(new LambdaQueryWrapper<WorkOrderMaterial>()
                .eq(WorkOrderMaterial::getWorkOrderId, workOrderId));

        BigDecimal materialCost = materials.stream()
                .map(WorkOrderMaterial::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<WorkOrderProcess> processes = processMapper.selectList(new LambdaQueryWrapper<WorkOrderProcess>()
                .eq(WorkOrderProcess::getWorkOrderId, workOrderId));

        BigDecimal energyCost = processes.stream()
                .map(p -> p.getEnergyConsumption() != null ? p.getEnergyConsumption().multiply(new BigDecimal("1.5")) : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal laborCost = processes.stream()
                .map(p -> p.getLaborHours() != null ? p.getLaborHours().multiply(new BigDecimal("50")) : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return materialCost.add(energyCost).add(laborCost);
    }

    private String generateOrderNo() {
        String datePart = DateUtil.format(DateUtil.date(), "yyyyMMdd");
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "WO" + datePart + uuid;
    }
}
