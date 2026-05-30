package com.bee.equipment.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.bee.equipment.mapper.OperationLogMapper;
import com.bee.equipment.po.OperationLogPO;
import com.bee.equipment.service.OperationLogService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class OperationLogServiceImpl extends ServiceImpl<OperationLogMapper, OperationLogPO> implements OperationLogService {

    @Override
    @Async
    public void saveLogAsync(OperationLogPO log) {
        save(log);
    }
}
