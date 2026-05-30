package com.valve.manufacture.service;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.valve.manufacture.entity.WorkOrder;
import com.valve.manufacture.entity.WorkOrderMaterial;
import com.valve.manufacture.entity.WorkOrderProcess;
import com.valve.manufacture.exception.BusinessException;
import com.valve.manufacture.mapper.WorkOrderMapper;
import com.valve.manufacture.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class WorkOrderService extends ServiceImpl<WorkOrderMapper, WorkOrder> {

    private final WorkOrderProcessService processService;
    private final WorkOrderMaterialService materialService;
    private final RedisUtil redisUtil;
    private static final String WORK_ORDER_CACHE_KEY = "workOrder:";

    @Transactional(rollbackFor = Exception.class)
    public WorkOrder create(WorkOrder workOrder, Long userId) {
        validateWorkOrder(workOrder);
        String orderNo = generateOrderNo();
        workOrder.setOrderNo(orderNo);
        workOrder.setStatus("PENDING");
        if (workOrder.getPriority() == null) {
            workOrder.setPriority(0);
        }
        save(workOrder);

        if (workOrder.getProcesses() != null && !workOrder.getProcesses().isEmpty()) {
            for (int i = 0; i < workOrder.getProcesses().size(); i++) {
                WorkOrderProcess process = workOrder.getProcesses().get(i);
                process.setWorkOrderId(workOrder.getId());
                process.setProcessOrder(i + 1);
                process.setStatus("PENDING");
            }
            processService.saveBatch(workOrder.getProcesses());
        } else {
            createDefaultProcesses(workOrder.getId());
        }

        clearWorkOrderCache();
        return getDetail(workOrder.getId());
    }

    private void validateWorkOrder(WorkOrder workOrder) {
        if (workOrder.getProductCategoryId() == null) {
            throw new BusinessException("产品分类不能为空");
        }
        if (workOrder.getProductName() == null || workOrder.getProductName().trim().isEmpty()) {
            throw new BusinessException("产品名称不能为空");
        }
        if (workOrder.getQuantity() == null || workOrder.getQuantity() <= 0) {
            throw new BusinessException("生产数量必须大于0");
        }
    }

    private String generateOrderNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = IdUtil.randomUUID().substring(0, 8).toUpperCase();
        return "WO-" + dateStr + "-" + random;
    }

    private void createDefaultProcesses(Long workOrderId) {
        List<WorkOrderProcess> processes = new ArrayList<>();
        String[][] defaultProcesses = {
                {"CUTTING", "下料工序", "1"},
                {"TURNING", "数控车削", "2"},
                {"GRINDING", "密封面研磨", "3"},
                {"TESTING", "压力测试", "4"},
                {"RUST_PROOF", "防锈处理", "5"}
        };

        for (String[] p : defaultProcesses) {
            WorkOrderProcess process = new WorkOrderProcess();
            process.setWorkOrderId(workOrderId);
            process.setProcessCode(p[0]);
            process.setProcessName(p[1]);
            process.setProcessOrder(Integer.parseInt(p[2]));
            process.setStatus("PENDING");
            processes.add(process);
        }
        processService.saveBatch(processes);
    }

    public WorkOrder getDetail(Long id) {
        String cacheKey = WORK_ORDER_CACHE_KEY + id;
        Object cached = redisUtil.get(cacheKey);
        if (cached != null) {
            return (WorkOrder) cached;
        }

        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        workOrder.setProcesses(processService.getByWorkOrderId(id));
        workOrder.setMaterials(materialService.getByWorkOrderId(id));

        redisUtil.set(cacheKey, workOrder, 5, TimeUnit.MINUTES);
        return workOrder;
    }

    @Transactional(rollbackFor = Exception.class)
    public WorkOrder start(Long id, Long userId) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (!"PENDING".equals(workOrder.getStatus()) && !"PAUSED".equals(workOrder.getStatus())) {
            throw new BusinessException("当前状态不允许开始，工单状态：" + workOrder.getStatus());
        }
        if (workOrder.getActualStartDate() == null) {
            workOrder.setActualStartDate(LocalDateTime.now());
        }

        List<WorkOrderProcess> processes = processService.getByWorkOrderId(id);
        if (processes.isEmpty()) {
            throw new BusinessException("工单没有配置工序");
        }

        WorkOrderProcess currentProcess = findCurrentProcess(processes);
        if (currentProcess == null) {
            throw new BusinessException("没有找到待执行的工序");
        }

        currentProcess.setStatus("PROCESSING");
        currentProcess.setStartTime(LocalDateTime.now());
        currentProcess.setOperatorId(userId);
        processService.updateById(currentProcess);

        workOrder.setStatus(currentProcess.getProcessCode());
        updateById(workOrder);
        clearWorkOrderCache(id);

        return getDetail(id);
    }

    private WorkOrderProcess findCurrentProcess(List<WorkOrderProcess> processes) {
        for (WorkOrderProcess process : processes) {
            if ("PENDING".equals(process.getStatus())) {
                return process;
            }
            if ("PROCESSING".equals(process.getStatus())) {
                return process;
            }
        }
        return null;
    }

    @Transactional(rollbackFor = Exception.class)
    public WorkOrder completeProcess(Long id, Long processId, BigDecimal workHours, String remark, Long userId) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        WorkOrderProcess currentProcess = processService.getById(processId);
        if (currentProcess == null) {
            throw new BusinessException("工序不存在");
        }
        if (!"PROCESSING".equals(currentProcess.getStatus())) {
            throw new BusinessException("当前工序未在进行中");
        }

        currentProcess.setStatus("FINISHED");
        currentProcess.setEndTime(LocalDateTime.now());
        currentProcess.setWorkHours(workHours);
        currentProcess.setRemark(remark);
        processService.updateById(currentProcess);

        List<WorkOrderProcess> processes = processService.getByWorkOrderId(id);
        WorkOrderProcess nextProcess = findNextProcess(processes, currentProcess.getProcessOrder());

        if (nextProcess != null) {
            nextProcess.setStatus("PROCESSING");
            nextProcess.setStartTime(LocalDateTime.now());
            nextProcess.setOperatorId(userId);
            processService.updateById(nextProcess);
            workOrder.setStatus(nextProcess.getProcessCode());
        } else {
            workOrder.setStatus("FINISHED");
            workOrder.setActualEndDate(LocalDateTime.now());
        }
        updateById(workOrder);
        clearWorkOrderCache(id);

        return getDetail(id);
    }

    private WorkOrderProcess findNextProcess(List<WorkOrderProcess> processes, Integer currentOrder) {
        for (WorkOrderProcess process : processes) {
            if (process.getProcessOrder() > currentOrder && "PENDING".equals(process.getStatus())) {
                return process;
            }
        }
        return null;
    }

    @Transactional(rollbackFor = Exception.class)
    public WorkOrder pause(Long id, String reason) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if ("PENDING".equals(workOrder.getStatus()) || "FINISHED".equals(workOrder.getStatus()) ||
            "CANCELLED".equals(workOrder.getStatus()) || "PAUSED".equals(workOrder.getStatus())) {
            throw new BusinessException("工单状态不允许暂停");
        }

        workOrder.setStatus("PAUSED");
        workOrder.setRemark(reason);
        updateById(workOrder);
        clearWorkOrderCache(id);

        return getDetail(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public WorkOrder cancel(Long id, String reason) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if ("FINISHED".equals(workOrder.getStatus())) {
            throw new BusinessException("已完成工单不能取消");
        }

        workOrder.setStatus("CANCELLED");
        workOrder.setRemark(reason);
        updateById(workOrder);
        clearWorkOrderCache(id);

        return getDetail(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateAssignee(Long id, Long assigneeId) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        workOrder.setAssigneeId(assigneeId);
        updateById(workOrder);
        clearWorkOrderCache(id);
    }

    public Page<WorkOrder> pageWithCondition(Integer current, Integer size, String productName,
                                              String status, Long assigneeId, LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        if (productName != null && !productName.isEmpty()) {
            wrapper.like(WorkOrder::getProductName, productName);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(WorkOrder::getStatus, status);
        }
        if (assigneeId != null) {
            wrapper.eq(WorkOrder::getAssigneeId, assigneeId);
        }
        if (startDate != null) {
            wrapper.ge(WorkOrder::getPlanStartDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(WorkOrder::getPlanEndDate, endDate);
        }
        wrapper.eq(WorkOrder::getDeleted, 0);
        wrapper.orderByDesc(WorkOrder::getPriority);
        wrapper.orderByDesc(WorkOrder::getCreateTime);

        return page(new Page<>(current, size), wrapper);
    }

    public void checkOverdueOrders() {
        LocalDate today = LocalDate.now();
        List<WorkOrder> orders = list(new LambdaQueryWrapper<WorkOrder>()
                .in(WorkOrder::getStatus, "PENDING", "CUTTING", "TURNING", "GRINDING", "TESTING", "RUST_PROOF")
                .lt(WorkOrder::getPlanEndDate, today)
                .eq(WorkOrder::getDeleted, 0));

        for (WorkOrder order : orders) {
            order.setStatus("PAUSED");
            order.setRemark("系统自动暂停：工单已超期");
            updateById(order);
            clearWorkOrderCache(order.getId());
        }
    }

    private void clearWorkOrderCache(Long id) {
        if (id != null) {
            redisUtil.delete(WORK_ORDER_CACHE_KEY + id);
        }
    }

    private void clearWorkOrderCache() {
    }

    public List<WorkOrder> getPendingOrders() {
        return list(new LambdaQueryWrapper<WorkOrder>()
                .eq(WorkOrder::getStatus, "PENDING")
                .eq(WorkOrder::getDeleted, 0)
                .orderByAsc(WorkOrder::getPlanStartDate));
    }

    public List<WorkOrder> getInProgressOrders() {
        return list(new LambdaQueryWrapper<WorkOrder>()
                .in(WorkOrder::getStatus, "CUTTING", "TURNING", "GRINDING", "TESTING", "RUST_PROOF")
                .eq(WorkOrder::getDeleted, 0)
                .orderByDesc(WorkOrder::getPriority));
    }
}
