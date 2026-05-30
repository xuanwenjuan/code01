package com.instrument.consignment.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.instrument.consignment.dto.CategoryDTO;
import com.instrument.consignment.entity.InstrumentCategory;
import com.instrument.consignment.exception.BusinessException;
import com.instrument.consignment.mapper.InstrumentCategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InstrumentCategoryService {

    private final InstrumentCategoryMapper categoryMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String CATEGORY_TREE_CACHE_KEY = "instrument:category:tree";
    private static final String HOT_CATEGORY_CACHE_KEY = "instrument:category:hot";

    public void addCategory(CategoryDTO categoryDTO) {
        InstrumentCategory category = new InstrumentCategory();
        BeanUtils.copyProperties(categoryDTO, category);
        categoryMapper.insert(category);
        clearCategoryCache();
    }

    public void updateCategory(CategoryDTO categoryDTO) {
        InstrumentCategory category = categoryMapper.selectById(categoryDTO.getId());
        if (category == null) {
            throw new BusinessException("类目不存在");
        }
        BeanUtils.copyProperties(categoryDTO, category);
        categoryMapper.updateById(category);
        clearCategoryCache();
    }

    public void deleteCategory(Long id) {
        Long childCount = categoryMapper.selectCount(
                new LambdaQueryWrapper<InstrumentCategory>()
                        .eq(InstrumentCategory::getParentId, id)
        );
        if (childCount > 0) {
            throw new BusinessException("该类目下有子类目，无法删除");
        }
        categoryMapper.deleteById(id);
        clearCategoryCache();
    }

    public InstrumentCategory getCategoryById(Long id) {
        return categoryMapper.selectById(id);
    }

    @SuppressWarnings("unchecked")
    public List<InstrumentCategory> getCategoryTree() {
        // 先查缓存
        Object cachedTree = redisTemplate.opsForValue().get(CATEGORY_TREE_CACHE_KEY);
        if (cachedTree != null) {
            return (List<InstrumentCategory>) cachedTree;
        }

        List<InstrumentCategory> allCategories = categoryMapper.selectList(
                new LambdaQueryWrapper<InstrumentCategory>()
                        .orderByAsc(InstrumentCategory::getSortOrder)
        );

        List<InstrumentCategory> tree = buildTreeEfficient(allCategories);

        // 放入缓存，有效期1小时
        redisTemplate.opsForValue().set(CATEGORY_TREE_CACHE_KEY, tree, 1, TimeUnit.HOURS);

        return tree;
    }

    /**
     * 高效树形构建算法 - 使用Map分组，时间复杂度O(n)
     */
    private List<InstrumentCategory> buildTreeEfficient(List<InstrumentCategory> allCategories) {
        // 1. 按parentId分组
        Map<Long, List<InstrumentCategory>> parentIdMap = allCategories.stream()
                .collect(Collectors.groupingBy(InstrumentCategory::getParentId));

        // 2. 给每个节点设置子节点
        for (InstrumentCategory category : allCategories) {
            category.setChildren(parentIdMap.getOrDefault(category.getId(), new ArrayList<>()));
        }

        // 3. 返回根节点（parentId = 0）
        return parentIdMap.getOrDefault(0L, new ArrayList<>());
    }

    @SuppressWarnings("unchecked")
    public List<InstrumentCategory> getHotCategories() {
        Object cached = redisTemplate.opsForValue().get(HOT_CATEGORY_CACHE_KEY);
        if (cached != null) {
            return (List<InstrumentCategory>) cached;
        }

        List<InstrumentCategory> hotCategories = categoryMapper.selectList(
                new LambdaQueryWrapper<InstrumentCategory>()
                        .eq(InstrumentCategory::getStatus, 1)
                        .orderByAsc(InstrumentCategory::getSortOrder)
                        .last("LIMIT 10")
        );

        redisTemplate.opsForValue().set(HOT_CATEGORY_CACHE_KEY, hotCategories, 30, TimeUnit.MINUTES);
        return hotCategories;
    }

    public List<InstrumentCategory> getCategoryByType(String categoryType) {
        return categoryMapper.selectList(
                new LambdaQueryWrapper<InstrumentCategory>()
                        .eq(InstrumentCategory::getCategoryType, categoryType)
                        .orderByAsc(InstrumentCategory::getSortOrder)
        );
    }

    public void updateCategoryStatus(Long id, Integer status) {
        InstrumentCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("类目不存在");
        }
        category.setStatus(status);
        categoryMapper.updateById(category);
        clearCategoryCache();
    }

    private void clearCategoryCache() {
        redisTemplate.delete(CATEGORY_TREE_CACHE_KEY);
        redisTemplate.delete(HOT_CATEGORY_CACHE_KEY);
    }
}
