package com.motor.core.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.motor.core.entity.po.CoreCategoryPO;
import com.motor.core.mapper.CoreCategoryMapper;
import com.motor.core.vo.CoreCategoryVO;
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
public class CoreCategoryService extends ServiceImpl<CoreCategoryMapper, CoreCategoryPO> {
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String CATEGORY_CACHE_KEY = "motor:core:category:tree";
    private static final String CATEGORY_LIST_CACHE_KEY = "motor:core:category:list";
    private static final long CACHE_EXPIRE = 3600;

    public List<CoreCategoryVO> getCategoryTree() {
        List<CoreCategoryVO> cachedTree = (List<CoreCategoryVO>) redisTemplate.opsForValue().get(CATEGORY_CACHE_KEY);
        if (cachedTree != null && !cachedTree.isEmpty()) {
            return cachedTree;
        }

        List<CoreCategoryPO> allCategories = list(
            new LambdaQueryWrapper<CoreCategoryPO>()
                .eq(CoreCategoryPO::getStatus, 1)
                .orderByAsc(CoreCategoryPO::getSortOrder)
        );

        Map<Long, List<CoreCategoryPO>> parentIdToChildrenMap = allCategories.stream()
            .collect(Collectors.groupingBy(CoreCategoryPO::getParentId));

        List<CoreCategoryVO> tree = buildTree(parentIdToChildrenMap, 0L);

        redisTemplate.opsForValue().set(CATEGORY_CACHE_KEY, tree, CACHE_EXPIRE, java.util.concurrent.TimeUnit.SECONDS);
        return tree;
    }

    private List<CoreCategoryVO> buildTree(Map<Long, List<CoreCategoryPO>> parentIdToChildrenMap, Long parentId) {
        List<CoreCategoryPO> children = parentIdToChildrenMap.getOrDefault(parentId, new ArrayList<>());
        List<CoreCategoryVO> result = new ArrayList<>();
        for (CoreCategoryPO po : children) {
            CoreCategoryVO vo = convertToVO(po);
            vo.setChildren(buildTree(parentIdToChildrenMap, po.getId()));
            result.add(vo);
        }
        return result;
    }

    public List<CoreCategoryVO> getCategoryList() {
        List<CoreCategoryVO> cachedList = (List<CoreCategoryVO>) redisTemplate.opsForValue().get(CATEGORY_LIST_CACHE_KEY);
        if (cachedList != null && !cachedList.isEmpty()) {
            return cachedList;
        }

        List<CoreCategoryPO> list = list(
            new LambdaQueryWrapper<CoreCategoryPO>()
                .eq(CoreCategoryPO::getStatus, 1)
                .orderByAsc(CoreCategoryPO::getSortOrder)
        );

        List<CoreCategoryVO> voList = list.stream().map(this::convertToVO).collect(Collectors.toList());
        redisTemplate.opsForValue().set(CATEGORY_LIST_CACHE_KEY, voList, CACHE_EXPIRE, java.util.concurrent.TimeUnit.SECONDS);
        return voList;
    }

    public CoreCategoryVO getCategoryById(Long id) {
        CoreCategoryPO po = getById(id);
        return po != null ? convertToVO(po) : null;
    }

    public boolean createCategory(CoreCategoryPO category) {
        category.setStatus(1);
        boolean success = save(category);
        if (success) {
            clearCache();
        }
        return success;
    }

    public boolean updateCategory(CoreCategoryPO category) {
        boolean success = updateById(category);
        if (success) {
            clearCache();
        }
        return success;
    }

    public boolean deleteCategory(Long id) {
        boolean success = removeById(id);
        if (success) {
            clearCache();
        }
        return success;
    }

    public boolean updateStatus(Long id, Integer status) {
        CoreCategoryPO category = new CoreCategoryPO();
        category.setId(id);
        category.setStatus(status);
        boolean success = updateById(category);
        if (success) {
            clearCache();
        }
        return success;
    }

    private void clearCache() {
        redisTemplate.delete(CATEGORY_CACHE_KEY);
        redisTemplate.delete(CATEGORY_LIST_CACHE_KEY);
    }

    private CoreCategoryVO convertToVO(CoreCategoryPO po) {
        CoreCategoryVO vo = new CoreCategoryVO();
        BeanUtils.copyProperties(po, vo);
        return vo;
    }
}
