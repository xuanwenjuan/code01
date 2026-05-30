package com.logistics.bigcargo.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.logistics.bigcargo.dto.CategoryDTO;
import com.logistics.bigcargo.entity.Category;
import com.logistics.bigcargo.exception.BusinessException;
import com.logistics.bigcargo.mapper.CategoryMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String CATEGORY_TREE_CACHE_KEY = "category:tree";
    private static final String CATEGORY_ENABLED_CACHE_KEY = "category:enabled";
    private static final long CACHE_EXPIRE_HOURS = 24;

    @Transactional(rollbackFor = Exception.class)
    public void addCategory(CategoryDTO dto) {
        Long count = categoryMapper.selectCount(new LambdaQueryWrapper<Category>()
                .eq(Category::getCode, dto.getCode()));
        if (count > 0) {
            throw new BusinessException("品类编码已存在");
        }

        Category category = new Category();
        category.setName(dto.getName());
        category.setCode(dto.getCode());
        category.setParentId(dto.getParentId());
        category.setLevel(dto.getLevel());
        category.setSort(dto.getSort());
        category.setPriority(dto.getPriority());
        category.setStatus(dto.getStatus());
        category.setRemark(dto.getRemark());

        categoryMapper.insert(category);
        clearCategoryCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateCategory(CategoryDTO dto) {
        Category category = categoryMapper.selectById(dto.getId());
        if (category == null) {
            throw new BusinessException("品类不存在");
        }

        Long count = categoryMapper.selectCount(new LambdaQueryWrapper<Category>()
                .eq(Category::getCode, dto.getCode())
                .ne(Category::getId, dto.getId()));
        if (count > 0) {
            throw new BusinessException("品类编码已存在");
        }

        category.setName(dto.getName());
        category.setCode(dto.getCode());
        category.setParentId(dto.getParentId());
        category.setLevel(dto.getLevel());
        category.setSort(dto.getSort());
        category.setPriority(dto.getPriority());
        category.setStatus(dto.getStatus());
        category.setRemark(dto.getRemark());

        categoryMapper.updateById(category);
        clearCategoryCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteCategory(Long id) {
        Long childCount = categoryMapper.selectCount(new LambdaQueryWrapper<Category>()
                .eq(Category::getParentId, id));
        if (childCount > 0) {
            throw new BusinessException("存在子品类，无法删除");
        }
        categoryMapper.deleteById(id);
        clearCategoryCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void disableCategory(Long id) {
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("品类不存在");
        }
        category.setStatus(0);
        categoryMapper.updateById(category);

        disableChildren(id);
        clearCategoryCache();
    }

    private void disableChildren(Long parentId) {
        List<Category> children = categoryMapper.selectList(new LambdaQueryWrapper<Category>()
                .eq(Category::getParentId, parentId));
        for (Category child : children) {
            child.setStatus(0);
            categoryMapper.updateById(child);
            disableChildren(child.getId());
        }
    }

    public Category getCategoryById(Long id) {
        return categoryMapper.selectById(id);
    }

    public List<Category> getCategoryTree() {
        try {
            String cached = stringRedisTemplate.opsForValue().get(CATEGORY_TREE_CACHE_KEY);
            if (cached != null) {
                return objectMapper.readValue(cached, new TypeReference<List<Category>>() {});
            }
        } catch (Exception e) {
        }

        List<Category> allCategories = categoryMapper.selectList(new LambdaQueryWrapper<Category>()
                .orderByAsc(Category::getSort)
                .orderByDesc(Category::getPriority));

        Map<Long, List<Category>> parentMap = allCategories.stream()
                .collect(Collectors.groupingBy(Category::getParentId));

        List<Category> rootCategories = parentMap.getOrDefault(0L, new ArrayList<>());

        buildTree(rootCategories, parentMap);

        try {
            stringRedisTemplate.opsForValue().set(CATEGORY_TREE_CACHE_KEY,
                    objectMapper.writeValueAsString(rootCategories), CACHE_EXPIRE_HOURS, TimeUnit.HOURS);
        } catch (Exception e) {
        }

        return rootCategories;
    }

    private void buildTree(List<Category> categories, Map<Long, List<Category>> parentMap) {
        for (Category category : categories) {
            List<Category> children = parentMap.getOrDefault(category.getId(), new ArrayList<>());
            category.setChildren(children);
            if (!children.isEmpty()) {
                buildTree(children, parentMap);
            }
        }
    }

    public List<Category> getCategoriesByParentId(Long parentId) {
        return categoryMapper.selectList(new LambdaQueryWrapper<Category>()
                .eq(Category::getParentId, parentId)
                .orderByAsc(Category::getSort)
                .orderByDesc(Category::getPriority));
    }

    public List<Category> getEnabledCategories() {
        try {
            String cached = stringRedisTemplate.opsForValue().get(CATEGORY_ENABLED_CACHE_KEY);
            if (cached != null) {
                return objectMapper.readValue(cached, new TypeReference<List<Category>>() {});
            }
        } catch (Exception e) {
        }

        List<Category> categories = categoryMapper.selectList(new LambdaQueryWrapper<Category>()
                .eq(Category::getStatus, 1)
                .orderByAsc(Category::getSort)
                .orderByDesc(Category::getPriority));

        try {
            stringRedisTemplate.opsForValue().set(CATEGORY_ENABLED_CACHE_KEY,
                    objectMapper.writeValueAsString(categories), CACHE_EXPIRE_HOURS, TimeUnit.HOURS);
        } catch (Exception e) {
        }

        return categories;
    }

    private void clearCategoryCache() {
        stringRedisTemplate.delete(CATEGORY_TREE_CACHE_KEY);
        stringRedisTemplate.delete(CATEGORY_ENABLED_CACHE_KEY);
    }
}
