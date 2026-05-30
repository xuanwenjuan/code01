package com.watchrepair.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.watchrepair.admin.entity.WatchCategory;
import com.watchrepair.admin.enums.CategoryStatusEnum;
import com.watchrepair.admin.exception.BusinessException;
import com.watchrepair.admin.mapper.WatchCategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WatchCategoryService {

    private final WatchCategoryMapper categoryMapper;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String HOT_CATEGORY_KEY = "watch:category:hot";
    private static final String CATEGORY_TREE_KEY = "watch:category:tree";

    public List<WatchCategory> getCategoryTree() {
        try {
            String cache = redisTemplate.opsForValue().get(CATEGORY_TREE_KEY);
            if (cache != null) {
                return objectMapper.readValue(cache, new TypeReference<List<WatchCategory>>() {});
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        List<WatchCategory> allCategories = categoryMapper.selectList(
                new LambdaQueryWrapper<WatchCategory>()
                        .orderByAsc(WatchCategory::getSort)
        );

        List<WatchCategory> tree = buildTree(allCategories, 0L);

        try {
            redisTemplate.opsForValue().set(CATEGORY_TREE_KEY, objectMapper.writeValueAsString(tree));
        } catch (Exception e) {
            e.printStackTrace();
        }

        return tree;
    }

    public List<WatchCategory> getHotCategories() {
        try {
            String cache = redisTemplate.opsForValue().get(HOT_CATEGORY_KEY);
            if (cache != null) {
                return objectMapper.readValue(cache, new TypeReference<List<WatchCategory>>() {});
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        List<WatchCategory> allCategories = categoryMapper.selectList(
                new LambdaQueryWrapper<WatchCategory>()
                        .eq(WatchCategory::getStatus, CategoryStatusEnum.NORMAL.getCode())
                        .orderByAsc(WatchCategory::getSort)
                        .last("LIMIT 10")
        );

        try {
            redisTemplate.opsForValue().set(HOT_CATEGORY_KEY, objectMapper.writeValueAsString(allCategories));
        } catch (Exception e) {
            e.printStackTrace();
        }

        return allCategories;
    }

    private List<WatchCategory> buildTree(List<WatchCategory> allCategories, Long parentId) {
        List<WatchCategory> children = allCategories.stream()
                .filter(category -> parentId.equals(category.getParentId()))
                .collect(Collectors.toList());

        for (WatchCategory category : children) {
            category.setChildren(buildTree(allCategories, category.getId()));
        }

        return children;
    }

    public List<WatchCategory> getNormalCategories() {
        List<WatchCategory> allCategories = categoryMapper.selectList(
                new LambdaQueryWrapper<WatchCategory>()
                        .eq(WatchCategory::getStatus, CategoryStatusEnum.NORMAL.getCode())
                        .orderByAsc(WatchCategory::getSort)
        );
        return buildTree(allCategories, 0L);
    }

    public void validateCategoryStatus(Long categoryId) {
        WatchCategory category = categoryMapper.selectById(categoryId);
        if (category == null) {
            throw new BusinessException("钟表类目不存在");
        }
        if (CategoryStatusEnum.DISCONTINUED.getCode().equals(category.getStatus())) {
            throw new BusinessException("该类目已停产下架，无法录入藏品");
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void addCategory(WatchCategory category) {
        if (category.getParentId() == null) {
            category.setParentId(0L);
            category.setLevel(1);
        } else {
            WatchCategory parent = categoryMapper.selectById(category.getParentId());
            if (parent == null) {
                throw new BusinessException("父级类目不存在");
            }
            if (CategoryStatusEnum.DISCONTINUED.getCode().equals(parent.getStatus())) {
                throw new BusinessException("父级类目已停产，无法添加子类目");
            }
            category.setLevel(parent.getLevel() + 1);
        }
        category.setStatus(CategoryStatusEnum.NORMAL.getCode());
        categoryMapper.insert(category);
        clearCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateCategory(WatchCategory category) {
        WatchCategory exist = categoryMapper.selectById(category.getId());
        if (exist == null) {
            throw new BusinessException("类目不存在");
        }
        categoryMapper.updateById(category);
        clearCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void discontinueCategory(Long id) {
        WatchCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("类目不存在");
        }

        List<WatchCategory> children = getAllChildren(id);
        List<Long> ids = new ArrayList<>();
        ids.add(id);
        ids.addAll(children.stream().map(WatchCategory::getId).toList());

        for (Long categoryId : ids) {
            WatchCategory update = new WatchCategory();
            update.setId(categoryId);
            update.setStatus(CategoryStatusEnum.DISCONTINUED.getCode());
            categoryMapper.updateById(update);
        }
        clearCache();
    }

    private List<WatchCategory> getAllChildren(Long parentId) {
        List<WatchCategory> result = new ArrayList<>();
        List<WatchCategory> directChildren = categoryMapper.selectList(
                new LambdaQueryWrapper<WatchCategory>().eq(WatchCategory::getParentId, parentId)
        );
        result.addAll(directChildren);
        for (WatchCategory child : directChildren) {
            result.addAll(getAllChildren(child.getId()));
        }
        return result;
    }

    public WatchCategory getCategoryById(Long id) {
        return categoryMapper.selectById(id);
    }

    private void clearCache() {
        redisTemplate.delete(CATEGORY_TREE_KEY);
        redisTemplate.delete(HOT_CATEGORY_KEY);
    }
}