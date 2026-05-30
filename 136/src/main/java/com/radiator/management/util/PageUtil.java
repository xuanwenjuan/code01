package com.radiator.management.util;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.radiator.management.dto.PageRequest;
import com.radiator.management.dto.PageResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;

@Component
public class PageUtil {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String CACHE_PREFIX = "page_cache:";
    private static final long CACHE_TIMEOUT = 30;

    public <T> PageResult<T> executePageQuery(
            PageRequest pageRequest,
            Function<LambdaQueryWrapper<T>, List<T>> queryFunction,
            Function<LambdaQueryWrapper<T>, Long> countFunction,
            Class<T> entityClass,
            String cacheKey) {

        String fullCacheKey = CACHE_PREFIX + cacheKey + ":" + pageRequest.hashCode();
        if (cacheKey != null && Boolean.TRUE.equals(redisTemplate.hasKey(fullCacheKey))) {
            try {
                return (PageResult<T>) redisTemplate.opsForValue().get(fullCacheKey);
            } catch (Exception e) {
            }
        }

        int current = Math.max(pageRequest.getPage(), 1);
        int size = Math.min(Math.max(pageRequest.getSize(), 1), 100);

        LambdaQueryWrapper<T> wrapper = new LambdaQueryWrapper<>();
        applyFilters(wrapper, pageRequest.getFilters(), entityClass);
        applySorting(wrapper, pageRequest.getSortField(), pageRequest.getSortOrder());

        long total = countFunction.apply(wrapper);

        wrapper.last("LIMIT " + (current - 1) * size + ", " + size);
        List<T> records = queryFunction.apply(wrapper);

        PageResult<T> result = new PageResult<>();
        result.setRecords(records);
        result.setTotal(total);
        result.setPage(current);
        result.setSize(size);

        if (cacheKey != null && total > 0) {
            try {
                redisTemplate.opsForValue().set(fullCacheKey, result, CACHE_TIMEOUT, TimeUnit.MINUTES);
            } catch (Exception e) {
            }
        }

        return result;
    }

    private <T> void applyFilters(LambdaQueryWrapper<T> wrapper,
                                   Map<String, Object> filters,
                                   Class<T> entityClass) {
        if (filters == null || filters.isEmpty()) {
            return;
        }

        for (Map.Entry<String, Object> entry : filters.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();

            if (value == null) {
                continue;
            }

            if (value instanceof String) {
                String strValue = (String) value;
                if (strValue.contains("%")) {
                    wrapper.apply(key + " LIKE {0}", strValue);
                } else {
                    wrapper.apply(key + " = {0}", strValue);
                }
            } else if (value instanceof List) {
                wrapper.apply(key + " IN ({0})", value);
            } else {
                wrapper.apply(key + " = {0}", value);
            }
        }
    }

    private <T> void applySorting(LambdaQueryWrapper<T> wrapper,
                                   String sortField,
                                   String sortOrder) {
        if (sortField != null && !sortField.isEmpty()) {
            if ("asc".equalsIgnoreCase(sortOrder)) {
                wrapper.last("ORDER BY " + sortField + " ASC");
            } else {
                wrapper.last("ORDER BY " + sortField + " DESC");
            }
        }
    }

    public void clearCache(String cacheKeyPattern) {
        try {
            String pattern = CACHE_PREFIX + cacheKeyPattern + "*";
            var keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (Exception e) {
        }
    }
}
