package com.tarp.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tarp.entity.TarpCategory;
import com.tarp.exception.BusinessException;
import com.tarp.mapper.TarpCategoryMapper;
import com.tarp.util.RedisUtil;
import com.tarp.util.StatusUtil;
import com.tarp.vo.TarpCategoryVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TarpCategoryService {

    private static final String CATEGORY_TREE_KEY = "tarp:category:tree";
    private static final String CATEGORY_ENABLED_KEY = "tarp:category:enabled";
    private static final String CATEGORY_HOT_KEY = "tarp:category:hot";
    private static final long CACHE_EXPIRE_TIME = 1;

    private final TarpCategoryMapper categoryMapper;
    private final RedisUtil redisUtil;
    private final ObjectMapper objectMapper;

    public List<TarpCategoryVO> treeList() {
        String cacheValue = redisUtil.get(CATEGORY_TREE_KEY);
        if (cacheValue != null) {
            try {
                return objectMapper.readValue(cacheValue,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, TarpCategoryVO.class));
            } catch (Exception e) {
            }
        }

        List<TarpCategory> allCategories = categoryMapper.selectList(
                new LambdaQueryWrapper<TarpCategory>().orderByAsc(TarpCategory::getSortOrder)
        );
        List<TarpCategoryVO> result = buildTreeOptimized(allCategories);

        try {
            redisUtil.set(CATEGORY_TREE_KEY, objectMapper.writeValueAsString(result),
                    CACHE_EXPIRE_TIME, TimeUnit.HOURS);
        } catch (Exception e) {
        }

        return result;
    }

    public List<TarpCategoryVO> getEnabledCategories() {
        String cacheValue = redisUtil.get(CATEGORY_ENABLED_KEY);
        if (cacheValue != null) {
            try {
                return objectMapper.readValue(cacheValue,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, TarpCategoryVO.class));
            } catch (Exception e) {
            }
        }

        List<TarpCategory> allCategories = categoryMapper.selectList(
                new LambdaQueryWrapper<TarpCategory>()
                        .eq(TarpCategory::getStatus, 1)
                        .orderByAsc(TarpCategory::getSortOrder)
        );
        List<TarpCategoryVO> result = buildTreeOptimized(allCategories);

        try {
            redisUtil.set(CATEGORY_ENABLED_KEY, objectMapper.writeValueAsString(result),
                    CACHE_EXPIRE_TIME, TimeUnit.HOURS);
        } catch (Exception e) {
        }

        return result;
    }

    public List<TarpCategoryVO> getHotCategories() {
        String cacheValue = redisUtil.get(CATEGORY_HOT_KEY);
        if (cacheValue != null) {
            try {
                return objectMapper.readValue(cacheValue,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, TarpCategoryVO.class));
            } catch (Exception e) {
            }
        }

        List<TarpCategory> hotCategories = categoryMapper.selectList(
                new LambdaQueryWrapper<TarpCategory>()
                        .eq(TarpCategory::getStatus, 1)
                        .eq(TarpCategory::getParentId, 0)
                        .orderByAsc(TarpCategory::getSortOrder)
                        .last("LIMIT 10")
        );
        List<TarpCategoryVO> result = hotCategories.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        try {
            redisUtil.set(CATEGORY_HOT_KEY, objectMapper.writeValueAsString(result),
                    CACHE_EXPIRE_TIME, TimeUnit.HOURS);
        } catch (Exception e) {
        }

        return result;
    }

    public void addCategory(TarpCategory category) {
        categoryMapper.insert(category);
        evictCategoryCache();
    }

    public void updateCategory(TarpCategory category) {
        categoryMapper.updateById(category);
        evictCategoryCache();
    }

    public void deleteCategory(Long id) {
        Long count = categoryMapper.selectCount(
                new LambdaQueryWrapper<TarpCategory>().eq(TarpCategory::getParentId, id)
        );
        if (count > 0) {
            throw new BusinessException("该分类下有子分类，无法删除");
        }
        categoryMapper.deleteById(id);
        evictCategoryCache();
    }

    public void batchUpdateSort(List<TarpCategory> categories) {
        for (TarpCategory category : categories) {
            categoryMapper.updateById(category);
        }
        evictCategoryCache();
    }

    private void evictCategoryCache() {
        redisUtil.delete(CATEGORY_TREE_KEY);
        redisUtil.delete(CATEGORY_ENABLED_KEY);
        redisUtil.delete(CATEGORY_HOT_KEY);
    }

    private List<TarpCategoryVO> buildTreeOptimized(List<TarpCategory> allCategories) {
        Map<Long, TarpCategoryVO> voMap = new HashMap<>();
        for (TarpCategory category : allCategories) {
            voMap.put(category.getId(), convertToVO(category));
        }

        Map<Long, List<TarpCategoryVO>> parentChildrenMap = new HashMap<>();
        for (TarpCategory category : allCategories) {
            parentChildrenMap.computeIfAbsent(category.getParentId(), k -> new ArrayList<>())
                    .add(voMap.get(category.getId()));
        }

        return buildChildren(parentChildrenMap, 0L);
    }

    private List<TarpCategoryVO> buildChildren(Map<Long, List<TarpCategoryVO>> parentChildrenMap, Long parentId) {
        List<TarpCategoryVO> children = parentChildrenMap.get(parentId);
        if (children == null) {
            return new ArrayList<>();
        }
        for (TarpCategoryVO child : children) {
            child.setChildren(buildChildren(parentChildrenMap, child.getId()));
        }
        return children;
    }

    private TarpCategoryVO convertToVO(TarpCategory category) {
        TarpCategoryVO vo = new TarpCategoryVO();
        BeanUtils.copyProperties(category, vo);
        vo.setStatusName(StatusUtil.getCategoryStatusName(category.getStatus()));
        return vo;
    }
}
