package com.fitness.manufacture.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.fitness.manufacture.entity.WorkOrderProcess;

import java.util.List;

public interface WorkOrderProcessService extends IService<WorkOrderProcess> {

    void initWorkOrderProcesses(Long workOrderId);

    List<WorkOrderProcess> getProcessesByWorkOrderId(Long workOrderId);

    void startProcess(Long id);

    void completeProcess(Long id);

    void skipProcess(Long id, String reason);

    void qualityCheck(Long id, String result, String issue);
}
