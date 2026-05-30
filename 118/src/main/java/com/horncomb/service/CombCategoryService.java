package com.horncomb.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.horncomb.annotation.OperationLog;
import com.horncomb.common.BusinessException;
import com.horncomb.common.Constants;
import com.horncomb.dto.CategoryDTO;
import com.horncomb.entity.CombCategory;
import com.horncomb.mapper.CombCategoryMapper;
import com.horncomb.vo.CombCategoryVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CombCategoryService {

    private final CombCategoryMapper combCategoryMapper;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String CATEGORY_TREE_CACHE_KEY = "category:tree";
    private static final String HOT_CATEGORY_CACHE_KEY = "category:hot";

    public List<CombCategoryVO> treeList() {
        try {
            String cacheValue = redisTemplate.opsForValue().get(CATEGORY_TREE_CACHE_KEY);
            if (cacheValue != null && !cacheValue.isEmpty()) {
                return objectMapper.readValue(cacheValue, new TypeReference<List<CombCategoryVO>>() {});
            }
        } catch (Exception e) {
        }

        List<CombCategory> allCategories = combCategoryMapper.selectList(
                new LambdaQueryWrapper<CombCategory>()
                        .orderByAsc(CombCategory::getSortOrder, CombCategory::getCreateTime)
        );

        List<CombCategoryVO> allVOList = allCategories.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        List<CombCategoryVO> treeList = buildTreeEfficient(allVOList);

        try {
            String cacheJson = objectMapper.writeValueAsString(treeList);
            redisTemplate.opsForValue().set(CATEGORY_TREE_CACHE_KEY, cacheJson, 1, TimeUnit.HOURS);
        } catch (Exception e) {
        }

        return treeList;
    }

    private List<CombCategoryVO> buildTreeEfficient(List<CombCategoryVO> allList) {
        Map<Long, List<CombCategoryVO>> parentChildrenMap = allList.stream()
                .collect(Collectors.groupingBy(vo -> vo.getParentId() != null ? vo.getParentId() : 0L));

        List<CombCategoryVO> rootNodes = parentChildrenMap.getOrDefault(0L, new ArrayList<>());

        for (CombCategoryVO vo : allList) {
            List<CombCategoryVO> children = parentChildrenMap.get(vo.getId());
            vo.setChildren(children != null ? children : new ArrayList<>());
        }

        return rootNodes;
    }

    public List<CombCategoryVO> getHotCategories() {
        try {
            String cacheValue = redisTemplate.opsForValue().get(HOT_CATEGORY_CACHE_KEY);
            if (cacheValue != null && !cacheValue.isEmpty()) {
                return objectMapper.readValue(cacheValue, new TypeReference<List<CombCategoryVO>>() {});
            }
        } catch (Exception e) {
        }

        List<CombCategory> hotCategories = combCategoryMapper.selectList(
                new LambdaQueryWrapper<CombCategory>()
                        .eq(CombCategory::getStatus, 1)
                        .eq(CombCategory::getParentId, 0L)
                        .orderByAsc(CombCategory::getSortOrder)
                        .last("LIMIT 10")
        );

        List<CombCategoryVO> result = hotCategories.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        try {
            String cacheJson = objectMapper.writeValueAsString(result);
            redisTemplate.opsForValue().set(HOT_CATEGORY_CACHE_KEY, cacheJson, 30, TimeUnit.MINUTES);
        } catch (Exception e) {
        }

        return result;
    }

    public void incrementCategoryHot(Long categoryId) {
        try {
            redisTemplate.opsForValue().increment("category:hot:count:" + categoryId);
        } catch (Exception e) {
        }
    }

    public void clearCategoryCache() {
        try {
            redisTemplate.delete(CATEGORY_TREE_CACHE_KEY);
            redisTemplate.delete(HOT_CATEGORY_CACHE_KEY);
        } catch (Exception e) {
        }
    }

    public CombCategoryVO getById(Long id) {
        CombCategory category = combCategoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("类目不存在");
        }
        return convertToVO(category);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "类目管理", type = "创建", description = "创建梳型类目")
    public void create(CategoryDTO dto) {
        if (dto.getParentId() != null && dto.getParentId() > 0) {
            CombCategory parent = combCategoryMapper.selectById(dto.getParentId());
            if (parent == null) {
                throw new BusinessException("父类目不存在");
            }
        }

        CombCategory category = new CombCategory();
        BeanUtils.copyProperties(dto, category);
        category.setId(null);
        if (category.getParentId() == null) {
            category.setParentId(0L);
        }
        if (category.getSortOrder() == null) {
            category.setSortOrder(0);
        }
        if (category.getStatus() == null) {
            category.setStatus(1);
        }
        combCategoryMapper.insert(category);
        clearCategoryCache();
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "类目管理", type = "修改", description = "修改梳型类目")
    public void update(CategoryDTO dto) {
        CombCategory category = combCategoryMapper.selectById(dto.getId());
        if (category == null) {
            throw new BusinessException("类目不存在");
        }

        if (dto.getParentId() != null && dto.getParentId() > 0) {
            CombCategory parent = combCategoryMapper.selectById(dto.getParentId());
            if (parent == null) {
                throw new BusinessException("父类目不存在");
            }
            if (dto.getId().equals(dto.getParentId())) {
                throw new BusinessException("不能将自己设为父类目");
            }
        }

        BeanUtils.copyProperties(dto, category);
        combCategoryMapper.updateById(category);
        clearCategoryCache();
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "类目管理", type = "下架", description = "下架梳型类目")
    public void offline(Long id) {
        CombCategory category = combCategoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("类目不存在");
        }

        List<Long> childIds = getAllChildIds(id);
        childIds.add(id);

        combCategoryMapper.update(
                new LambdaUpdateWrapper<CombCategory>()
                        .in(CombCategory::getId, childIds)
                        .set(CombCategory::getStatus, 0)
        );
        clearCategoryCache();
    }

    private List<Long> getAllChildIds(Long parentId) {
        List<Long> result = new ArrayList<>();
        List<CombCategory> children = combCategoryMapper.selectList(
                new LambdaQueryWrapper<CombCategory>()
                        .eq(CombCategory::getParentId, parentId)
        );
        if (!CollectionUtils.isEmpty(children)) {
            for (CombCategory child : children) {
                result.add(child.getId());
                result.addAll(getAllChildIds(child.getId()));
            }
        }
        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "类目管理", type = "删除", description = "删除梳型类目")
    public void delete(Long id) {
        List<CombCategory> children = combCategoryMapper.selectList(
                new LambdaQueryWrapper<CombCategory>()
                        .eq(CombCategory::getParentId, id)
        );
        if (!CollectionUtils.isEmpty(children)) {
            throw new BusinessException("存在子类目，无法删除");
        }
        combCategoryMapper.deleteById(id);
        clearCategoryCache();
    }

    private CombCategoryVO convertToVO(CombCategory category) {
        CombCategoryVO vo = new CombCategoryVO();
        BeanUtils.copyProperties(category, vo);
        return vo;
    }
}
