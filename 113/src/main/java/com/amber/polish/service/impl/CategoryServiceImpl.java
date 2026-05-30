package com.amber.polish.service.impl;

import com.amber.polish.common.ResultCode;
import com.amber.polish.entity.Category;
import com.amber.polish.exception.BusinessException;
import com.amber.polish.mapper.CategoryMapper;
import com.amber.polish.service.CategoryService;
import com.amber.polish.vo.CategoryTreeVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category> implements CategoryService {

    private static final String CATEGORY_TREE_CACHE_KEY = "category:tree";
    private static final String HOT_CATEGORY_CACHE_KEY = "category:hot";

    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public List<CategoryTreeVO> getCategoryTree() {
        try {
            String cacheValue = stringRedisTemplate.opsForValue().get(CATEGORY_TREE_CACHE_KEY);
            if (cacheValue != null && !cacheValue.isEmpty()) {
                return objectMapper.readValue(cacheValue, new TypeReference<List<CategoryTreeVO>>() {});
            }
        } catch (Exception e) {
            log.error("读取类目树缓存失败", e);
        }

        List<Category> categoryList = this.list(new LambdaQueryWrapper<Category>()
                .eq(Category::getStatus, 1)
                .orderByAsc(Category::getSortOrder));
        
        List<CategoryTreeVO> tree = buildTreeEfficient(categoryList);

        try {
            String json = objectMapper.writeValueAsString(tree);
            stringRedisTemplate.opsForValue().set(CATEGORY_TREE_CACHE_KEY, json, 1, TimeUnit.HOURS);
        } catch (Exception e) {
            log.error("写入类目树缓存失败", e);
        }

        return tree;
    }

    private List<CategoryTreeVO> buildTreeEfficient(List<Category> categoryList) {
        Map<Long, List<CategoryTreeVO>> parentChildrenMap = categoryList.stream()
                .map(category -> {
                    CategoryTreeVO vo = new CategoryTreeVO();
                    BeanUtils.copyProperties(category, vo);
                    vo.setChildren(new ArrayList<>());
                    return vo;
                })
                .collect(Collectors.groupingBy(CategoryTreeVO::getParentId));

        List<CategoryTreeVO> rootNodes = parentChildrenMap.getOrDefault(0L, new ArrayList<>());
        
        for (CategoryTreeVO node : rootNodes) {
            buildChildrenRecursive(node, parentChildrenMap);
        }

        return rootNodes;
    }

    private void buildChildrenRecursive(CategoryTreeVO parent, Map<Long, List<CategoryTreeVO>> parentChildrenMap) {
        List<CategoryTreeVO> children = parentChildrenMap.getOrDefault(parent.getId(), new ArrayList<>());
        parent.setChildren(children);
        for (CategoryTreeVO child : children) {
            buildChildrenRecursive(child, parentChildrenMap);
        }
    }

    @Override
    public boolean addCategory(Category category) {
        if (category.getParentId() == null) {
            category.setParentId(0L);
        }
        if (category.getSortOrder() == null) {
            category.setSortOrder(0);
        }
        if (category.getStatus() == null) {
            category.setStatus(1);
        }
        boolean result = this.save(category);
        clearCategoryCache();
        return result;
    }

    @Override
    public boolean updateCategory(Category category) {
        boolean result = this.updateById(category);
        clearCategoryCache();
        return result;
    }

    @Override
    public boolean deleteCategory(Long id) {
        long count = this.count(new LambdaQueryWrapper<Category>().eq(Category::getParentId, id));
        if (count > 0) {
            throw new BusinessException(ResultCode.CATEGORY_HAS_CHILDREN);
        }
        boolean result = this.removeById(id);
        clearCategoryCache();
        return result;
    }

    @Override
    public List<CategoryTreeVO> getHotCategoryTree() {
        try {
            String cacheValue = stringRedisTemplate.opsForValue().get(HOT_CATEGORY_CACHE_KEY);
            if (cacheValue != null && !cacheValue.isEmpty()) {
                return objectMapper.readValue(cacheValue, new TypeReference<List<CategoryTreeVO>>() {});
            }
        } catch (Exception e) {
            log.error("读取热门类目缓存失败", e);
        }

        List<Category> categoryList = this.list(new LambdaQueryWrapper<Category>()
                .eq(Category::getStatus, 1)
                .le(Category::getSortOrder, 10)
                .orderByAsc(Category::getSortOrder)
                .last("LIMIT 20"));
        
        List<CategoryTreeVO> tree = buildTreeEfficient(categoryList);

        try {
            String json = objectMapper.writeValueAsString(tree);
            stringRedisTemplate.opsForValue().set(HOT_CATEGORY_CACHE_KEY, json, 30, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.error("写入热门类目缓存失败", e);
        }

        return tree;
    }

    private void clearCategoryCache() {
        try {
            stringRedisTemplate.delete(CATEGORY_TREE_CACHE_KEY);
            stringRedisTemplate.delete(HOT_CATEGORY_CACHE_KEY);
        } catch (Exception e) {
            log.error("清除类目缓存失败", e);
        }
    }
}
