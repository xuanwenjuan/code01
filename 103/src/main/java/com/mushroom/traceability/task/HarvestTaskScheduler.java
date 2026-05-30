package com.mushroom.traceability.task;

import com.mushroom.traceability.service.HarvestTaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class HarvestTaskScheduler {

    private final HarvestTaskService harvestTaskService;

    @Scheduled(cron = "0 0/30 * * * ?")
    public void expireOverdueTasks() {
        log.info("开始执行超时采收任务自动失效处理...");
        harvestTaskService.expireOverdueTasks();
        log.info("超时采收任务自动失效处理完成");
    }
}