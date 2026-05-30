package com.amber.polish.task;

import com.amber.polish.service.RawStoneService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RawStoneInspectionTask {

    private final RawStoneService rawStoneService;

    @Scheduled(cron = "0 0 2 * * ?")
    public void inspectOverdueStones() {
        log.info("开始执行存放超时原石巡检定时任务");
        try {
            rawStoneService.inspectOverdueStones();
            log.info("存放超时原石巡检定时任务执行完成");
        } catch (Exception e) {
            log.error("存放超时原石巡检定时任务执行异常", e);
        }
    }
}
