package com.cosmetics.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cosmetics.common.PageQuery;
import com.cosmetics.entity.OperationLog;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface OperationLogService {

    Page<OperationLog> getPage(PageQuery pageQuery, Long userId, String module, Integer status, LocalDate startDate, LocalDate endDate);

    OperationLog getById(Long id);

    void saveLog(OperationLog log);

    Map<String, Object> getStatistics(LocalDate startDate, LocalDate endDate);

    List<Map<String, Object>> getTopOperations(LocalDate startDate, LocalDate endDate, Integer limit);
}
