package com.oiledumbrella.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.oiledumbrella.entity.UmbrellaCategory;
import com.oiledumbrella.entity.UmbrellaStyle;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class CacheService {

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    private static final String HOT_CATEGORY_KEY = "umbrella:hot:category";
    private static final String HOT_STYLE_KEY = "umbrella:hot:style";
    private static final long CACHE_EXPIRE_HOURS = 24;

    public void cacheHotCategories(List<UmbrellaCategory> categories) {
        try {
            String json = objectMapper.writeValueAsString(categories);
            redisTemplate.opsForValue().set(HOT_CATEGORY_KEY, json, CACHE_EXPIRE_HOURS, TimeUnit.HOURS);
        } catch (JsonProcessingException e) {
            log.error("缓存热门分类失败", e);
        }
    }

    public List<UmbrellaCategory> getHotCategoriesFromCache() {
        try {
            String json = redisTemplate.opsForValue().get(HOT_CATEGORY_KEY);
            if (json != null) {
                return objectMapper.readValue(json, new TypeReference<List<UmbrellaCategory>>() {});
            }
        } catch (JsonProcessingException e) {
            log.error("从缓存获取热门分类失败", e);
        }
        return null;
    }

    public void cacheHotStyles(List<UmbrellaStyle> styles) {
        try {
            String json = objectMapper.writeValueAsString(styles);
            redisTemplate.opsForValue().set(HOT_STYLE_KEY, json, CACHE_EXPIRE_HOURS, TimeUnit.HOURS);
        } catch (JsonProcessingException e) {
            log.error("缓存热门款式失败", e);
        }
    }

    public List<UmbrellaStyle> getHotStylesFromCache() {
        try {
            String json = redisTemplate.opsForValue().get(HOT_STYLE_KEY);
            if (json != null) {
                return objectMapper.readValue(json, new TypeReference<List<UmbrellaStyle>>() {});
            }
        } catch (JsonProcessingException e) {
            log.error("从缓存获取热门款式失败", e);
        }
        return null;
    }

    public void evictHotCategoryCache() {
        redisTemplate.delete(HOT_CATEGORY_KEY);
    }

    public void evictHotStyleCache() {
        redisTemplate.delete(HOT_STYLE_KEY);
    }
}
