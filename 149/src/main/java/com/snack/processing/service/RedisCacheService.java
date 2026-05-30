package com.snack.processing.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisCacheService {

    private final RedisTemplate<String, Object> redisTemplate;

    public static final long DEFAULT_EXPIRE_TIME = 30;
    public static final TimeUnit DEFAULT_TIME_UNIT = TimeUnit.MINUTES;

    public static final String CATEGORY_TREE_KEY = "snack:category:tree";
    public static final String CATEGORY_LIST_KEY = "snack:category:list";
    public static final String CATEGORY_KEY_PREFIX = "snack:category:";
    public static final String MATERIAL_LIST_KEY = "snack:material:list";
    public static final String STOCK_SUMMARY_KEY = "snack:stock:summary";
    public static final String STATISTICS_DAILY_KEY_PREFIX = "snack:statistics:daily:";
    public static final String STATISTICS_MONTHLY_KEY_PREFIX = "snack:statistics:monthly:";

    public void set(String key, Object value) {
        try {
            redisTemplate.opsForValue().set(key, value, DEFAULT_EXPIRE_TIME, DEFAULT_TIME_UNIT);
        } catch (Exception e) {
            log.warn("Redis set failed: key={}", key, e);
        }
    }

    public void set(String key, Object value, long expireTime, TimeUnit timeUnit) {
        try {
            redisTemplate.opsForValue().set(key, value, expireTime, timeUnit);
        } catch (Exception e) {
            log.warn("Redis set failed: key={}", key, e);
        }
    }

    public Object get(String key) {
        try {
            return redisTemplate.opsForValue().get(key);
        } catch (Exception e) {
            log.warn("Redis get failed: key={}", key, e);
            return null;
        }
    }

    public void delete(String key) {
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.warn("Redis delete failed: key={}", key, e);
        }
    }

    public void deleteByPrefix(String prefix) {
        try {
            var keys = redisTemplate.keys(prefix + "*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (Exception e) {
            log.warn("Redis delete by prefix failed: prefix={}", prefix, e);
        }
    }

    public boolean exists(String key) {
        try {
            Boolean result = redisTemplate.hasKey(key);
            return Boolean.TRUE.equals(result);
        } catch (Exception e) {
            log.warn("Redis exists failed: key={}", key, e);
            return false;
        }
    }

    public void expire(String key, long expireTime, TimeUnit timeUnit) {
        try {
            redisTemplate.expire(key, expireTime, timeUnit);
        } catch (Exception e) {
            log.warn("Redis expire failed: key={}", key, e);
        }
    }
}
