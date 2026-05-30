package com.spring.manufacturing.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.spring.manufacturing.common.ResultCode;
import com.spring.manufacturing.dto.DefectiveProcessDTO;
import com.spring.manufacturing.dto.MaterialRequirementDTO;
import com.spring.manufacturing.dto.ProcessCompleteDTO;
import com.spring.manufacturing.dto.WorkOrderCreateDTO;
import com.spring.manufacturing.entity.*;
import com.spring.manufacturing.exception.BusinessException;
import com.spring.manufacturing.mapper.*;
import com.spring.manufacturing.service.ProductionWorkOrderService;
import com.spring.manufacturing.service.SpringCategoryService;
import com.spring.manufacturing.service.SpringMaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionWorkOrderServiceImpl extends ServiceImpl<ProductionWorkOrderMapper, ProductionWorkOrder> implements ProductionWorkOrderService {

    private final WorkOrderProcessMapper workOrderProcessMapper;
    private final SpringCategoryService springCategoryService;
    private final SpringMaterialService springMaterialService;
    private final ProductionWasteMapper productionWasteMapper;
    private final ProductionCostRecordMapper productionCostRecordMapper;
    private final MaterialLockRecordMapper materialLockRecordMapper;
    private final SysUserMapper sysUserMapper;

    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_STRAIGHTENING = "STRAIGHTENING";
    public static final String STATUS_HEATING = "HEATING";
    public static final String STATUS_FORMING = "FORMING";
    public static final String STATUS_GRINDING = "GRINDING";
    public static final String STATUS_QUENCHING = "QUENCHING";
    public static final String STATUS_INSPECTION = "INSPECTION";
    public static final String STATUS_FINISHED = "FINISHED";
    public static final String STATUS_PAUSED = "PAUSED";

    private static final List<String> PROCESS_CODES = Arrays.asList(
            STATUS_STRAIGHTENING, STATUS_HEATING, STATUS_FORMING,
            STATUS_GRINDING, STATUS_QUENCHING, STATUS_INSPECTION
    );
    private static final List<String> PROCESS_NAMES = Arrays.asList(
            "钢丝调直切断", "高温加热处理", "数控热卷成型",
            "端面磨平", "淬火回火定型", "压力探伤检测"
    );

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createWorkOrder(WorkOrderCreateDTO dto, Long operatorId) {
        if (springCategoryService.isCategoryOffline(dto.getCategoryId())) {
            throw new BusinessException(ResultCode.CATEGORY_OFFLINE);
        }

        SpringCategory category = springCategoryService.getById(dto.getCategoryId());

        ProductionWorkOrder workOrder = new ProductionWorkOrder();
        workOrder.setWorkOrderNo(generateWorkOrderNo());
        workOrder.setCategoryId(dto.getCategoryId());
        workOrder.setProductName(dto.getProductName());
        workOrder.setSpecification(dto.getSpecification());
        workOrder.setPlanQuantity(dto.getPlanQuantity());
        workOrder.setActualQuantity(0);
        workOrder.setDefectiveQuantity(0);
        workOrder.setStatus(STATUS_PENDING);
        workOrder.setCurrentProcess("待排产");
        workOrder.setPriority(dto.getPriority() != null ? dto.getPriority() : 0);
        workOrder.setPlanStartDate(dto.getPlanStartDate());
        workOrder.setPlanEndDate(dto.getPlanEndDate());
        workOrder.setRemark(dto.getRemark());
        workOrder.setCreateBy(operatorId);
        workOrder.setCreateTime(LocalDateTime.now());
        save(workOrder);

        initProcesses(workOrder.getId());

        if (dto.getMaterialRequirements() != null && !dto.getMaterialRequirements().isEmpty()) {
            for (MaterialRequirementDTO req : dto.getMaterialRequirements()) {
                springMaterialService.lockMaterial(req.getMaterialId(), workOrder.getId(),
                        workOrder.getWorkOrderNo(), req.getRequiredQuantity(), operatorId);
            }
        }

        return workOrder.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void startProcess(Long workOrderId, String processCode, Long operatorId) {
        ProductionWorkOrder workOrder = getById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.WORK_ORDER_NOT_EXIST);
        }
        if (STATUS_PAUSED.equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCode.WORK_ORDER_PAUSED);
        }
        if (STATUS_FINISHED.equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCode.WORK_ORDER_FINISHED, "工单已完成，无法开始工序");
        }

        WorkOrderProcess process = getProcessByCode(workOrderId, processCode);
        if (process == null) {
            throw new BusinessException("工序不存在");
        }
        if ("PROCESSING".equals(process.getStatus())) {
            throw new BusinessException("工序已开始，请勿重复操作");
        }
        if ("FINISHED".equals(process.getStatus())) {
            throw new BusinessException("工序已完成，无需重复开始");
        }

        int processIndex = PROCESS_CODES.indexOf(processCode);
        if (processIndex > 0) {
            String prevProcessCode = PROCESS_CODES.get(processIndex - 1);
            WorkOrderProcess prevProcess = getProcessByCode(workOrderId, prevProcessCode);
            if (prevProcess == null || !"FINISHED".equals(prevProcess.getStatus())) {
                throw new BusinessException(ResultCode.PREV_PROCESS_NOT_FINISHED);
            }
        }

        process.setStatus("PROCESSING");
        process.setStartTime(LocalDateTime.now());
        process.setOperatorId(operatorId);
        SysUser user = sysUserMapper.selectById(operatorId);
        process.setOperatorName(user != null ? user.getRealName() : "");
        workOrderProcessMapper.updateById(process);

        if (processIndex == 0) {
            workOrder.setActualStartDate(LocalDateTime.now());
        }
        workOrder.setStatus(processCode);
        workOrder.setCurrentProcess(PROCESS_NAMES.get(processIndex));
        workOrder.setProcessOperatorId(operatorId);
        updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void completeProcess(ProcessCompleteDTO dto, Long operatorId) {
        ProductionWorkOrder workOrder = getById(dto.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException(ResultCode.WORK_ORDER_NOT_EXIST);
        }

        WorkOrderProcess process = getProcessByCode(dto.getWorkOrderId(), dto.getProcessCode());
        if (process == null) {
            throw new BusinessException("工序不存在");
        }
        if (!"PROCESSING".equals(process.getStatus())) {
            throw new BusinessException(ResultCode.PROCESS_NOT_STARTED);
        }

        int totalQuantity = dto.getQualifiedQuantity() + dto.getDefectiveQuantity();

        process.setEndTime(LocalDateTime.now());
        process.setProcessQuantity(dto.getQualifiedQuantity());
        process.setDefectiveQuantity(dto.getDefectiveQuantity());
        process.setProcessParams(dto.getProcessParams());
        process.setStatus("FINISHED");
        process.setRemark(dto.getRemark());
        workOrderProcessMapper.updateById(process);

        workOrder.setActualQuantity(workOrder.getActualQuantity() + dto.getQualifiedQuantity());
        workOrder.setDefectiveQuantity(workOrder.getDefectiveQuantity() + dto.getDefectiveQuantity());

        if (dto.getMaterialWaste() != null && dto.getMaterialWaste().compareTo(BigDecimal.ZERO) > 0) {
            ProductionWaste waste = new ProductionWaste();
            waste.setWorkOrderId(dto.getWorkOrderId());
            waste.setWorkOrderNo(workOrder.getWorkOrderNo());
            waste.setProcessCode(dto.getProcessCode());
            waste.setProcessName(PROCESS_NAMES.get(PROCESS_CODES.indexOf(dto.getProcessCode())));
            waste.setWasteQuantity(dto.getMaterialWaste());
            waste.setWasteUnit("kg");
            waste.setWasteType("工艺损耗");
            waste.setWasteReason("正常生产损耗");
            waste.setOperatorId(operatorId);
            SysUser user = sysUserMapper.selectById(operatorId);
            waste.setOperatorName(user != null ? user.getRealName() : "");
            waste.setRecordTime(LocalDateTime.now());
            waste.setRemark(dto.getRemark());
            productionWasteMapper.insert(waste);
        }

        int processIndex = PROCESS_CODES.indexOf(dto.getProcessCode());
        if (processIndex == PROCESS_CODES.size() - 1) {
            workOrder.setStatus(STATUS_FINISHED);
            workOrder.setCurrentProcess("已完成入库");
            workOrder.setActualEndDate(LocalDateTime.now());
            workOrder.setProcessOperatorId(null);
            updateById(workOrder);

            calculateFinalCost(dto.getWorkOrderId(), operatorId);

            releaseRemainingMaterials(dto.getWorkOrderId(), operatorId);
        } else {
            String nextProcessName = PROCESS_NAMES.get(processIndex + 1);
            workOrder.setCurrentProcess("待" + nextProcessName);
            updateById(workOrder);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void processDefective(DefectiveProcessDTO dto, Long operatorId) {
        ProductionWorkOrder workOrder = getById(dto.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException(ResultCode.WORK_ORDER_NOT_EXIST);
        }

        WorkOrderProcess process = getProcessByCode(dto.getWorkOrderId(), dto.getProcessCode());
        if (process == null) {
            throw new BusinessException("工序不存在");
        }

        process.setDefectiveQuantity(process.getDefectiveQuantity() + dto.getProcessQuantity());
        workOrderProcessMapper.updateById(process);

        ProductionWaste waste = new ProductionWaste();
        waste.setWorkOrderId(dto.getWorkOrderId());
        waste.setWorkOrderNo(workOrder.getWorkOrderNo());
        waste.setProcessCode(dto.getProcessCode());
        waste.setProcessName(PROCESS_NAMES.get(PROCESS_CODES.indexOf(dto.getProcessCode())));
        waste.setWasteType(dto.getProcessType());
        waste.setWasteReason("次品处理");
        waste.setOperatorId(operatorId);
        SysUser user = sysUserMapper.selectById(operatorId);
        waste.setOperatorName(user != null ? user.getRealName() : "");
        waste.setRecordTime(LocalDateTime.now());
        waste.setRemark(dto.getRemark());
        productionWasteMapper.insert(waste);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void pauseWorkOrder(Long workOrderId, Long operatorId) {
        ProductionWorkOrder workOrder = getById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.WORK_ORDER_NOT_EXIST);
        }
        if (STATUS_FINISHED.equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCode.WORK_ORDER_FINISHED, "工单已完成，无法暂停");
        }

        workOrder.setStatus(STATUS_PAUSED);
        workOrder.setProcessOperatorId(null);
        workOrder.setUpdateTime(LocalDateTime.now());
        workOrder.setUpdateBy(operatorId);
        updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void resumeWorkOrder(Long workOrderId, Long operatorId) {
        ProductionWorkOrder workOrder = getById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.WORK_ORDER_NOT_EXIST);
        }
        if (!STATUS_PAUSED.equals(workOrder.getStatus())) {
            throw new BusinessException("工单未暂停，无需恢复");
        }

        List<WorkOrderProcess> processes = getWorkOrderProcesses(workOrderId);
        String nextProcessCode = STATUS_PENDING;
        String nextProcessName = "待排产";

        for (int i = 0; i < processes.size(); i++) {
            if ("PENDING".equals(processes.get(i).getStatus())) {
                nextProcessCode = PROCESS_CODES.get(i);
                nextProcessName = "待" + PROCESS_NAMES.get(i);
                break;
            }
            if ("PROCESSING".equals(processes.get(i).getStatus())) {
                nextProcessCode = PROCESS_CODES.get(i);
                nextProcessName = PROCESS_NAMES.get(i);
                break;
            }
        }

        workOrder.setStatus(nextProcessCode);
        workOrder.setCurrentProcess(nextProcessName);
        workOrder.setUpdateTime(LocalDateTime.now());
        workOrder.setUpdateBy(operatorId);
        updateById(workOrder);
    }

    @Override
    public IPage<ProductionWorkOrder> getWorkOrderPage(int page, int size, String status, Long categoryId) {
        Page<ProductionWorkOrder> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<ProductionWorkOrder> wrapper = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            wrapper.eq(ProductionWorkOrder::getStatus, status);
        }
        if (categoryId != null) {
            wrapper.eq(ProductionWorkOrder::getCategoryId, categoryId);
        }
        wrapper.orderByDesc(ProductionWorkOrder::getPriority)
                .orderByDesc(ProductionWorkOrder::getCreateTime);
        return page(pageParam, wrapper);
    }

    @Override
    public List<WorkOrderProcess> getWorkOrderProcesses(Long workOrderId) {
        return workOrderProcessMapper.selectList(new LambdaQueryWrapper<WorkOrderProcess>()
                .eq(WorkOrderProcess::getWorkOrderId, workOrderId)
                .orderByAsc(WorkOrderProcess::getProcessOrder));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void calculateFinalCost(Long workOrderId, Long operatorId) {
        ProductionWorkOrder workOrder = getById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.WORK_ORDER_NOT_EXIST);
        }

        SpringCategory category = springCategoryService.getById(workOrder.getCategoryId());

        BigDecimal totalMaterialCost = BigDecimal.ZERO;
        BigDecimal totalWasteCost = BigDecimal.ZERO;

        List<MaterialLockRecord> lockRecords = materialLockRecordMapper.selectList(
                new LambdaQueryWrapper<MaterialLockRecord>()
                        .eq(MaterialLockRecord::getWorkOrderId, workOrderId)
        );
        for (MaterialLockRecord record : lockRecords) {
            if (record.getLockStatus() == 0) {
                totalMaterialCost = totalMaterialCost.add(record.getTotalAmount());
            }
        }

        List<ProductionWaste> wastes = productionWasteMapper.selectList(
                new LambdaQueryWrapper<ProductionWaste>()
                        .eq(ProductionWaste::getWorkOrderId, workOrderId)
        );
        for (ProductionWaste waste : wastes) {
            if (waste.getWasteAmount() != null) {
                totalWasteCost = totalWasteCost.add(waste.getWasteAmount());
            }
        }

        int totalQuantity = workOrder.getActualQuantity() + workOrder.getDefectiveQuantity();
        BigDecimal unitLaborCost = new BigDecimal("15.00");
        BigDecimal unitEnergyCost = new BigDecimal("8.50");
        BigDecimal unitMoldCost = new BigDecimal("5.00");

        BigDecimal laborCost = unitLaborCost.multiply(BigDecimal.valueOf(workOrder.getActualQuantity()));
        BigDecimal energyCost = unitEnergyCost.multiply(BigDecimal.valueOf(workOrder.getActualQuantity()));
        BigDecimal moldCost = unitMoldCost.multiply(BigDecimal.valueOf(workOrder.getActualQuantity()));
        BigDecimal defectiveCost = new BigDecimal("25.00").multiply(BigDecimal.valueOf(workOrder.getDefectiveQuantity()));

        BigDecimal totalCost = totalMaterialCost.add(totalWasteCost)
                .add(energyCost).add(moldCost).add(laborCost).add(defectiveCost);
        BigDecimal unitCost = workOrder.getActualQuantity() > 0 ?
                totalCost.divide(BigDecimal.valueOf(workOrder.getActualQuantity()), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        ProductionCostRecord costRecord = new ProductionCostRecord();
        costRecord.setWorkOrderId(workOrderId);
        costRecord.setWorkOrderNo(workOrder.getWorkOrderNo());
        costRecord.setCategoryId(workOrder.getCategoryId());
        costRecord.setCategoryName(category != null ? category.getCategoryName() : "");
        costRecord.setCostMonth(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM")));
        costRecord.setTotalQuantity(totalQuantity);
        costRecord.setQualifiedQuantity(workOrder.getActualQuantity());
        costRecord.setDefectiveQuantity(workOrder.getDefectiveQuantity());
        costRecord.setMaterialCost(totalMaterialCost);
        costRecord.setMaterialWasteCost(totalWasteCost);
        costRecord.setEnergyCost(energyCost);
        costRecord.setMoldCost(moldCost);
        costRecord.setLaborCost(laborCost);
        costRecord.setDefectiveCost(defectiveCost);
        costRecord.setOtherCost(BigDecimal.ZERO);
        costRecord.setTotalCost(totalCost);
        costRecord.setUnitCost(unitCost);
        costRecord.setOperatorId(operatorId);
        costRecord.setCreateTime(LocalDateTime.now());
        productionCostRecordMapper.insert(costRecord);
    }

    private String generateWorkOrderNo() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int random = (int) (Math.random() * 10000);
        return "WO" + timestamp + String.format("%04d", random);
    }

    private void initProcesses(Long workOrderId) {
        for (int i = 0; i < PROCESS_CODES.size(); i++) {
            WorkOrderProcess process = new WorkOrderProcess();
            process.setWorkOrderId(workOrderId);
            process.setProcessCode(PROCESS_CODES.get(i));
            process.setProcessName(PROCESS_NAMES.get(i));
            process.setProcessOrder(i + 1);
            process.setStatus("PENDING");
            process.setProcessQuantity(0);
            process.setDefectiveQuantity(0);
            workOrderProcessMapper.insert(process);
        }
    }

    private WorkOrderProcess getProcessByCode(Long workOrderId, String processCode) {
        return workOrderProcessMapper.selectOne(new LambdaQueryWrapper<WorkOrderProcess>()
                .eq(WorkOrderProcess::getWorkOrderId, workOrderId)
                .eq(WorkOrderProcess::getProcessCode, processCode));
    }

    private void releaseRemainingMaterials(Long workOrderId, Long operatorId) {
        List<MaterialLockRecord> lockRecords = materialLockRecordMapper.selectList(
                new LambdaQueryWrapper<MaterialLockRecord>()
                        .eq(MaterialLockRecord::getWorkOrderId, workOrderId)
                        .eq(MaterialLockRecord::getLockStatus, 1)
        );
        for (MaterialLockRecord record : lockRecords) {
            springMaterialService.releaseMaterial(record.getMaterialId(), workOrderId, operatorId);
        }
    }
}