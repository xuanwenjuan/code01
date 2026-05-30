package com.paper.production.service.workorder.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.paper.production.common.PageQuery;
import com.paper.production.common.PageResult;
import com.paper.production.common.ResultCode;
import com.paper.production.dto.workorder.WorkOrderConfirmDTO;
import com.paper.production.dto.workorder.WorkOrderDTO;
import com.paper.production.dto.workorder.WorkOrderProcessDTO;
import com.paper.production.entity.material.Material;
import com.paper.production.entity.workorder.WorkOrder;
import com.paper.production.entity.workorder.WorkOrderMaterial;
import com.paper.production.entity.workorder.WorkOrderProcess;
import com.paper.production.enums.WorkOrderStatusEnum;
import com.paper.production.exception.BusinessException;
import com.paper.production.mapper.material.MaterialMapper;
import com.paper.production.service.material.MaterialService;
import com.paper.production.mapper.workorder.WorkOrderMapper;
import com.paper.production.mapper.workorder.WorkOrderMaterialMapper;
import com.paper.production.mapper.workorder.WorkOrderProcessMapper;
import com.paper.production.service.workorder.WorkOrderService;
import com.paper.production.utils.UserContextUtil;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
public class WorkOrderServiceImpl extends ServiceImpl<WorkOrderMapper, WorkOrder> implements WorkOrderService {

    @Resource
    private WorkOrderProcessMapper workOrderProcessMapper;

    @Resource
    private WorkOrderMaterialMapper workOrderMaterialMapper;

    @Resource
    private MaterialMapper materialMapper;

    @Resource
    private MaterialService materialService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createWorkOrder(WorkOrderDTO dto) {
        String orderNo = generateOrderNo();

        WorkOrder workOrder = new WorkOrder();
        BeanUtils.copyProperties(dto, workOrder);
        workOrder.setOrderNo(orderNo);
        workOrder.setStatus(WorkOrderStatusEnum.PENDING.getCode());
        workOrder.setFinishedQuantity(BigDecimal.ZERO);
        workOrder.setDefectiveQuantity(BigDecimal.ZERO);
        workOrder.setOperator(UserContextUtil.getUsername());
        if (workOrder.getPriority() == null) {
            workOrder.setPriority(1);
        }
        save(workOrder);

        if (dto.getMaterials() != null && !dto.getMaterials().isEmpty()) {
            for (var materialDTO : dto.getMaterials()) {
                Material material = materialMapper.selectById(materialDTO.getMaterialId());
                if (material == null) {
                    throw new BusinessException(ResultCode.DATA_NOT_EXIST.getCode(), "物料不存在：" + materialDTO.getMaterialId());
                }

                WorkOrderMaterial orderMaterial = new WorkOrderMaterial();
                orderMaterial.setWorkOrderId(workOrder.getId());
                orderMaterial.setOrderNo(orderNo);
                orderMaterial.setMaterialId(materialDTO.getMaterialId());
                orderMaterial.setMaterialCode(material.getMaterialCode());
                orderMaterial.setMaterialName(material.getMaterialName());
                orderMaterial.setSpecification(material.getSpecification());
                orderMaterial.setUnit(material.getUnit());
                orderMaterial.setPlanQuantity(materialDTO.getPlanQuantity());
                orderMaterial.setActualQuantity(BigDecimal.ZERO);
                orderMaterial.setUnitPrice(material.getUnitPrice());
                orderMaterial.setTotalPrice(materialDTO.getPlanQuantity().multiply(material.getUnitPrice()));
                orderMaterial.setRemark(materialDTO.getRemark());
                workOrderMaterialMapper.insert(orderMaterial);
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateWorkOrder(WorkOrderDTO dto) {
        if (dto.getId() == null) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), "ID不能为空");
        }

        WorkOrder workOrder = getById(dto.getId());
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        if (!WorkOrderStatusEnum.PENDING.getCode().equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR.getCode(), "工单已排产，无法修改");
        }

        BeanUtils.copyProperties(dto, workOrder);
        updateById(workOrder);

        if (dto.getMaterials() != null) {
            workOrderMaterialMapper.delete(new LambdaQueryWrapper<WorkOrderMaterial>()
                    .eq(WorkOrderMaterial::getWorkOrderId, dto.getId()));

            for (var materialDTO : dto.getMaterials()) {
                Material material = materialMapper.selectById(materialDTO.getMaterialId());
                if (material == null) {
                    throw new BusinessException(ResultCode.DATA_NOT_EXIST.getCode(), "物料不存在：" + materialDTO.getMaterialId());
                }

                WorkOrderMaterial orderMaterial = new WorkOrderMaterial();
                orderMaterial.setWorkOrderId(workOrder.getId());
                orderMaterial.setOrderNo(workOrder.getOrderNo());
                orderMaterial.setMaterialId(materialDTO.getMaterialId());
                orderMaterial.setMaterialCode(material.getMaterialCode());
                orderMaterial.setMaterialName(material.getMaterialName());
                orderMaterial.setSpecification(material.getSpecification());
                orderMaterial.setUnit(material.getUnit());
                orderMaterial.setPlanQuantity(materialDTO.getPlanQuantity());
                orderMaterial.setActualQuantity(BigDecimal.ZERO);
                orderMaterial.setUnitPrice(material.getUnitPrice());
                orderMaterial.setTotalPrice(materialDTO.getPlanQuantity().multiply(material.getUnitPrice()));
                orderMaterial.setRemark(materialDTO.getRemark());
                workOrderMaterialMapper.insert(orderMaterial);
            }
        }
    }

    @Override
    public void deleteWorkOrder(Long id) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        if (!WorkOrderStatusEnum.PENDING.getCode().equals(workOrder.getStatus())
                && !WorkOrderStatusEnum.CANCELLED.getCode().equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCode.DATA_CANNOT_DELETE.getCode(), "工单已开始生产，无法删除");
        }

        removeById(id);
        workOrderMaterialMapper.delete(new LambdaQueryWrapper<WorkOrderMaterial>()
                .eq(WorkOrderMaterial::getWorkOrderId, id));
        workOrderProcessMapper.delete(new LambdaQueryWrapper<WorkOrderProcess>()
                .eq(WorkOrderProcess::getWorkOrderId, id));
    }

    @Override
    public PageResult<WorkOrder> queryWorkOrderPage(PageQuery query) {
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(query.getKeyword())) {
            wrapper.and(w -> w.like(WorkOrder::getOrderNo, query.getKeyword())
                    .or().like(WorkOrder::getOrderName, query.getKeyword()));
        }
        wrapper.orderByDesc(WorkOrder::getPriority, WorkOrder::getCreateTime);

        Page<WorkOrder> page = page(new Page<>(query.getCurrent(), query.getSize()), wrapper);
        return PageResult.of(page.getTotal(), page.getPages(), page.getCurrent(), page.getSize(), page.getRecords());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void scheduleWorkOrder(Long id) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        if (!WorkOrderStatusEnum.PENDING.getCode().equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCode.ORDER_ALREADY_SCHEDULED);
        }

        workOrder.setStatus(WorkOrderStatusEnum.SCHEDULED.getCode());
        workOrder.setActualStartTime(LocalDateTime.now());
        updateById(workOrder);

        WorkOrderProcess process = new WorkOrderProcess();
        process.setWorkOrderId(id);
        process.setOrderNo(workOrder.getOrderNo());
        process.setProcessType(WorkOrderStatusEnum.SCHEDULED.getCode());
        process.setProcessName(WorkOrderStatusEnum.SCHEDULED.getName());
        process.setStartTime(LocalDateTime.now());
        process.setInputQuantity(workOrder.getQuantity());
        process.setOutputQuantity(BigDecimal.ZERO);
        process.setDefectiveQuantity(BigDecimal.ZERO);
        process.setOperator(UserContextUtil.getUsername());
        process.setStatus(1);
        workOrderProcessMapper.insert(process);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void startProcess(WorkOrderProcessDTO dto) {
        WorkOrder workOrder = getById(dto.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        WorkOrderStatusEnum currentStatus = WorkOrderStatusEnum.getByCode(workOrder.getStatus());
        if (currentStatus == null || currentStatus.getCode() >= WorkOrderStatusEnum.FINISHED.getCode()) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR.getCode(), "工单已完成或已取消");
        }

        if (!dto.getProcessType().equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR.getCode(), "工序顺序错误");
        }

        WorkOrderStatusEnum processStatus = WorkOrderStatusEnum.getByCode(dto.getProcessType());
        if (processStatus == null) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), "工序类型错误");
        }

        LambdaQueryWrapper<WorkOrderProcess> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrderProcess::getWorkOrderId, dto.getWorkOrderId());
        wrapper.eq(WorkOrderProcess::getProcessType, dto.getProcessType());
        if (workOrderProcessMapper.selectCount(wrapper) > 0) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR.getCode(), "该工序已开始");
        }

        WorkOrderProcess process = new WorkOrderProcess();
        process.setWorkOrderId(dto.getWorkOrderId());
        process.setOrderNo(workOrder.getOrderNo());
        process.setProcessType(dto.getProcessType());
        process.setProcessName(processStatus.getName());
        process.setStartTime(LocalDateTime.now());
        process.setInputQuantity(workOrder.getQuantity());
        process.setOutputQuantity(BigDecimal.ZERO);
        process.setDefectiveQuantity(BigDecimal.ZERO);
        process.setEquipment(dto.getEquipment());
        process.setOperator(dto.getOperator() != null ? dto.getOperator() : UserContextUtil.getUsername());
        process.setStatus(1);
        process.setRemark(dto.getRemark());
        workOrderProcessMapper.insert(process);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void finishProcess(WorkOrderProcessDTO dto) {
        WorkOrder workOrder = getById(dto.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        LambdaQueryWrapper<WorkOrderProcess> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrderProcess::getWorkOrderId, dto.getWorkOrderId());
        wrapper.eq(WorkOrderProcess::getProcessType, dto.getProcessType());
        WorkOrderProcess process = workOrderProcessMapper.selectOne(wrapper);
        if (process == null) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR.getCode(), "该工序未开始");
        }

        if (process.getEndTime() != null) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR.getCode(), "该工序已完成");
        }

        process.setEndTime(LocalDateTime.now());
        process.setOutputQuantity(dto.getOutputQuantity() != null ? dto.getOutputQuantity() : process.getInputQuantity());
        process.setDefectiveQuantity(dto.getDefectiveQuantity() != null ? dto.getDefectiveQuantity() : BigDecimal.ZERO);
        process.setStatus(2);
        workOrderProcessMapper.updateById(process);

        WorkOrderStatusEnum nextStatus = WorkOrderStatusEnum.getNextStatus(workOrder.getStatus());
        if (nextStatus != null) {
            workOrder.setStatus(nextStatus.getCode());
            workOrder.setFinishedQuantity(process.getOutputQuantity());
            workOrder.setDefectiveQuantity(workOrder.getDefectiveQuantity().add(process.getDefectiveQuantity()));

            if (WorkOrderStatusEnum.FINISHED.getCode().equals(nextStatus.getCode())) {
                workOrder.setActualEndTime(LocalDateTime.now());
            }
            updateById(workOrder);
        }
    }

    @Override
    public void cancelWorkOrder(Long id) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        if (WorkOrderStatusEnum.FINISHED.getCode().equals(workOrder.getStatus())
                || WorkOrderStatusEnum.CANCELLED.getCode().equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCode.ORDER_CANNOT_CANCEL);
        }

        workOrder.setStatus(WorkOrderStatusEnum.CANCELLED.getCode());
        updateById(workOrder);
    }

    @Override
    public List<WorkOrderProcess> getWorkOrderProcesses(Long workOrderId) {
        LambdaQueryWrapper<WorkOrderProcess> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrderProcess::getWorkOrderId, workOrderId);
        wrapper.orderByAsc(WorkOrderProcess::getProcessType);
        return workOrderProcessMapper.selectList(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void checkAndSuspendExpiredOrders() {
        LocalDateTime expireTime = LocalDateTime.now().minusHours(24);
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrder::getStatus, WorkOrderStatusEnum.PENDING.getCode());
        wrapper.lt(WorkOrder::getCreateTime, expireTime);
        List<WorkOrder> expiredOrders = list(wrapper);

        for (WorkOrder order : expiredOrders) {
            order.setStatus(WorkOrderStatusEnum.SUSPENDED.getCode());
            updateById(order);
        }
    }

    private String generateOrderNo() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int count = selectCount(new LambdaQueryWrapper<WorkOrder>()
                .likeRight(WorkOrder::getOrderNo, "WO-" + date)) + 1;
        return String.format("WO-%s-%04d", date, count);
    }

    @Override
    public List<WorkOrderMaterial> getWorkOrderMaterials(Long workOrderId) {
        LambdaQueryWrapper<WorkOrderMaterial> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrderMaterial::getWorkOrderId, workOrderId);
        wrapper.orderByAsc(WorkOrderMaterial::getId);
        return workOrderMaterialMapper.selectList(wrapper);
    }

    @Override
    public List<WorkOrder> listByStatus(Integer status) {
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrder::getStatus, status);
        wrapper.orderByDesc(WorkOrder::getPriority, WorkOrder::getCreateTime);
        return list(wrapper);
    }

    @Override
    public List<WorkOrder> getPendingOrders() {
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrder::getStatus, WorkOrderStatusEnum.PENDING.getCode());
        wrapper.orderByDesc(WorkOrder::getPriority, WorkOrder::getCreateTime);
        return list(wrapper);
    }

    @Override
    public List<WorkOrder> getProcessingOrders() {
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.ge(WorkOrder::getStatus, WorkOrderStatusEnum.SCHEDULED.getCode());
        wrapper.lt(WorkOrder::getStatus, WorkOrderStatusEnum.FINISHED.getCode());
        wrapper.orderByDesc(WorkOrder::getPriority, WorkOrder::getCreateTime);
        return list(wrapper);
    }

    @Override
    public List<WorkOrder> getFinishedOrders(LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrder::getStatus, WorkOrderStatusEnum.FINISHED.getCode());
        if (startDate != null) {
            wrapper.ge(WorkOrder::getActualEndTime, startDate.atStartOfDay());
        }
        if (endDate != null) {
            wrapper.le(WorkOrder::getActualEndTime, endDate.atTime(23, 59, 59));
        }
        wrapper.orderByDesc(WorkOrder::getActualEndTime);
        return list(wrapper);
    }

    @Override
    public Map<String, Object> getWorkOrderStatistics() {
        Map<String, Object> result = new java.util.HashMap<>();

        long totalCount = count();
        long pendingCount = count(new LambdaQueryWrapper<WorkOrder>()
                .eq(WorkOrder::getStatus, WorkOrderStatusEnum.PENDING.getCode()));
        long scheduledCount = count(new LambdaQueryWrapper<WorkOrder>()
                .eq(WorkOrder::getStatus, WorkOrderStatusEnum.SCHEDULED.getCode()));
        long processingCount = count(new LambdaQueryWrapper<WorkOrder>()
                .ge(WorkOrder::getStatus, WorkOrderStatusEnum.CUTTING.getCode())
                .lt(WorkOrder::getStatus, WorkOrderStatusEnum.FINISHED.getCode()));
        long finishedCount = count(new LambdaQueryWrapper<WorkOrder>()
                .eq(WorkOrder::getStatus, WorkOrderStatusEnum.FINISHED.getCode()));
        long suspendedCount = count(new LambdaQueryWrapper<WorkOrder>()
                .eq(WorkOrder::getStatus, WorkOrderStatusEnum.SUSPENDED.getCode()));
        long cancelledCount = count(new LambdaQueryWrapper<WorkOrder>()
                .eq(WorkOrder::getStatus, WorkOrderStatusEnum.CANCELLED.getCode()));

        result.put("totalCount", totalCount);
        result.put("pendingCount", pendingCount);
        result.put("scheduledCount", scheduledCount);
        result.put("processingCount", processingCount);
        result.put("finishedCount", finishedCount);
        result.put("suspendedCount", suspendedCount);
        result.put("cancelledCount", cancelledCount);

        return result;
    }

    @Override
    public Map<String, Object> getDailyStatistics(LocalDate date) {
        Map<String, Object> result = new java.util.HashMap<>();

        LocalDate targetDate = date != null ? date : LocalDate.now();
        LocalDateTime startOfDay = targetDate.atStartOfDay();
        LocalDateTime endOfDay = targetDate.atTime(23, 59, 59);

        LambdaQueryWrapper<WorkOrder> createdWrapper = new LambdaQueryWrapper<>();
        createdWrapper.between(WorkOrder::getCreateTime, startOfDay, endOfDay);
        long createdCount = count(createdWrapper);

        LambdaQueryWrapper<WorkOrder> finishedWrapper = new LambdaQueryWrapper<>();
        finishedWrapper.eq(WorkOrder::getStatus, WorkOrderStatusEnum.FINISHED.getCode());
        finishedWrapper.between(WorkOrder::getActualEndTime, startOfDay, endOfDay);
        List<WorkOrder> finishedOrders = list(finishedWrapper);

        BigDecimal totalQuantity = BigDecimal.ZERO;
        BigDecimal totalDefective = BigDecimal.ZERO;
        for (WorkOrder order : finishedOrders) {
            if (order.getFinishedQuantity() != null) {
                totalQuantity = totalQuantity.add(order.getFinishedQuantity());
            }
            if (order.getDefectiveQuantity() != null) {
                totalDefective = totalDefective.add(order.getDefectiveQuantity());
            }
        }

        result.put("createdCount", createdCount);
        result.put("finishedCount", finishedOrders.size());
        result.put("totalQuantity", totalQuantity);
        result.put("totalDefective", totalDefective);
        result.put("defectiveRate", totalQuantity.compareTo(BigDecimal.ZERO) > 0
                ? totalDefective.divide(totalQuantity.add(totalDefective), 4, BigDecimal.ROUND_HALF_UP)
                : BigDecimal.ZERO);

        return result;
    }

    @Override
    public Map<String, Object> getProductionEfficiency() {
        Map<String, Object> result = new java.util.HashMap<>();

        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(7);

        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrder::getStatus, WorkOrderStatusEnum.FINISHED.getCode());
        wrapper.ge(WorkOrder::getActualEndTime, weekStart.atStartOfDay());
        List<WorkOrder> orders = list(wrapper);

        int totalCount = orders.size();
        BigDecimal totalQuantity = BigDecimal.ZERO;
        long totalDuration = 0;

        for (WorkOrder order : orders) {
            if (order.getFinishedQuantity() != null) {
                totalQuantity = totalQuantity.add(order.getFinishedQuantity());
            }
            if (order.getActualStartTime() != null && order.getActualEndTime() != null) {
                totalDuration += java.time.Duration.between(order.getActualStartTime(), order.getActualEndTime()).toMinutes();
            }
        }

        result.put("weeklyCompleted", totalCount);
        result.put("weeklyOutput", totalQuantity);
        result.put("avgDuration", totalCount > 0 ? totalDuration / totalCount : 0);

        return result;
    }

    @Override
    public List<Map<String, Object>> getProcessProgress(Long workOrderId) {
        List<Map<String, Object>> result = new java.util.ArrayList<>();

        WorkOrder workOrder = getById(workOrderId);
        if (workOrder == null) {
            return result;
        }

        WorkOrderStatusEnum[] allStatuses = {
                WorkOrderStatusEnum.PENDING,
                WorkOrderStatusEnum.SCHEDULED,
                WorkOrderStatusEnum.CUTTING,
                WorkOrderStatusEnum.CORRUGATING,
                WorkOrderStatusEnum.DIE_CUTTING,
                WorkOrderStatusEnum.PRINTING,
                WorkOrderStatusEnum.GLUING,
                WorkOrderStatusEnum.INSPECTING,
                WorkOrderStatusEnum.PACKING,
                WorkOrderStatusEnum.FINISHED
        };

        List<WorkOrderProcess> processes = getWorkOrderProcesses(workOrderId);
        Map<Integer, WorkOrderProcess> processMap = processes.stream()
                .collect(java.util.stream.Collectors.toMap(WorkOrderProcess::getProcessType, p -> p));

        for (WorkOrderStatusEnum status : allStatuses) {
            Map<String, Object> item = new java.util.HashMap<>();
            item.put("status", status.getCode());
            item.put("statusName", status.getName());
            item.put("completed", workOrder.getStatus() > status.getCode());
            item.put("current", workOrder.getStatus().equals(status.getCode()));

            if (processMap.containsKey(status.getCode())) {
                WorkOrderProcess process = processMap.get(status.getCode());
                item.put("startTime", process.getStartTime());
                item.put("endTime", process.getEndTime());
                item.put("outputQuantity", process.getOutputQuantity());
                item.put("defectiveQuantity", process.getDefectiveQuantity());
                item.put("operator", process.getOperator());
                item.put("equipment", process.getEquipment());
            }

            result.add(item);
        }

        return result;
    }

    @Override
    public void updateWorkOrderPriority(Long id, Integer priority) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        workOrder.setPriority(priority);
        updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchSchedule(List<Long> ids) {
        for (Long id : ids) {
            try {
                scheduleWorkOrder(id);
            } catch (Exception e) {
                log.error("批量排产失败，工单ID：{}", id, e);
            }
        }
    }

    @Override
    public PageResult<WorkOrder> queryByStatusPage(Integer status, PageQuery query) {
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrder::getStatus, status);
        if (StrUtil.isNotBlank(query.getKeyword())) {
            wrapper.and(w -> w.like(WorkOrder::getOrderNo, query.getKeyword())
                    .or().like(WorkOrder::getOrderName, query.getKeyword()));
        }
        wrapper.orderByDesc(WorkOrder::getPriority, WorkOrder::getCreateTime);

        Page<WorkOrder> page = page(new Page<>(query.getCurrent(), query.getSize()), wrapper);
        return PageResult.of(page.getTotal(), page.getPages(), page.getCurrent(), page.getSize(), page.getRecords());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void confirmWorkOrder(WorkOrderConfirmDTO dto) {
        WorkOrder workOrder = getById(dto.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST.getCode(), "工单不存在");
        }

        if (!WorkOrderStatusEnum.PENDING.getCode().equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCode.OPERATION_ERROR.getCode(), "工单状态不正确，只有待排产工单才能确认方案");
        }

        materialService.releaseAllStockByWorkOrder(dto.getWorkOrderId());

        for (com.paper.production.dto.workorder.WorkOrderMaterialItem item : dto.getMaterials()) {
            materialService.lockStock(
                    dto.getWorkOrderId(),
                    item.getMaterialId(),
                    item.getBatchNo(),
                    item.getQuantity(),
                    UserContextUtil.getUsername()
            );

            LambdaQueryWrapper<WorkOrderMaterial> existWrapper = new LambdaQueryWrapper<>();
            existWrapper.eq(WorkOrderMaterial::getWorkOrderId, dto.getWorkOrderId());
            existWrapper.eq(WorkOrderMaterial::getMaterialId, item.getMaterialId());
            WorkOrderMaterial existMaterial = workOrderMaterialMapper.selectOne(existWrapper);

            if (existMaterial != null) {
                existMaterial.setRequiredQuantity(item.getQuantity());
                existMaterial.setBatchNo(item.getBatchNo());
                workOrderMaterialMapper.updateById(existMaterial);
            } else {
                Material material = materialMapper.selectById(item.getMaterialId());
                WorkOrderMaterial workOrderMaterial = new WorkOrderMaterial();
                workOrderMaterial.setWorkOrderId(dto.getWorkOrderId());
                workOrderMaterial.setOrderNo(workOrder.getOrderNo());
                workOrderMaterial.setMaterialId(item.getMaterialId());
                workOrderMaterial.setMaterialCode(material != null ? material.getMaterialCode() : "");
                workOrderMaterial.setMaterialName(material != null ? material.getMaterialName() : "");
                workOrderMaterial.setSpecification(material != null ? material.getSpecification() : "");
                workOrderMaterial.setRequiredQuantity(item.getQuantity());
                workOrderMaterial.setActualQuantity(BigDecimal.ZERO);
                workOrderMaterial.setUnitPrice(material != null ? material.getUnitPrice() : BigDecimal.ZERO);
                workOrderMaterial.setBatchNo(item.getBatchNo());
                workOrderMaterialMapper.insert(workOrderMaterial);
            }
        }
    }
}
