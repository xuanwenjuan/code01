package com.fastener.production.service.workorder.impl;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fastener.production.common.entity.PageQuery;
import com.fastener.production.common.enums.WorkOrderStatusEnum;
import com.fastener.production.common.exception.BusinessException;
import com.fastener.production.common.result.ResultCode;
import com.fastener.production.common.utils.UserContext;
import com.fastener.production.entity.material.MaterialBatch;
import com.fastener.production.entity.material.MetalMaterial;
import com.fastener.production.entity.product.ProductCategory;
import com.fastener.production.entity.workorder.ColdHeadingWorkOrder;
import com.fastener.production.entity.workorder.WorkOrderProcess;
import com.fastener.production.entity.workorder.dto.ColdHeadingWorkOrderDTO;
import com.fastener.production.entity.workorder.dto.ProcessCompleteDTO;
import com.fastener.production.entity.workorder.dto.ProcessStartDTO;
import com.fastener.production.entity.workorder.dto.WorkOrderAuditDTO;
import com.fastener.production.mapper.material.MaterialBatchMapper;
import com.fastener.production.mapper.material.MetalMaterialMapper;
import com.fastener.production.mapper.product.ProductCategoryMapper;
import com.fastener.production.mapper.workorder.ColdHeadingWorkOrderMapper;
import com.fastener.production.mapper.workorder.WorkOrderProcessMapper;
import com.fastener.production.service.material.MaterialReservationService;
import com.fastener.production.service.workorder.ColdHeadingWorkOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ColdHeadingWorkOrderServiceImpl extends ServiceImpl<ColdHeadingWorkOrderMapper, ColdHeadingWorkOrder> implements ColdHeadingWorkOrderService {

    private final ColdHeadingWorkOrderMapper workOrderMapper;
    private final WorkOrderProcessMapper processMapper;
    private final ProductCategoryMapper categoryMapper;
    private final MetalMaterialMapper materialMapper;
    private final MaterialBatchMapper materialBatchMapper;
    private final MaterialReservationService materialReservationService;

    private static final Map<String, String> PROCESS_MAP = new LinkedHashMap<>();

    static {
        PROCESS_MAP.put("CUTTING", "拉直切断");
        PROCESS_MAP.put("COLD_HEADING", "冷镦成型");
        PROCESS_MAP.put("THREAD_ROLLING", "螺纹滚压");
        PROCESS_MAP.put("GALVANIZING", "表面镀锌");
        PROCESS_MAP.put("QUENCHING", "淬火调质");
        PROCESS_MAP.put("INSPECTION", "尺寸全检");
        PROCESS_MAP.put("PACKAGING", "防锈打包");
    }

    @Override
    public IPage<ColdHeadingWorkOrder> page(PageQuery pageQuery, String orderNo, Long categoryId, Integer status, Integer auditStatus) {
        Page<ColdHeadingWorkOrder> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());
        LambdaQueryWrapper<ColdHeadingWorkOrder> wrapper = new LambdaQueryWrapper<>();
        if (orderNo != null && !orderNo.isEmpty()) {
            wrapper.like(ColdHeadingWorkOrder::getOrderNo, orderNo);
        }
        if (categoryId != null) {
            wrapper.eq(ColdHeadingWorkOrder::getCategoryId, categoryId);
        }
        if (status != null) {
            wrapper.eq(ColdHeadingWorkOrder::getStatus, status);
        }
        if (auditStatus != null) {
            wrapper.eq(ColdHeadingWorkOrder::getAuditStatus, auditStatus);
        }
        wrapper.orderByDesc(ColdHeadingWorkOrder::getPriority);
        wrapper.orderByDesc(ColdHeadingWorkOrder::getCreateTime);
        return this.page(page, wrapper);
    }

    @Override
    public String generateOrderNo() {
        String dateStr = DateUtil.format(LocalDate.now(), "yyyyMMdd");
        String prefix = "WO" + dateStr;

        Long count = this.count(new LambdaQueryWrapper<ColdHeadingWorkOrder>()
                .like(ColdHeadingWorkOrder::getOrderNo, prefix));

        return prefix + String.format("%04d", count + 1);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void create(ColdHeadingWorkOrderDTO dto) {
        ProductCategory category = categoryMapper.selectById(dto.getCategoryId());
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "产品分类不存在");
        }

        String orderNo = generateOrderNo();

        ColdHeadingWorkOrder order = new ColdHeadingWorkOrder();
        order.setOrderNo(orderNo);
        order.setCategoryId(dto.getCategoryId());
        order.setCategoryName(category.getCategoryName());
        order.setSpecification(category.getSpecification());
        order.setPlanQuantity(dto.getPlanQuantity());
        order.setActualQuantity(0);
        order.setScrapQuantity(0);
        order.setMaterialId(dto.getMaterialId());
        if (dto.getMaterialId() != null) {
            MetalMaterial material = materialMapper.selectById(dto.getMaterialId());
            if (material != null) {
                order.setMaterialName(material.getMaterialName());
            }
        }
        order.setMaterialUsage(dto.getMaterialUsage());
        order.setMaterialReservedQuantity(BigDecimal.ZERO);
        order.setWorkCenter(dto.getWorkCenter());
        order.setMachineCode(dto.getMachineCode());
        order.setOperator(dto.getOperator());
        order.setPlanStartDate(dto.getPlanStartDate());
        order.setPlanEndDate(dto.getPlanEndDate());
        order.setStatus(WorkOrderStatusEnum.PENDING.getCode());
        order.setAuditStatus(0);
        order.setPriority(dto.getPriority() != null ? dto.getPriority() : 0);
        order.setProcessRemark(dto.getProcessRemark());
        order.setQualityStandard(dto.getQualityStandard());
        order.setRemark(dto.getRemark());
        this.save(order);

        initProcesses(order.getId(), order.getOrderNo());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void audit(WorkOrderAuditDTO dto) {
        ColdHeadingWorkOrder order = this.getById(dto.getWorkOrderId());
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "工单不存在");
        }

        if (order.getAuditStatus() != null && order.getAuditStatus() != 0) {
            throw new BusinessException(ResultCode.OPERATION_NOT_ALLOWED, "工单已审核，不可重复操作");
        }

        if (dto.getAuditStatus() != 1 && dto.getAuditStatus() != 2) {
            throw new BusinessException(ResultCode.PARAM_ERROR, "审核状态无效");
        }

        order.setAuditStatus(dto.getAuditStatus());
        order.setAuditor(UserContext.getUsername());
        order.setAuditTime(LocalDateTime.now());
        order.setAuditRemark(dto.getAuditRemark());

        if (dto.getAuditStatus() == 2) {
            order.setStatus(WorkOrderStatusEnum.CANCELLED.getCode());
        }

        this.updateById(order);

        if (dto.getAuditStatus() == 1 && Boolean.TRUE.equals(dto.getAutoReserveMaterial()) && order.getMaterialId() != null) {
            autoReserveMaterial(order.getId());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void autoReserveMaterial(Long workOrderId) {
        ColdHeadingWorkOrder order = this.getById(workOrderId);
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "工单不存在");
        }
        if (order.getAuditStatus() == null || order.getAuditStatus() != 1) {
            throw new BusinessException(ResultCode.OPERATION_NOT_ALLOWED, "工单未审核通过");
        }
        if (order.getMaterialId() == null || order.getMaterialUsage() == null) {
            throw new BusinessException(ResultCode.PARAM_ERROR, "工单未指定原料或用量");
        }

        List<MaterialBatch> batches = materialBatchMapper.selectList(new LambdaQueryWrapper<MaterialBatch>()
                .eq(MaterialBatch::getMaterialId, order.getMaterialId())
                .eq(MaterialBatch::getStatus, 0)
                .gt(MaterialBatch::getAvailableQuantity, 0)
                .orderByAsc(MaterialBatch::getInboundTime));

        if (batches.isEmpty()) {
            throw new BusinessException(ResultCode.OPERATION_NOT_ALLOWED, "该原料无可用库存");
        }

        BigDecimal needQuantity = order.getMaterialUsage();
        for (MaterialBatch batch : batches) {
            if (needQuantity.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }
            BigDecimal available = batch.getAvailableQuantity().subtract(batch.getReservedQuantity() != null ? batch.getReservedQuantity() : BigDecimal.ZERO);
            if (available.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }
            BigDecimal reserveQty = needQuantity.min(available);
            materialReservationService.createReservation(workOrderId, order.getMaterialId(), batch.getId(), reserveQty);
            needQuantity = needQuantity.subtract(reserveQty);
        }

        if (needQuantity.compareTo(BigDecimal.ZERO) > 0) {
            materialReservationService.releaseReservation(workOrderId);
            throw new BusinessException(ResultCode.OPERATION_NOT_ALLOWED, "库存不足，还缺：" + needQuantity);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void reserveMaterial(Long workOrderId, Long batchId, BigDecimal quantity) {
        ColdHeadingWorkOrder order = this.getById(workOrderId);
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "工单不存在");
        }
        if (order.getAuditStatus() == null || order.getAuditStatus() != 1) {
            throw new BusinessException(ResultCode.OPERATION_NOT_ALLOWED, "工单未审核通过，无法预占原料");
        }

        materialReservationService.createReservation(workOrderId, order.getMaterialId(), batchId, quantity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void releaseMaterial(Long workOrderId) {
        materialReservationService.releaseReservation(workOrderId);
    }

    private void initProcesses(Long workOrderId, String orderNo) {
        for (Map.Entry<String, String> entry : PROCESS_MAP.entrySet()) {
            WorkOrderProcess process = new WorkOrderProcess();
            process.setWorkOrderId(workOrderId);
            process.setOrderNo(orderNo);
            process.setProcessCode(entry.getKey());
            process.setProcessName(entry.getValue());
            process.setProcessStatus(0);
            process.setInputQuantity(0);
            process.setOutputQuantity(0);
            process.setScrapQuantity(0);
            process.setProcessDuration(BigDecimal.ZERO);
            processMapper.insert(process);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void startWorkOrder(Long id) {
        ColdHeadingWorkOrder order = this.getById(id);
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "工单不存在");
        }

        if (order.getAuditStatus() == null || order.getAuditStatus() != 1) {
            throw new BusinessException(ResultCode.OPERATION_NOT_ALLOWED, "工单未审核通过，无法启动");
        }

        if (order.getMaterialId() != null && (order.getMaterialReservedQuantity() == null
                || order.getMaterialReservedQuantity().compareTo(order.getMaterialUsage()) < 0)) {
            throw new BusinessException(ResultCode.OPERATION_NOT_ALLOWED, "原料未完成预占，请先完成原料预占");
        }

        if (!WorkOrderStatusEnum.PENDING.getCode().equals(order.getStatus())) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR, "工单状态不允许启动");
        }

        if (order.getMaterialId() != null && order.getMaterialUsage() != null && order.getMaterialUsage().compareTo(BigDecimal.ZERO) > 0) {
            materialReservationService.consumeReservation(id, order.getMaterialUsage());
        }

        order.setStatus(WorkOrderStatusEnum.CUTTING.getCode());
        order.setActualStartTime(LocalDateTime.now());
        this.updateById(order);

        WorkOrderProcess firstProcess = processMapper.selectByWorkOrderIdAndProcessCode(id, "CUTTING");
        if (firstProcess != null) {
            firstProcess.setProcessStatus(1);
            firstProcess.setStartTime(LocalDateTime.now());
            processMapper.updateById(firstProcess);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void startProcess(ProcessStartDTO dto) {
        ColdHeadingWorkOrder order = this.getById(dto.getWorkOrderId());
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "工单不存在");
        }

        if (WorkOrderStatusEnum.FROZEN.getCode().equals(order.getStatus())
                || WorkOrderStatusEnum.CANCELLED.getCode().equals(order.getStatus())
                || WorkOrderStatusEnum.FINISHED.getCode().equals(order.getStatus())) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR, "工单状态不允许开始工序");
        }

        if (!PROCESS_MAP.containsKey(dto.getProcessCode())) {
            throw new BusinessException(ResultCode.PARAM_ERROR, "无效的工序编码");
        }

        int expectedStatus = getExpectedStatusForProcess(dto.getProcessCode());
        if (!order.getStatus().equals(expectedStatus)) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR, "请按工序顺序进行加工");
        }

        WorkOrderProcess process = processMapper.selectByWorkOrderIdAndProcessCode(dto.getWorkOrderId(), dto.getProcessCode());
        if (process == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "工序记录不存在");
        }

        if (process.getProcessStatus() != 0) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR, "该工序已开始或已完成");
        }

        process.setProcessStatus(1);
        process.setOperator(dto.getOperator() != null ? dto.getOperator() : UserContext.getUsername());
        process.setWorkCenter(dto.getWorkCenter());
        process.setMachineCode(dto.getMachineCode());
        process.setStartTime(LocalDateTime.now());
        process.setInputQuantity(dto.getInputQuantity() != null ? dto.getInputQuantity() : order.getPlanQuantity());
        process.setProcessParams(dto.getProcessParams());
        processMapper.updateById(process);
    }

    private int getExpectedStatusForProcess(String processCode) {
        return switch (processCode) {
            case "CUTTING" -> WorkOrderStatusEnum.CUTTING.getCode();
            case "COLD_HEADING" -> WorkOrderStatusEnum.COLD_HEADING.getCode();
            case "THREAD_ROLLING" -> WorkOrderStatusEnum.THREAD_ROLLING.getCode();
            case "GALVANIZING" -> WorkOrderStatusEnum.GALVANIZING.getCode();
            case "QUENCHING" -> WorkOrderStatusEnum.QUENCHING.getCode();
            case "INSPECTION" -> WorkOrderStatusEnum.INSPECTION.getCode();
            case "PACKAGING" -> WorkOrderStatusEnum.PACKAGING.getCode();
            default -> -1;
        };
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void completeProcess(ProcessCompleteDTO dto) {
        WorkOrderProcess process = processMapper.selectById(dto.getProcessId());
        if (process == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "工序记录不存在");
        }

        if (process.getProcessStatus() != 1) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR, "该工序未开始或已完成");
        }

        ColdHeadingWorkOrder order = this.getById(process.getWorkOrderId());
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "工单不存在");
        }

        process.setProcessStatus(2);
        process.setEndTime(LocalDateTime.now());
        if (process.getStartTime() != null) {
            long minutes = ChronoUnit.MINUTES.between(process.getStartTime(), process.getEndTime());
            process.setProcessDuration(BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 2, BigDecimal.ROUND_HALF_UP));
        }
        process.setOutputQuantity(dto.getOutputQuantity() != null ? dto.getOutputQuantity() : process.getInputQuantity());
        process.setScrapQuantity(dto.getScrapQuantity() != null ? dto.getScrapQuantity() : 0);
        process.setInspectionResult(dto.getInspectionResult());
        process.setRemark(dto.getRemark());
        processMapper.updateById(process);

        int outputQty = process.getOutputQuantity() != null ? process.getOutputQuantity() : 0;
        int scrapQty = process.getScrapQuantity() != null ? process.getScrapQuantity() : 0;

        LambdaQueryWrapper<WorkOrderProcess> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrderProcess::getWorkOrderId, order.getId());
        wrapper.eq(WorkOrderProcess::getProcessStatus, 2);
        List<WorkOrderProcess> completedProcesses = processMapper.selectList(wrapper);

        int totalOutput = completedProcesses.stream()
                .map(p -> p.getOutputQuantity() != null ? p.getOutputQuantity() : 0)
                .max(Comparator.naturalOrder())
                .orElse(0);
        int totalScrap = completedProcesses.stream()
                .mapToInt(p -> p.getScrapQuantity() != null ? p.getScrapQuantity() : 0)
                .sum();

        order.setActualQuantity(totalOutput);
        order.setScrapQuantity(totalScrap);

        String nextProcessCode = getNextProcessCode(process.getProcessCode());
        if (nextProcessCode != null) {
            order.setStatus(getExpectedStatusForProcess(nextProcessCode));
            WorkOrderProcess nextProcess = processMapper.selectByWorkOrderIdAndProcessCode(order.getId(), nextProcessCode);
            if (nextProcess != null) {
                nextProcess.setInputQuantity(outputQty);
                nextProcess.setProcessStatus(1);
                nextProcess.setStartTime(LocalDateTime.now());
                nextProcess.setOperator(process.getOperator());
                nextProcess.setWorkCenter(process.getWorkCenter());
                nextProcess.setMachineCode(process.getMachineCode());
                processMapper.updateById(nextProcess);
            }
        } else {
            order.setStatus(WorkOrderStatusEnum.FINISHED.getCode());
            order.setActualEndTime(LocalDateTime.now());
        }

        this.updateById(order);
    }

    private String getNextProcessCode(String currentCode) {
        List<String> codes = Arrays.asList("CUTTING", "COLD_HEADING", "THREAD_ROLLING", "GALVANIZING", "QUENCHING", "INSPECTION", "PACKAGING");
        int index = codes.indexOf(currentCode);
        if (index >= 0 && index < codes.size() - 1) {
            return codes.get(index + 1);
        }
        return null;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancelWorkOrder(Long id) {
        ColdHeadingWorkOrder order = this.getById(id);
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "工单不存在");
        }

        if (WorkOrderStatusEnum.FINISHED.getCode().equals(order.getStatus())
                || WorkOrderStatusEnum.CANCELLED.getCode().equals(order.getStatus())) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR, "工单状态不允许取消");
        }

        materialReservationService.releaseReservation(id);

        order.setStatus(WorkOrderStatusEnum.CANCELLED.getCode());
        this.updateById(order);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void freezeWorkOrder(Long id) {
        ColdHeadingWorkOrder order = this.getById(id);
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "工单不存在");
        }

        if (WorkOrderStatusEnum.FINISHED.getCode().equals(order.getStatus())
                || WorkOrderStatusEnum.CANCELLED.getCode().equals(order.getStatus())
                || WorkOrderStatusEnum.FROZEN.getCode().equals(order.getStatus())) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR, "工单状态不允许冻结");
        }

        order.setStatus(WorkOrderStatusEnum.FROZEN.getCode());
        this.updateById(order);
    }

    @Override
    public List<WorkOrderProcess> getProcessList(Long workOrderId) {
        return processMapper.selectByWorkOrderId(workOrderId);
    }
}
