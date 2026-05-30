package com.cosmetics.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cosmetics.common.PageQuery;
import com.cosmetics.entity.OperationLog;
import com.cosmetics.mapper.OperationLogMapper;
import com.cosmetics.service.OperationLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OperationLogServiceImpl implements OperationLogService {

    private final OperationLogMapper operationLogMapper;

    @Override
    public Page<OperationLog> getPage(PageQuery pageQuery, Long userId, String module, Integer status, LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<OperationLog> wrapper = new LambdaQueryWrapper<>();
        if (userId != null) {
            wrapper.eq(OperationLog::getUserId, userId);
        }
        if (module != null && !module.isEmpty()) {
            wrapper.like(OperationLog::getModule, module);
        }
        if (status != null) {
            wrapper.eq(OperationLog::getStatus, status);
        }
        if (startDate != null) {
            wrapper.ge(OperationLog::getCreateTime, startDate.atStartOfDay());
        }
        if (endDate != null) {
            wrapper.le(OperationLog::getCreateTime, endDate.atTime(23, 59, 59));
        }
        wrapper.orderByDesc(OperationLog::getCreateTime);

        return operationLogMapper.selectPage(
                new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()),
                wrapper
        );
    }

    @Override
    public OperationLog getById(Long id) {
        return operationLogMapper.selectById(id);
    }

    @Override
    public void saveLog(OperationLog log) {
        operationLogMapper.insert(log);
    }

    @Override
    public Map<String, Object> getStatistics(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> stats = new HashMap<>();

        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime end = endDate != null ? endDate.atTime(23, 59, 59) : LocalDateTime.now();

        Long totalCount = operationLogMapper.selectCount(
                new LambdaQueryWrapper<OperationLog>()
                        .between(OperationLog::getCreateTime, start, end)
        );

        Long successCount = operationLogMapper.selectCount(
                new LambdaQueryWrapper<OperationLog>()
                        .between(OperationLog::getCreateTime, start, end)
                        .eq(OperationLog::getStatus, 1)
        );

        Long failCount = operationLogMapper.selectCount(
                new LambdaQueryWrapper<OperationLog>()
                        .between(OperationLog::getCreateTime, start, end)
                        .eq(OperationLog::getStatus, 0)
        );

        List<OperationLog> logs = operationLogMapper.selectList(
                new LambdaQueryWrapper<OperationLog>()
                        .between(OperationLog::getCreateTime, start, end)
        );

        double avgCostTime = logs.stream()
                .filter(log -> log.getCostTime() != null)
                .mapToLong(OperationLog::getCostTime)
                .average()
                .orElse(0.0);

        long maxCostTime = logs.stream()
                .filter(log -> log.getCostTime() != null)
                .mapToLong(OperationLog::getCostTime)
                .max()
                .orElse(0L);

        Set<String> uniqueUsers = logs.stream()
                .map(OperationLog::getUsername)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<String> uniqueModules = logs.stream()
                .map(OperationLog::getModule)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        stats.put("totalCount", totalCount);
        stats.put("successCount", successCount);
        stats.put("failCount", failCount);
        stats.put("successRate", totalCount > 0 ? (successCount * 100.0 / totalCount) : 0);
        stats.put("avgCostTime", avgCostTime);
        stats.put("maxCostTime", maxCostTime);
        stats.put("uniqueUsers", uniqueUsers.size());
        stats.put("uniqueModules", uniqueModules.size());

        return stats;
    }

    @Override
    public List<Map<String, Object>> getTopOperations(LocalDate startDate, LocalDate endDate, Integer limit) {
        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime end = endDate != null ? endDate.atTime(23, 59, 59) : LocalDateTime.now();

        List<OperationLog> logs = operationLogMapper.selectList(
                new LambdaQueryWrapper<OperationLog>()
                        .between(OperationLog::getCreateTime, start, end)
        );

        Map<String, Long> operationCount = logs.stream()
                .collect(Collectors.groupingBy(
                        log -> log.getModule() + " - " + log.getOperation(),
                        Collectors.counting()
                ));

        return operationCount.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(limit != null ? limit : 10)
                .map(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("operation", entry.getKey());
                    item.put("count", entry.getValue());
                    return item;
                })
                .collect(Collectors.toList());
    }
}
