package com.paper.production.service.system;

import com.baomidou.mybatisplus.extension.service.IService;
import com.paper.production.common.PageQuery;
import com.paper.production.common.PageResult;
import com.paper.production.entity.system.OperationLog;

public interface OperationLogService extends IService<OperationLog> {

    PageResult<OperationLog> queryLogPage(PageQuery query);

    void saveLogAsync(OperationLog log);
}
