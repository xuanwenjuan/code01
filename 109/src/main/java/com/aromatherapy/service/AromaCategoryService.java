package com.aromatherapy.service;

import com.aromatherapy.entity.AromaCategory;
import com.aromatherapy.exception.BusinessException;
import com.aromatherapy.mapper.AromaCategoryMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AromaCategoryService {

    private final AromaCategoryMapper aromaCategoryMapper;

    @Cacheable(value = "categoryTree", key = "'all'")
    public List<AromaCategory> treeList() {
        List<AromaCategory> allCategories = aromaCategoryMapper.selectList(
                new LambdaQueryWrapper<AromaCategory>()
                        .eq(AromaCategory::getStatus, 1)
                        .orderByAsc(AromaCategory::getSort)
        );
        return buildTreeEfficient(allCategories);
    }

    private List<AromaCategory> buildTreeEfficient(List<AromaCategory> allCategories) {
        Map<Long, List<AromaCategory>> parentChildrenMap = allCategories.stream()
                .collect(Collectors.groupingBy(AromaCategory::getParentId));

        for (AromaCategory category : allCategories) {
            category.setChildren(parentChildrenMap.getOrDefault(category.getId(), new ArrayList<>()));
        }

        return parentChildrenMap.getOrDefault(0L, new ArrayList<>());
    }

    public List<AromaCategory> treeListWithAllStatus() {
        List<AromaCategory> allCategories = aromaCategoryMapper.selectList(
                new LambdaQueryWrapper<AromaCategory>()
                        .orderByAsc(AromaCategory::getSort)
        );
        return buildTreeEfficient(allCategories);
    }

    public List<AromaCategory> listByParentId(Long parentId) {
        return aromaCategoryMapper.selectByParentId(parentId);
    }

    public AromaCategory getById(Long id) {
        return aromaCategoryMapper.selectById(id);
    }

    public List<AromaCategory> getSupplySortedList() {
        return aromaCategoryMapper.selectList(
                new LambdaQueryWrapper<AromaCategory>()
                        .eq(AromaCategory::getStatus, 1)
                        .orderByAsc(AromaCategory::getSupplySort)
        );
    }

    @Cacheable(value = "hotCategories", key = "'top'")
    public List<AromaCategory> getHotCategories() {
        return aromaCategoryMapper.selectList(
                new LambdaQueryWrapper<AromaCategory>()
                        .eq(AromaCategory::getStatus, 1)
                        .orderByAsc(AromaCategory::getSupplySort)
                        .last("LIMIT 10")
        );
    }

    @CacheEvict(value = {"categoryTree", "hotCategories"}, allEntries = true)
    public void clearCache() {
    }

    @CacheEvict(value = {"categoryTree", "hotCategories"}, allEntries = true)
    @Transactional(rollbackFor = Exception.class)
    public void create(AromaCategory category) {
        if (category.getParentId() == null) {
            category.setParentId(0L);
        }
        if (category.getSort() == null) {
            category.setSort(0);
        }
        if (category.getSupplySort() == null) {
            category.setSupplySort(0);
        }
        if (category.getStatus() == null) {
            category.setStatus(1);
        }

        AromaCategory parent = aromaCategoryMapper.selectById(category.getParentId());
        if (category.getParentId() > 0 && parent == null) {
            throw new BusinessException("父分类不存在");
        }
        category.setLevel(parent == null ? 1 : parent.getLevel() + 1);

        aromaCategoryMapper.insert(category);
    }

    @CacheEvict(value = {"categoryTree", "hotCategories"}, allEntries = true)
    @Transactional(rollbackFor = Exception.class)
    public void update(AromaCategory category) {
        AromaCategory existing = aromaCategoryMapper.selectById(category.getId());
        if (existing == null) {
            throw new BusinessException("分类不存在");
        }
        aromaCategoryMapper.updateById(category);
    }

    @CacheEvict(value = {"categoryTree", "hotCategories"}, allEntries = true)
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        List<AromaCategory> children = aromaCategoryMapper.selectByParentId(id);
        if (!children.isEmpty()) {
            throw new BusinessException("请先删除子分类");
        }
        aromaCategoryMapper.deleteById(id);
    }

    @CacheEvict(value = {"categoryTree", "hotCategories"}, allEntries = true)
    @Transactional(rollbackFor = Exception.class)
    public void updateStatus(Long id, Integer status) {
        aromaCategoryMapper.update(null,
                new LambdaUpdateWrapper<AromaCategory>()
                        .eq(AromaCategory::getId, id)
                        .set(AromaCategory::getStatus, status)
        );
    }

    @CacheEvict(value = {"categoryTree", "hotCategories"}, allEntries = true)
    @Transactional(rollbackFor = Exception.class)
    public void updateSupplySort(Long id, Integer supplySort) {
        aromaCategoryMapper.update(null,
                new LambdaUpdateWrapper<AromaCategory>()
                        .eq(AromaCategory::getId, id)
                        .set(AromaCategory::getSupplySort, supplySort)
        );
    }
}
