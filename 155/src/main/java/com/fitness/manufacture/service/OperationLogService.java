package com.fitness.manufacture.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.fitness.manufacture.common.PageQuery;
import com.fitness.manufacture.entity.OperationLog;

public interface OperationLogService extends IService<OperationLog> {

    IPage<OperationLog> getLogPage(PageQuery query, String module, Long userId, Integer status);
}
