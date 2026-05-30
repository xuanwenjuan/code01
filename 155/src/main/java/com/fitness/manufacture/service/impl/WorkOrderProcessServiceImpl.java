package com.fitness.manufacture.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fitness.manufacture.common.BusinessException;
import com.fitness.manufacture.common.ResultCode;
import com.fitness.manufacture.entity.WorkOrder;
import com.fitness.manufacture.entity.WorkOrderProcess;
import com.fitness.manufacture.mapper.WorkOrderMapper;
import com.fitness.manufacture.mapper.WorkOrderProcessMapper;
import com.fitness.manufacture.service.WorkOrderProcessService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkOrderProcessServiceImpl extends ServiceImpl<WorkOrderProcessMapper, WorkOrderProcess> implements WorkOrderProcessService {

    private final WorkOrderProcessMapper workOrderProcessMapper;
    private final WorkOrderMapper workOrderMapper;

    private static final List<String[]> PROCESSES = Arrays.asList(
            new String[]{"CUT_BEND", "管材切割折弯", "1"},
            new String[]{"WELDING", "框架焊接加固", "2"},
            new String[]{"ASSEMBLE", "配件组合装配", "3"},
            new String[]{"ADJUST", "弹力部件调试", "4"},
            new String[]{"SAFETY_TEST", "承重安全测试", "5"},
            new String[]{"POLISH", "外观打磨处理", "6"},
            new String[]{"PACK", "打包封箱入库", "7"}
    );

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void initWorkOrderProcesses(Long workOrderId) {
        LambdaQueryWrapper<WorkOrderProcess> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrderProcess::getWorkOrderId, workOrderId);
        if (workOrderProcessMapper.selectCount(wrapper) > 0) {
            return;
        }

        int order = 1;
        for (String[] process : PROCESSES) {
            WorkOrderProcess wp = new WorkOrderProcess();
            wp.setWorkOrderId(workOrderId);
            wp.setProcessCode(process[0]);
            wp.setProcessName(process[1]);
            wp.setProcessOrder(order++);
            wp.setStatus(0);
            workOrderProcessMapper.insert(wp);
        }

        WorkOrder workOrder = workOrderMapper.selectById(workOrderId);
        workOrder.setCurrentProcess(PROCESSES.get(0)[1]);
        workOrderMapper.updateById(workOrder);
    }

    @Override
    public List<WorkOrderProcess> getProcessesByWorkOrderId(Long workOrderId) {
        LambdaQueryWrapper<WorkOrderProcess> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrderProcess::getWorkOrderId, workOrderId);
        wrapper.orderByAsc(WorkOrderProcess::getProcessOrder);
        return workOrderProcessMapper.selectList(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void startProcess(Long id) {
        WorkOrderProcess process = workOrderProcessMapper.selectById(id);
        if (process == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (process.getStatus() != 0) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "工序状态不正确");
        }

        process.setStatus(1);
        process.setStartTime(LocalDateTime.now());
        workOrderProcessMapper.updateById(process);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void completeProcess(Long id) {
        WorkOrderProcess process = workOrderProcessMapper.selectById(id);
        if (process == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (process.getStatus() != 1) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "工序未开始");
        }

        process.setStatus(2);
        process.setEndTime(LocalDateTime.now());
        if (process.getStartTime() != null) {
            Duration duration = Duration.between(process.getStartTime(), process.getEndTime());
            process.setHoursUsed(new BigDecimal(duration.toMinutes()).divide(new BigDecimal(60), 2, RoundingMode.HALF_UP));
        }
        workOrderProcessMapper.updateById(process);

        List<WorkOrderProcess> processes = getProcessesByWorkOrderId(process.getWorkOrderId());
        long completedCount = processes.stream().filter(p -> p.getStatus() == 2).count();
        int progress = (int) ((double) completedCount / processes.size() * 100);

        WorkOrder workOrder = workOrderMapper.selectById(process.getWorkOrderId());
        workOrder.setProcessProgress(progress);

        WorkOrderProcess nextProcess = processes.stream()
                .filter(p -> p.getStatus() == 0)
                .findFirst()
                .orElse(null);

        if (nextProcess != null) {
            workOrder.setCurrentProcess(nextProcess.getProcessName());
        } else if (progress == 100) {
            workOrder.setStatus(4);
            workOrder.setCurrentProcess("质检中");
        }

        BigDecimal totalHours = processes.stream()
                .filter(p -> p.getHoursUsed() != null)
                .map(WorkOrderProcess::getHoursUsed)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        workOrder.setTotalHours(totalHours);

        workOrderMapper.updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void skipProcess(Long id, String reason) {
        WorkOrderProcess process = workOrderProcessMapper.selectById(id);
        if (process == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (process.getStatus() != 0) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "工序状态不正确");
        }

        process.setStatus(3);
        process.setRemark(reason);
        workOrderProcessMapper.updateById(process);

        List<WorkOrderProcess> processes = getProcessesByWorkOrderId(process.getWorkOrderId());
        long completedCount = processes.stream().filter(p -> p.getStatus() == 2 || p.getStatus() == 3).count();
        int progress = (int) ((double) completedCount / processes.size() * 100);

        WorkOrder workOrder = workOrderMapper.selectById(process.getWorkOrderId());
        workOrder.setProcessProgress(progress);
        workOrderMapper.updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void qualityCheck(Long id, String result, String issue) {
        WorkOrderProcess process = workOrderProcessMapper.selectById(id);
        if (process == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (!"SAFETY_TEST".equals(process.getProcessCode())) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "只有安全测试工序需要质检");
        }
        if (process.getStatus() != 2) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "工序未完成");
        }

        process.setQualityCheckResult(result);
        process.setQualityIssue(issue);
        process.setQualityCheckTime(LocalDateTime.now());
        workOrderProcessMapper.updateById(process);
    }
}
