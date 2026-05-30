package com.incense.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.incense.entity.OperationLogEntity;
import com.incense.mapper.OperationLogMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class OperationLogService extends ServiceImpl<OperationLogMapper, OperationLogEntity> {

    @Async
    public void asyncSaveLog(OperationLogEntity logEntity) {
        try {
            save(logEntity);
        } catch (Exception e) {
            log.error("异步保存操作日志失败", e);
        }
    }
}
