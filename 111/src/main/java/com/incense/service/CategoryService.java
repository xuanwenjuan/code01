package com.incense.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.incense.dto.CategoryDTO;
import com.incense.entity.Category;
import com.incense.exception.BusinessException;
import com.incense.mapper.CategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService extends ServiceImpl<CategoryMapper, Category> {

    private static final String CATEGORY_TREE_KEY = "incense:category:tree";
    private static final String CATEGORY_ACTIVE_KEY = "incense:category:active";

    private final RedisTemplate<String, Object> redisTemplate;

    @SuppressWarnings("unchecked")
    public List<Category> getTree() {
        Object cachedTree = redisTemplate.opsForValue().get(CATEGORY_TREE_KEY);
        if (cachedTree != null) {
            return (List<Category>) cachedTree;
        }

        List<Category> allCategories = list(new LambdaQueryWrapper<Category>()
                .orderByAsc(Category::getSortOrder)
                .orderByDesc(Category::getCreateTime));

        List<Category> tree = buildTreeWithStream(allCategories, 0L);
        redisTemplate.opsForValue().set(CATEGORY_TREE_KEY, tree);
        return tree;
    }

    @SuppressWarnings("unchecked")
    public List<Category> getActiveTree() {
        Object cachedTree = redisTemplate.opsForValue().get(CATEGORY_ACTIVE_KEY);
        if (cachedTree != null) {
            return (List<Category>) cachedTree;
        }

        List<Category> allCategories = list(new LambdaQueryWrapper<Category>()
                .eq(Category::getStatus, 1)
                .orderByAsc(Category::getSortOrder)
                .orderByDesc(Category::getCreateTime));

        List<Category> tree = buildTreeWithStream(allCategories, 0L);
        redisTemplate.opsForValue().set(CATEGORY_ACTIVE_KEY, tree);
        return tree;
    }

    private List<Category> buildTreeWithStream(List<Category> allCategories, Long parentId) {
        Map<Long, List<Category>> parentToChildrenMap = allCategories.stream()
                .collect(Collectors.groupingBy(Category::getParentId));

        return buildTreeRecursive(parentToChildrenMap, parentId);
    }

    private List<Category> buildTreeRecursive(Map<Long, List<Category>> parentToChildrenMap, Long parentId) {
        List<Category> children = parentToChildrenMap.getOrDefault(parentId, new ArrayList<>());
        children.forEach(category -> category.setChildren(buildTreeRecursive(parentToChildrenMap, category.getId())));
        return children;
    }

    public void addCategory(CategoryDTO dto) {
        LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Category::getCategoryCode, dto.getCategoryCode());
        if (count(wrapper) > 0) {
            throw new BusinessException("分类编码已存在");
        }

        Category category = new Category();
        BeanUtils.copyProperties(dto, category);

        if (dto.getParentId() != null && dto.getParentId() > 0) {
            Category parent = getById(dto.getParentId());
            if (parent == null) {
                throw new BusinessException("父分类不存在");
            }
            category.setLevel(parent.getLevel() + 1);
        } else {
            category.setLevel(1);
        }

        save(category);
        clearCategoryCache();
    }

    public void updateCategory(CategoryDTO dto) {
        Category category = getById(dto.getId());
        if (category == null) {
            throw new BusinessException("分类不存在");
        }

        LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Category::getCategoryCode, dto.getCategoryCode())
                .ne(Category::getId, dto.getId());
        if (count(wrapper) > 0) {
            throw new BusinessException("分类编码已存在");
        }

        BeanUtils.copyProperties(dto, category);

        if (dto.getParentId() != null && dto.getParentId() > 0) {
            Category parent = getById(dto.getParentId());
            if (parent == null) {
                throw new BusinessException("父分类不存在");
            }
            category.setLevel(parent.getLevel() + 1);
        } else {
            category.setLevel(1);
        }

        updateById(category);
        clearCategoryCache();
    }

    public void deleteCategory(Long id) {
        LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Category::getParentId, id);
        if (count(wrapper) > 0) {
            throw new BusinessException("该分类下存在子分类，无法删除");
        }
        removeById(id);
        clearCategoryCache();
    }

    public List<Category> getByParentId(Long parentId) {
        LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Category::getParentId, parentId)
                .orderByAsc(Category::getSortOrder)
                .orderByDesc(Category::getCreateTime);
        return list(wrapper);
    }

    public void checkCategoryActive(Long categoryId) {
        Category category = getById(categoryId);
        if (category == null) {
            throw new BusinessException("品类不存在");
        }
        if (category.getStatus() != 1) {
            throw new BusinessException("该品类已下架，无法创建工单");
        }
    }

    private void clearCategoryCache() {
        redisTemplate.delete(CATEGORY_TREE_KEY);
        redisTemplate.delete(CATEGORY_ACTIVE_KEY);
    }
}
