package com.fishing.distribution.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fishing.distribution.dto.FishCategoryDTO;
import com.fishing.distribution.entity.FishCategory;
import com.fishing.distribution.exception.BusinessException;
import com.fishing.distribution.mapper.FishCategoryMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FishCategoryService {

    private final FishCategoryMapper fishCategoryMapper;
    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    private static final String CATEGORY_CACHE_KEY = "fish:category:tree";
    private static final String HOT_CATEGORY_CACHE_KEY = "fish:category:hot";
    private static final long CACHE_EXPIRE_TIME = 24;

    @Transactional(rollbackFor = Exception.class)
    public void addCategory(FishCategoryDTO dto) {
        LambdaQueryWrapper<FishCategory> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(FishCategory::getCategoryCode, dto.getCategoryCode());
        if (fishCategoryMapper.selectCount(queryWrapper) > 0) {
            throw new BusinessException("类目编码已存在");
        }

        if (dto.getParentId() != null && dto.getParentId() > 0) {
            FishCategory parent = fishCategoryMapper.selectById(dto.getParentId());
            if (parent == null) {
                throw new BusinessException("父类目不存在");
            }
        }

        FishCategory category = new FishCategory();
        BeanUtils.copyProperties(dto, category);
        fishCategoryMapper.insert(category);
        clearCategoryCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateCategory(Long id, FishCategoryDTO dto) {
        FishCategory category = fishCategoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("类目不存在");
        }

        LambdaQueryWrapper<FishCategory> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(FishCategory::getCategoryCode, dto.getCategoryCode())
                .ne(FishCategory::getId, id);
        if (fishCategoryMapper.selectCount(queryWrapper) > 0) {
            throw new BusinessException("类目编码已存在");
        }

        if (dto.getParentId() != null && dto.getParentId().equals(id)) {
            throw new BusinessException("父类目不能为自身");
        }

        BeanUtils.copyProperties(dto, category);
        fishCategoryMapper.updateById(category);
        clearCategoryCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteCategory(Long id) {
        FishCategory category = fishCategoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("类目不存在");
        }

        LambdaQueryWrapper<FishCategory> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(FishCategory::getParentId, id);
        if (fishCategoryMapper.selectCount(queryWrapper) > 0) {
            throw new BusinessException("存在子类目，无法删除");
        }
        fishCategoryMapper.deleteById(id);
        clearCategoryCache();
    }

    public FishCategory getCategoryById(Long id) {
        return fishCategoryMapper.selectById(id);
    }

    public List<FishCategory> getCategoryTree(String categoryType) {
        try {
            String cacheKey = CATEGORY_CACHE_KEY;
            if (categoryType != null && !categoryType.isEmpty()) {
                cacheKey = CATEGORY_CACHE_KEY + ":" + categoryType;
            }

            String cached = stringRedisTemplate.opsForValue().get(cacheKey);
            if (cached != null && !cached.isEmpty()) {
                log.info("从Redis缓存获取类目树");
                return objectMapper.readValue(cached, new TypeReference<List<FishCategory>>() {});
            }

            List<FishCategory> tree = buildCategoryTree(categoryType);
            stringRedisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(tree), CACHE_EXPIRE_TIME, TimeUnit.HOURS);
            return tree;
        } catch (Exception e) {
            log.error("获取类目树异常，从DB读取", e);
            return buildCategoryTree(categoryType);
        }
    }

    private List<FishCategory> buildCategoryTree(String categoryType) {
        LambdaQueryWrapper<FishCategory> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.orderByDesc(FishCategory::getSortOrder);
        if (categoryType != null && !categoryType.isEmpty()) {
            queryWrapper.eq(FishCategory::getCategoryType, categoryType);
        }
        List<FishCategory> allCategories = fishCategoryMapper.selectList(queryWrapper);

        Map<Long, List<FishCategory>> parentIdMap = allCategories.stream()
                .collect(Collectors.groupingBy(FishCategory::getParentId));

        List<FishCategory> rootCategories = parentIdMap.getOrDefault(0L, new ArrayList<>());

        buildTreeRecursive(rootCategories, parentIdMap);

        return rootCategories;
    }

    private void buildTreeRecursive(List<FishCategory> parentList, Map<Long, List<FishCategory>> parentIdMap) {
        for (FishCategory parent : parentList) {
            List<FishCategory> children = parentIdMap.getOrDefault(parent.getId(), new ArrayList<>());
            if (!children.isEmpty()) {
                parent.setChildren(children);
                buildTreeRecursive(children, parentIdMap);
            }
        }
    }

    public List<FishCategory> getHotCategories() {
        try {
            String cached = stringRedisTemplate.opsForValue().get(HOT_CATEGORY_CACHE_KEY);
            if (cached != null && !cached.isEmpty()) {
                log.info("从Redis缓存获取热门类目");
                return objectMapper.readValue(cached, new TypeReference<List<FishCategory>>() {});
            }

            LambdaQueryWrapper<FishCategory> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(FishCategory::getStatus, 1)
                    .orderByDesc(FishCategory::getSortOrder)
                    .last("LIMIT 10");
            List<FishCategory> hotCategories = fishCategoryMapper.selectList(queryWrapper);

            stringRedisTemplate.opsForValue().set(HOT_CATEGORY_CACHE_KEY, objectMapper.writeValueAsString(hotCategories), CACHE_EXPIRE_TIME, TimeUnit.HOURS);
            return hotCategories;
        } catch (Exception e) {
            log.error("获取热门类目异常，从DB读取", e);
            LambdaQueryWrapper<FishCategory> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(FishCategory::getStatus, 1)
                    .orderByDesc(FishCategory::getSortOrder)
                    .last("LIMIT 10");
            return fishCategoryMapper.selectList(queryWrapper);
        }
    }

    public List<FishCategory> getCategoryList(String categoryType, Integer status) {
        LambdaQueryWrapper<FishCategory> queryWrapper = new LambdaQueryWrapper<>();
        if (categoryType != null && !categoryType.isEmpty()) {
            queryWrapper.eq(FishCategory::getCategoryType, categoryType);
        }
        if (status != null) {
            queryWrapper.eq(FishCategory::getStatus, status);
        }
        queryWrapper.orderByDesc(FishCategory::getSortOrder);
        return fishCategoryMapper.selectList(queryWrapper);
    }

    public void validateCategoryStatus(Long categoryId) {
        FishCategory category = fishCategoryMapper.selectById(categoryId);
        if (category == null) {
            throw new BusinessException("渔获类目不存在");
        }
        if (category.getStatus() == 0) {
            throw new BusinessException("类目 [" + category.getCategoryName() + "] 已停收，无法入库");
        }
    }

    private void clearCategoryCache() {
        try {
            stringRedisTemplate.delete(CATEGORY_CACHE_KEY);
            stringRedisTemplate.delete(HOT_CATEGORY_CACHE_KEY);
            log.info("类目缓存已清除");
        } catch (Exception e) {
            log.error("清除类目缓存异常", e);
        }
    }
}
