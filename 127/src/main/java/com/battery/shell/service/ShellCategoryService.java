package com.battery.shell.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.battery.shell.annotation.Log;
import com.battery.shell.dto.ShellCategoryDTO;
import com.battery.shell.entity.ShellCategory;
import com.battery.shell.exception.BusinessException;
import com.battery.shell.mapper.ShellCategoryMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShellCategoryService {

    private final ShellCategoryMapper shellCategoryMapper;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String CATEGORY_TREE_KEY = "shell:category:tree";
    private static final String CATEGORY_TYPE_PREFIX = "shell:category:type:";
    private static final String CATEGORY_HOT_KEY = "shell:category:hot";
    private static final long CACHE_EXPIRE_TIME = 7200;

    @Transactional(rollbackFor = Exception.class)
    @Log(value = "新增壳体分类", module = "壳体分类")
    public void addCategory(ShellCategoryDTO dto) {
        ShellCategory exist = shellCategoryMapper.selectOne(
                new LambdaQueryWrapper<ShellCategory>()
                        .eq(ShellCategory::getCategoryCode, dto.getCategoryCode())
        );
        if (exist != null) {
            throw new BusinessException("分类编码已存在");
        }

        if (dto.getParentId() != 0) {
            ShellCategory parent = shellCategoryMapper.selectById(dto.getParentId());
            if (parent == null) {
                throw new BusinessException("父分类不存在");
            }
        }

        ShellCategory category = new ShellCategory();
        BeanUtils.copyProperties(dto, category);
        shellCategoryMapper.insert(category);

        clearCategoryCache();
    }

    @Transactional(rollbackFor = Exception.class)
    @Log(value = "更新壳体分类", module = "壳体分类")
    public void updateCategory(ShellCategoryDTO dto) {
        ShellCategory category = shellCategoryMapper.selectById(dto.getId());
        if (category == null) {
            throw new BusinessException("分类不存在");
        }

        if (!category.getCategoryCode().equals(dto.getCategoryCode())) {
            ShellCategory exist = shellCategoryMapper.selectOne(
                    new LambdaQueryWrapper<ShellCategory>()
                            .eq(ShellCategory::getCategoryCode, dto.getCategoryCode())
            );
            if (exist != null) {
                throw new BusinessException("分类编码已存在");
            }
        }

        BeanUtils.copyProperties(dto, category);
        shellCategoryMapper.updateById(category);

        clearCategoryCache();
    }

    @Transactional(rollbackFor = Exception.class)
    @Log(value = "删除壳体分类", module = "壳体分类")
    public void deleteCategory(Long id) {
        Long childCount = shellCategoryMapper.selectCount(
                new LambdaQueryWrapper<ShellCategory>()
                        .eq(ShellCategory::getParentId, id)
        );
        if (childCount > 0) {
            throw new BusinessException("存在子分类，无法删除");
        }
        shellCategoryMapper.deleteById(id);

        clearCategoryCache();
    }

    public ShellCategory getCategoryById(Long id) {
        String cacheKey = "shell:category:id:" + id;
        try {
            Object cachedData = redisTemplate.opsForValue().get(cacheKey);
            if (cachedData != null) {
                return objectMapper.convertValue(cachedData, ShellCategory.class);
            }
        } catch (Exception e) {
        }

        ShellCategory category = shellCategoryMapper.selectById(id);

        if (category != null) {
            try {
                redisTemplate.opsForValue().set(cacheKey, category, CACHE_EXPIRE_TIME, TimeUnit.SECONDS);
            } catch (Exception e) {
            }
        }

        return category;
    }

    @SuppressWarnings("unchecked")
    public List<ShellCategory> getCategoryTree() {
        try {
            Object cachedData = redisTemplate.opsForValue().get(CATEGORY_TREE_KEY);
            if (cachedData != null) {
                return objectMapper.convertValue(cachedData, new TypeReference<List<ShellCategory>>() {});
            }
        } catch (Exception e) {
        }

        List<ShellCategory> allCategories = shellCategoryMapper.selectList(
                new LambdaQueryWrapper<ShellCategory>()
                        .orderByAsc(ShellCategory::getSortOrder)
                        .orderByDesc(ShellCategory::getPriority)
        );

        List<ShellCategory> tree = buildTreeOptimal(allCategories);

        try {
            redisTemplate.opsForValue().set(CATEGORY_TREE_KEY, tree, CACHE_EXPIRE_TIME, TimeUnit.SECONDS);
        } catch (Exception e) {
        }

        return tree;
    }

    private List<ShellCategory> buildTreeOptimal(List<ShellCategory> categories) {
        Map<Long, List<ShellCategory>> parentChildrenMap = categories.stream()
                .collect(Collectors.groupingBy(ShellCategory::getParentId));

        return buildTreeRecursive(parentChildrenMap, 0L);
    }

    private List<ShellCategory> buildTreeRecursive(Map<Long, List<ShellCategory>> parentChildrenMap, Long parentId) {
        List<ShellCategory> children = parentChildrenMap.get(parentId);
        if (children == null) {
            return new ArrayList<>();
        }

        for (ShellCategory category : children) {
            category.setChildren(buildTreeRecursive(parentChildrenMap, category.getId()));
        }

        return children;
    }

    @SuppressWarnings("unchecked")
    public List<ShellCategory> getCategoriesByType(String categoryType) {
        String cacheKey = CATEGORY_TYPE_PREFIX + categoryType;

        try {
            Object cachedData = redisTemplate.opsForValue().get(cacheKey);
            if (cachedData != null) {
                return objectMapper.convertValue(cachedData, new TypeReference<List<ShellCategory>>() {});
            }
        } catch (Exception e) {
        }

        List<ShellCategory> categories = shellCategoryMapper.selectList(
                new LambdaQueryWrapper<ShellCategory>()
                        .eq(ShellCategory::getCategoryType, categoryType)
                        .eq(ShellCategory::getStatus, 1)
                        .orderByAsc(ShellCategory::getSortOrder)
                        .orderByDesc(ShellCategory::getPriority)
        );

        try {
            redisTemplate.opsForValue().set(cacheKey, categories, CACHE_EXPIRE_TIME, TimeUnit.SECONDS);
        } catch (Exception e) {
        }

        return categories;
    }

    @SuppressWarnings("unchecked")
    public List<ShellCategory> getHotCategories() {
        try {
            Object cachedData = redisTemplate.opsForValue().get(CATEGORY_HOT_KEY);
            if (cachedData != null) {
                return objectMapper.convertValue(cachedData, new TypeReference<List<ShellCategory>>() {});
            }
        } catch (Exception e) {
        }

        List<ShellCategory> categories = shellCategoryMapper.selectList(
                new LambdaQueryWrapper<ShellCategory>()
                        .eq(ShellCategory::getStatus, 1)
                        .gt(ShellCategory::getPriority, 5)
                        .orderByDesc(ShellCategory::getPriority)
                        .orderByAsc(ShellCategory::getSortOrder)
                        .last("LIMIT 10")
        );

        try {
            redisTemplate.opsForValue().set(CATEGORY_HOT_KEY, categories, CACHE_EXPIRE_TIME, TimeUnit.SECONDS);
        } catch (Exception e) {
        }

        return categories;
    }

    @Transactional(rollbackFor = Exception.class)
    @Log(value = "下线壳体分类", module = "壳体分类")
    public void offlineCategory(Long id) {
        shellCategoryMapper.update(null,
                new LambdaUpdateWrapper<ShellCategory>()
                        .eq(ShellCategory::getId, id)
                        .set(ShellCategory::getStatus, 0)
        );

        clearCategoryCache();
    }

    private void clearCategoryCache() {
        try {
            List<String> keysToDelete = new ArrayList<>();
            keysToDelete.add(CATEGORY_TREE_KEY);
            keysToDelete.add(CATEGORY_HOT_KEY);
            List<String> types = List.of("POWER", "ENERGY", "DIGITAL", "CUSTOM");
            for (String type : types) {
                keysToDelete.add(CATEGORY_TYPE_PREFIX + type);
            }
            redisTemplate.delete(keysToDelete);
        } catch (Exception e) {
        }
    }
}
