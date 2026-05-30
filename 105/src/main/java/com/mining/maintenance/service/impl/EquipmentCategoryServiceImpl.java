package com.mining.maintenance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mining.maintenance.dto.EquipmentCategoryDTO;
import com.mining.maintenance.entity.EquipmentCategory;
import com.mining.maintenance.exception.BusinessException;
import com.mining.maintenance.mapper.EquipmentCategoryMapper;
import com.mining.maintenance.service.EquipmentCategoryService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class EquipmentCategoryServiceImpl extends ServiceImpl<EquipmentCategoryMapper, EquipmentCategory> implements EquipmentCategoryService {

    private static final String CATEGORY_TREE_KEY = "category:tree";
    private static final String CATEGORY_TREE_BY_TYPE_KEY = "category:tree:type:";
    private static final long CACHE_EXPIRE_TIME = 30;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Override
    public void addCategory(EquipmentCategoryDTO dto) {
        LambdaQueryWrapper<EquipmentCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(EquipmentCategory::getCategoryCode, dto.getCategoryCode());
        if (count(wrapper) > 0) {
            throw new BusinessException("类目编码已存在");
        }

        if (dto.getParentId() != null && dto.getParentId() > 0) {
            EquipmentCategory parent = getById(dto.getParentId());
            if (parent == null) {
                throw new BusinessException("父类目不存在");
            }
            if (parent.getStatus() == 0) {
                throw new BusinessException("父类目已下线，不允许添加子类目");
            }
        }

        EquipmentCategory category = new EquipmentCategory();
        BeanUtils.copyProperties(dto, category);
        if (dto.getParentId() == null) {
            category.setParentId(0L);
        }
        save(category);
        clearCategoryCache();
    }

    @Override
    public void updateCategory(EquipmentCategoryDTO dto) {
        EquipmentCategory exist = getById(dto.getId());
        if (exist == null) {
            throw new BusinessException("类目不存在");
        }

        LambdaQueryWrapper<EquipmentCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(EquipmentCategory::getCategoryCode, dto.getCategoryCode())
                .ne(EquipmentCategory::getId, dto.getId());
        if (count(wrapper) > 0) {
            throw new BusinessException("类目编码已存在");
        }

        EquipmentCategory category = new EquipmentCategory();
        BeanUtils.copyProperties(dto, category);
        updateById(category);
        clearCategoryCache();
    }

    @Override
    public void deleteCategory(Long id) {
        LambdaQueryWrapper<EquipmentCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(EquipmentCategory::getParentId, id);
        if (count(wrapper) > 0) {
            throw new BusinessException("存在子类目，无法删除，请先删除子类目");
        }
        removeById(id);
        clearCategoryCache();
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<EquipmentCategory> treeList() {
        Object cachedObj = redisTemplate.opsForValue().get(CATEGORY_TREE_KEY);
        if (cachedObj != null) {
            return (List<EquipmentCategory>) cachedObj;
        }

        LambdaQueryWrapper<EquipmentCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(EquipmentCategory::getSortOrder);
        List<EquipmentCategory> all = list(wrapper);
        List<EquipmentCategory> tree = buildTreeOptimized(all, 0L);

        redisTemplate.opsForValue().set(CATEGORY_TREE_KEY, tree, CACHE_EXPIRE_TIME, TimeUnit.MINUTES);
        return tree;
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<EquipmentCategory> treeListByType(String categoryType) {
        String cacheKey = CATEGORY_TREE_BY_TYPE_KEY + categoryType;
        Object cachedObj = redisTemplate.opsForValue().get(cacheKey);
        if (cachedObj != null) {
            return (List<EquipmentCategory>) cachedObj;
        }

        LambdaQueryWrapper<EquipmentCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(EquipmentCategory::getCategoryType, categoryType)
                .orderByAsc(EquipmentCategory::getSortOrder);
        List<EquipmentCategory> all = list(wrapper);
        List<EquipmentCategory> tree = buildTreeOptimized(all, 0L);

        redisTemplate.opsForValue().set(cacheKey, tree, CACHE_EXPIRE_TIME, TimeUnit.MINUTES);
        return tree;
    }

    private List<EquipmentCategory> buildTreeOptimized(List<EquipmentCategory> all, Long parentId) {
        if (CollectionUtils.isEmpty(all)) {
            return Collections.emptyList();
        }

        Map<Long, List<EquipmentCategory>> parentChildrenMap = all.stream()
                .collect(Collectors.groupingBy(EquipmentCategory::getParentId));

        return buildTreeRecursive(parentChildrenMap, parentId);
    }

    private List<EquipmentCategory> buildTreeRecursive(Map<Long, List<EquipmentCategory>> parentChildrenMap, Long parentId) {
        List<EquipmentCategory> children = parentChildrenMap.get(parentId);
        if (CollectionUtils.isEmpty(children)) {
            return Collections.emptyList();
        }

        children.forEach(child -> {
            List<EquipmentCategory> subChildren = buildTreeRecursive(parentChildrenMap, child.getId());
            if (!CollectionUtils.isEmpty(subChildren)) {
                child.setChildren(subChildren);
            }
        });

        return children;
    }

    @Override
    public void offlineCategory(Long id) {
        EquipmentCategory category = getById(id);
        if (category == null) {
            throw new BusinessException("类目不存在");
        }

        LambdaQueryWrapper<EquipmentCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(EquipmentCategory::getParentId, id)
                .eq(EquipmentCategory::getStatus, 1);
        if (count(wrapper) > 0) {
            throw new BusinessException("存在启用的子类目，请先下线子类目");
        }

        category.setStatus(0);
        updateById(category);
        clearCategoryCache();
    }

    @Override
    public void onlineCategory(Long id) {
        EquipmentCategory category = getById(id);
        if (category == null) {
            throw new BusinessException("类目不存在");
        }

        if (category.getParentId() != null && category.getParentId() > 0) {
            EquipmentCategory parent = getById(category.getParentId());
            if (parent != null && parent.getStatus() == 0) {
                throw new BusinessException("父类目已下线，请先上线父类目");
            }
        }

        category.setStatus(1);
        updateById(category);
        clearCategoryCache();
    }

    @Override
    public void updateSort(Long id, Integer sortOrder) {
        EquipmentCategory category = getById(id);
        if (category == null) {
            throw new BusinessException("类目不存在");
        }
        category.setSortOrder(sortOrder);
        updateById(category);
        clearCategoryCache();
    }

    private void clearCategoryCache() {
        redisTemplate.delete(CATEGORY_TREE_KEY);
        Set<String> keys = redisTemplate.keys(CATEGORY_TREE_BY_TYPE_KEY + "*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }
}