package com.flange.util;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class CacheUtil {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String CACHE_PREFIX = "flange:";

    public void set(String key, Object value) {
        redisTemplate.opsForValue().set(CACHE_PREFIX + key, value);
    }

    public void set(String key, Object value, long timeout, TimeUnit unit) {
        redisTemplate.opsForValue().set(CACHE_PREFIX + key, value, timeout, unit);
    }

    public Object get(String key) {
        return redisTemplate.opsForValue().get(CACHE_PREFIX + key);
    }

    public Boolean delete(String key) {
        return redisTemplate.delete(CACHE_PREFIX + key);
    }

    public Long delete(Collection<String> keys) {
        return redisTemplate.delete(keys.stream().map(k -> CACHE_PREFIX + k).toList());
    }

    public Boolean hasKey(String key) {
        return redisTemplate.hasKey(CACHE_PREFIX + key);
    }

    public void expire(String key, long timeout, TimeUnit unit) {
        redisTemplate.expire(CACHE_PREFIX + key, timeout, unit);
    }

    public void hSet(String key, String hashKey, Object value) {
        redisTemplate.opsForHash().put(CACHE_PREFIX + key, hashKey, value);
    }

    public Object hGet(String key, String hashKey) {
        return redisTemplate.opsForHash().get(CACHE_PREFIX + key, hashKey);
    }

    public Map<Object, Object> hGetAll(String key) {
        return redisTemplate.opsForHash().entries(CACHE_PREFIX + key);
    }

    public void lSet(String key, List<Object> values) {
        redisTemplate.opsForList().rightPushAll(CACHE_PREFIX + key, values);
    }

    public List<Object> lGet(String key, long start, long end) {
        return redisTemplate.opsForList().range(CACHE_PREFIX + key, start, end);
    }

    public Set<String> keys(String pattern) {
        return redisTemplate.keys(CACHE_PREFIX + pattern);
    }

    public void deleteByPattern(String pattern) {
        Set<String> keys = redisTemplate.keys(CACHE_PREFIX + pattern);
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }
}
