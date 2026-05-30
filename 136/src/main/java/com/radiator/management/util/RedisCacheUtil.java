package com.radiator.management.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisCacheUtil {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String CACHE_PREFIX = "radiator:";

    public void set(String key, Object value, long timeout, TimeUnit unit) {
        try {
            String jsonValue = objectMapper.writeValueAsString(value);
            redisTemplate.opsForValue().set(CACHE_PREFIX + key, jsonValue, timeout, unit);
        } catch (JsonProcessingException e) {
            log.error("Redis序列化失败", e);
        }
    }

    public void set(String key, Object value) {
        set(key, value, 30, TimeUnit.MINUTES);
    }

    public <T> T get(String key, Class<T> clazz) {
        try {
            Object value = redisTemplate.opsForValue().get(CACHE_PREFIX + key);
            if (value == null) {
                return null;
            }
            return objectMapper.readValue(value.toString(), clazz);
        } catch (Exception e) {
            log.error("Redis反序列化失败", e);
            return null;
        }
    }

    public void delete(String key) {
        redisTemplate.delete(CACHE_PREFIX + key);
    }

    public void deleteByPattern(String pattern) {
        redisTemplate.delete(redisTemplate.keys(CACHE_PREFIX + pattern));
    }

    public boolean hasKey(String key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(CACHE_PREFIX + key));
    }

    public void expire(String key, long timeout, TimeUnit unit) {
        redisTemplate.expire(CACHE_PREFIX + key, timeout, unit);
    }
}
