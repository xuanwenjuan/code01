package com.mushroom.traceability.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mushroom.traceability.common.Constants;
import com.mushroom.traceability.entity.MushroomCategory;
import com.mushroom.traceability.exception.BusinessException;
import com.mushroom.traceability.mapper.MushroomCategoryMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MushroomCategoryService extends ServiceImpl<MushroomCategoryMapper, MushroomCategory> {

    private static final String CATEGORY_TREE_KEY = "category:tree:";
    private static final long CACHE_EXPIRE_HOURS = 2;

    private final OperationLogService operationLogService;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public List<MushroomCategory> treeList() {
        String cacheKey = CATEGORY_TREE_KEY + "all";
        try {
            String cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                return objectMapper.readValue(cached, new TypeReference<List<MushroomCategory>>() {});
            }
        } catch (Exception e) {
            log.warn("读取类目缓存失败", e);
        }

        LambdaQueryWrapper<MushroomCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(MushroomCategory::getSortOrder);
        List<MushroomCategory> allList = list(wrapper);
        List<MushroomCategory> tree = buildTreeEfficient(allList);

        try {
            redisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(tree),
                    CACHE_EXPIRE_HOURS, TimeUnit.HOURS);
        } catch (Exception e) {
            log.warn("写入类目缓存失败", e);
        }
        return tree;
    }

    public List<MushroomCategory> treeListByType(String categoryType) {
        String cacheKey = CATEGORY_TREE_KEY + categoryType;
        try {
            String cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                return objectMapper.readValue(cached, new TypeReference<List<MushroomCategory>>() {});
            }
        } catch (Exception e) {
            log.warn("读取类目缓存失败", e);
        }

        LambdaQueryWrapper<MushroomCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MushroomCategory::getCategoryType, categoryType);
        wrapper.orderByAsc(MushroomCategory::getSortOrder);
        List<MushroomCategory> allList = list(wrapper);
        List<MushroomCategory> tree = buildTreeEfficient(allList);

        try {
            redisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(tree),
                    CACHE_EXPIRE_HOURS, TimeUnit.HOURS);
        } catch (Exception e) {
            log.warn("写入类目缓存失败", e);
        }
        return tree;
    }

    private List<MushroomCategory> buildTreeEfficient(List<MushroomCategory> allList) {
        if (allList == null || allList.isEmpty()) {
            return new ArrayList<>();
        }

        Map<Long, List<MushroomCategory>> childrenMap = allList.stream()
                .collect(Collectors.groupingBy(MushroomCategory::getParentId));

        List<MushroomCategory> roots = childrenMap.getOrDefault(0L, new ArrayList<>());
        for (MushroomCategory root : roots) {
            buildChildrenRecursive(root, childrenMap);
        }
        return roots;
    }

    private void buildChildrenRecursive(MushroomCategory parent, Map<Long, List<MushroomCategory>> childrenMap) {
        List<MushroomCategory> children = childrenMap.getOrDefault(parent.getId(), new ArrayList<>());
        parent.setChildren(children);
        for (MushroomCategory child : children) {
            buildChildrenRecursive(child, childrenMap);
        }
    }

    private void clearCategoryCache() {
        try {
            Set<String> keys = redisTemplate.keys(CATEGORY_TREE_KEY + "*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (Exception e) {
            log.warn("清除类目缓存失败", e);
        }
    }

    @Override
    public boolean save(MushroomCategory entity) {
        if (entity.getParentId() == null) {
            entity.setParentId(0L);
        }
        if (entity.getSortOrder() == null) {
            entity.setSortOrder(0);
        }
        if (entity.getStatus() == null) {
            entity.setStatus(1);
        }
        if (entity.getIsWild() == null) {
            entity.setIsWild(0);
        }
        if (entity.getIsForbidden() == null) {
            entity.setIsForbidden(0);
        }
        boolean result = super.save(entity);
        if (result) {
            clearCategoryCache();
            operationLogService.saveLog(Constants.BIZ_TYPE_CATEGORY, entity.getId(),
                    Constants.OP_TYPE_CREATE, "新增菌菇品类: " + entity.getCategoryName());
        }
        return result;
    }

    @Override
    public boolean updateById(MushroomCategory entity) {
        boolean result = super.updateById(entity);
        if (result) {
            clearCategoryCache();
            operationLogService.saveLog(Constants.BIZ_TYPE_CATEGORY, entity.getId(),
                    Constants.OP_TYPE_UPDATE, "更新菌菇品类: " + entity.getCategoryName());
        }
        return result;
    }

    public boolean toggleForbidden(Long id) {
        MushroomCategory category = getById(id);
        if (category == null) {
            throw new BusinessException("品类不存在");
        }
        category.setIsForbidden(category.getIsForbidden() == 1 ? 0 : 1);
        boolean result = updateById(category);
        if (result) {
            clearCategoryCache();
            String status = category.getIsForbidden() == 1 ? "禁采" : "取消禁采";
            operationLogService.saveLog(Constants.BIZ_TYPE_CATEGORY, id,
                    Constants.OP_TYPE_STATUS_CHANGE, status + "菌菇品类: " + category.getCategoryName());
        }
        return result;
    }

    public boolean toggleStatus(Long id) {
        MushroomCategory category = getById(id);
        if (category == null) {
            throw new BusinessException("品类不存在");
        }
        category.setStatus(category.getStatus() == 1 ? 0 : 1);
        boolean result = updateById(category);
        if (result) {
            clearCategoryCache();
            String status = category.getStatus() == 1 ? "上架" : "下架";
            operationLogService.saveLog(Constants.BIZ_TYPE_CATEGORY, id,
                    Constants.OP_TYPE_STATUS_CHANGE, status + "菌菇品类: " + category.getCategoryName());
        }
        return result;
    }

    @Override
    public boolean removeById(Long id) {
        boolean result = super.removeById(id);
        if (result) {
            clearCategoryCache();
            operationLogService.saveLog(Constants.BIZ_TYPE_CATEGORY, id,
                    Constants.OP_TYPE_DELETE, "删除菌菇品类");
        }
        return result;
    }
}