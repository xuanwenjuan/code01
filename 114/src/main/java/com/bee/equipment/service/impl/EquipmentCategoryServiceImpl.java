package com.bee.equipment.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.bee.equipment.common.Constants;
import com.bee.equipment.common.ResultCodeEnum;
import com.bee.equipment.dto.CategoryDTO;
import com.bee.equipment.entity.EquipmentCategory;
import com.bee.equipment.exception.BusinessException;
import com.bee.equipment.mapper.EquipmentCategoryMapper;
import com.bee.equipment.service.EquipmentCategoryService;
import com.bee.equipment.vo.EquipmentCategoryVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class EquipmentCategoryServiceImpl extends ServiceImpl<EquipmentCategoryMapper, EquipmentCategory> implements EquipmentCategoryService {

    private static final String CATEGORY_TREE_CACHE_KEY = Constants.REDIS_KEY_HOT_CATEGORY + "tree";

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Override
    @SuppressWarnings("unchecked")
    public List<EquipmentCategoryVO> listWithTree() {
        List<EquipmentCategoryVO> cachedList = (List<EquipmentCategoryVO>) redisTemplate.opsForValue().get(CATEGORY_TREE_CACHE_KEY);
        if (cachedList != null && !cachedList.isEmpty()) {
            return cachedList;
        }

        List<EquipmentCategory> allCategories = list(new LambdaQueryWrapper<EquipmentCategory>()
                .eq(EquipmentCategory::getStatus, Constants.CATEGORY_STATUS_ON)
                .orderByAsc(EquipmentCategory::getSortOrder));

        List<EquipmentCategoryVO> voList = allCategories.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        List<EquipmentCategoryVO> treeList = voList.stream()
                .filter(category -> category.getParentId() == 0)
                .peek(category -> category.setChildren(getChildrenRecursive(category, voList, 0)))
                .collect(Collectors.toList());

        redisTemplate.opsForValue().set(CATEGORY_TREE_CACHE_KEY, treeList, 1, TimeUnit.HOURS);
        return treeList;
    }

    private List<EquipmentCategoryVO> getChildrenRecursive(EquipmentCategoryVO parent, List<EquipmentCategoryVO> allCategories, int depth) {
        if (depth > 10) {
            return List.of();
        }

        List<EquipmentCategoryVO> children = allCategories.stream()
                .filter(category -> category.getParentId().equals(parent.getId()))
                .peek(category -> category.setChildren(getChildrenRecursive(category, allCategories, depth + 1)))
                .collect(Collectors.toList());

        return children.isEmpty() ? null : children;
    }

    private EquipmentCategoryVO convertToVO(EquipmentCategory category) {
        EquipmentCategoryVO vo = new EquipmentCategoryVO();
        BeanUtils.copyProperties(category, vo);
        vo.setStatusDesc(Constants.CATEGORY_STATUS_ON.equals(category.getStatus()) ? "启用" : "停用");
        return vo;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addCategory(CategoryDTO categoryDTO) {
        if (categoryDTO.getParentId() != null && categoryDTO.getParentId() > 0) {
            EquipmentCategory parent = getById(categoryDTO.getParentId());
            if (parent == null || !Constants.CATEGORY_STATUS_ON.equals(parent.getStatus())) {
                throw new BusinessException(ResultCodeEnum.CATEGORY_NOT_EXIST.getCode(), "父类目不存在或已下架");
            }
        }

        EquipmentCategory category = new EquipmentCategory();
        BeanUtils.copyProperties(categoryDTO, category);
        save(category);
        clearCategoryCache();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateCategory(CategoryDTO categoryDTO) {
        if (categoryDTO.getParentId() != null && categoryDTO.getParentId() > 0) {
            EquipmentCategory parent = getById(categoryDTO.getParentId());
            if (parent == null || !Constants.CATEGORY_STATUS_ON.equals(parent.getStatus())) {
                throw new BusinessException(ResultCodeEnum.CATEGORY_NOT_EXIST.getCode(), "父类目不存在或已下架");
            }
        }

        EquipmentCategory category = new EquipmentCategory();
        BeanUtils.copyProperties(categoryDTO, category);
        updateById(category);
        clearCategoryCache();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void removeCategory(Long id) {
        Long childCount = lambdaQuery()
                .eq(EquipmentCategory::getParentId, id)
                .count();
        if (childCount > 0) {
            throw new BusinessException(ResultCodeEnum.CATEGORY_HAS_CHILDREN);
        }
        removeById(id);
        clearCategoryCache();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateStatus(Long id, Integer status) {
        EquipmentCategory category = getById(id);
        if (category == null) {
            throw new BusinessException(ResultCodeEnum.CATEGORY_NOT_EXIST);
        }

        if (Constants.CATEGORY_STATUS_OFF.equals(status)) {
            Long childCount = lambdaQuery()
                    .eq(EquipmentCategory::getParentId, id)
                    .eq(EquipmentCategory::getStatus, Constants.CATEGORY_STATUS_ON)
                    .count();
            if (childCount > 0) {
                throw new BusinessException(ResultCodeEnum.CATEGORY_HAS_CHILDREN.getCode(), "该类目下存在启用的子类目，无法下架");
            }
        }

        lambdaUpdate()
                .eq(EquipmentCategory::getId, id)
                .set(EquipmentCategory::getStatus, status)
                .update();
        clearCategoryCache();
    }

    @Override
    public EquipmentCategoryVO getCategoryById(Long id) {
        EquipmentCategory category = getById(id);
        if (category == null) {
            throw new BusinessException(ResultCodeEnum.CATEGORY_NOT_EXIST);
        }
        return convertToVO(category);
    }

    @Override
    public boolean isCategoryEnabled(Long id) {
        EquipmentCategory category = getById(id);
        if (category == null) {
            return false;
        }
        return Constants.CATEGORY_STATUS_ON.equals(category.getStatus());
    }

    private void clearCategoryCache() {
        redisTemplate.delete(CATEGORY_TREE_CACHE_KEY);
    }
}
