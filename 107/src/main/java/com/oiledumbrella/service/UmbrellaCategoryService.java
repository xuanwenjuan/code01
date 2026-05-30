package com.oiledumbrella.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.oiledumbrella.entity.UmbrellaCategory;
import com.oiledumbrella.exception.BusinessException;
import com.oiledumbrella.mapper.UmbrellaCategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UmbrellaCategoryService {

    private final UmbrellaCategoryMapper categoryMapper;
    private final CacheService cacheService;

    public List<UmbrellaCategory> tree() {
        List<UmbrellaCategory> cached = cacheService.getHotCategoriesFromCache();
        if (cached != null) {
            return cached;
        }

        List<UmbrellaCategory> allCategories = categoryMapper.selectList(
                new LambdaQueryWrapper<UmbrellaCategory>()
                        .eq(UmbrellaCategory::getStatus, 1)
                        .orderByAsc(UmbrellaCategory::getSortOrder)
        );

        List<UmbrellaCategory> tree = buildTreeEfficient(allCategories, 0L);
        cacheService.cacheHotCategories(tree);
        return tree;
    }

    private List<UmbrellaCategory> buildTreeEfficient(List<UmbrellaCategory> allCategories, Long parentId) {
        Map<Long, List<UmbrellaCategory>> parentChildrenMap = allCategories.stream()
                .collect(Collectors.groupingBy(UmbrellaCategory::getParentId));

        return buildTreeRecursive(parentId, parentChildrenMap);
    }

    private List<UmbrellaCategory> buildTreeRecursive(Long parentId, Map<Long, List<UmbrellaCategory>> parentChildrenMap) {
        List<UmbrellaCategory> children = parentChildrenMap.getOrDefault(parentId, new ArrayList<>());
        children.forEach(child -> child.setChildren(buildTreeRecursive(child.getId(), parentChildrenMap)));
        return children.stream()
                .sorted(Comparator.comparing(UmbrellaCategory::getSortOrder))
                .collect(Collectors.toList());
    }

    @Transactional
    public void add(UmbrellaCategory category) {
        UmbrellaCategory exist = categoryMapper.selectOne(
                new LambdaQueryWrapper<UmbrellaCategory>()
                        .eq(UmbrellaCategory::getCategoryCode, category.getCategoryCode())
        );
        if (exist != null) {
            throw new BusinessException("分类编码已存在");
        }

        if (category.getParentId() == null || category.getParentId() == 0) {
            category.setParentId(0L);
            category.setLevel(1);
        } else {
            UmbrellaCategory parent = categoryMapper.selectById(category.getParentId());
            if (parent == null) {
                throw new BusinessException("父分类不存在");
            }
            category.setLevel(parent.getLevel() + 1);
        }

        categoryMapper.insert(category);
        cacheService.evictHotCategoryCache();
    }

    @Transactional
    public void update(UmbrellaCategory category) {
        UmbrellaCategory exist = categoryMapper.selectById(category.getId());
        if (exist == null) {
            throw new BusinessException("分类不存在");
        }
        categoryMapper.updateById(category);
        cacheService.evictHotCategoryCache();
    }

    @Transactional
    public void delete(Long id) {
        List<UmbrellaCategory> children = categoryMapper.selectList(
                new LambdaQueryWrapper<UmbrellaCategory>()
                        .eq(UmbrellaCategory::getParentId, id)
        );
        if (!children.isEmpty()) {
            throw new BusinessException("存在子分类，无法删除");
        }
        categoryMapper.deleteById(id);
        cacheService.evictHotCategoryCache();
    }

    @Transactional
    public void offShelve(Long id) {
        UmbrellaCategory category = new UmbrellaCategory();
        category.setId(id);
        category.setStatus(0);
        categoryMapper.updateById(category);
        cacheService.evictHotCategoryCache();
    }

    public List<UmbrellaCategory> getByLevel(Integer level) {
        return categoryMapper.selectList(
                new LambdaQueryWrapper<UmbrellaCategory>()
                        .eq(UmbrellaCategory::getLevel, level)
                        .eq(UmbrellaCategory::getStatus, 1)
                        .orderByAsc(UmbrellaCategory::getSortOrder)
        );
    }

    public UmbrellaCategory getById(Long id) {
        return categoryMapper.selectById(id);
    }
}
