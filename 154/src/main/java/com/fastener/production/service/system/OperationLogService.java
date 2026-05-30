package com.fastener.production.service.system;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.fastener.production.common.entity.PageQuery;
import com.fastener.production.entity.system.OperationLog;

public interface OperationLogService extends IService<OperationLog> {

    IPage<OperationLog> page(PageQuery pageQuery, Integer operationType, String moduleCode,
                             Long operatorId, String startTime, String endTime);

    void asyncSaveLog(OperationLog log);
}
