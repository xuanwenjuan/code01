package com.gear.mfg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.gear.mfg.dto.CategoryTreeVO;
import com.gear.mfg.entity.GearCategory;
import com.gear.mfg.exception.BusinessException;
import com.gear.mfg.mapper.GearCategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GearCategoryService {

    private final GearCategoryMapper gearCategoryMapper;

    @Transactional(rollbackFor = Exception.class)
    public void addCategory(GearCategory category) {
        if (category.getParentId() == null || category.getParentId() == 0) {
            category.setParentId(0L);
            category.setLevel(1);
        } else {
            GearCategory parent = gearCategoryMapper.selectById(category.getParentId());
            if (parent == null) {
                throw new BusinessException("父级分类不存在");
            }
            category.setLevel(parent.getLevel() + 1);
        }
        category.setCreateTime(LocalDateTime.now());
        category.setStatus(1);
        gearCategoryMapper.insert(category);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateCategory(GearCategory category) {
        GearCategory exist = gearCategoryMapper.selectById(category.getId());
        if (exist == null) {
            throw new BusinessException("分类不存在");
        }
        category.setUpdateTime(LocalDateTime.now());
        gearCategoryMapper.updateById(category);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteCategory(Long id) {
        Long childCount = gearCategoryMapper.selectCount(
                new LambdaQueryWrapper<GearCategory>()
                        .eq(GearCategory::getParentId, id)
        );
        if (childCount > 0) {
            throw new BusinessException("存在子分类，无法删除");
        }
        gearCategoryMapper.deleteById(id);
    }

    public List<CategoryTreeVO> getCategoryTree() {
        List<GearCategory> allCategories = gearCategoryMapper.selectList(
                new LambdaQueryWrapper<GearCategory>().orderByAsc(GearCategory::getSort)
        );
        return buildTree(allCategories, 0L);
    }

    private List<CategoryTreeVO> buildTree(List<GearCategory> categories, Long parentId) {
        List<CategoryTreeVO> result = new ArrayList<>();
        List<GearCategory> levelCategories = categories.stream()
                .filter(c -> c.getParentId().equals(parentId))
                .collect(Collectors.toList());

        for (GearCategory category : levelCategories) {
            CategoryTreeVO vo = new CategoryTreeVO();
            BeanUtils.copyProperties(category, vo);
            List<CategoryTreeVO> children = buildTree(categories, category.getId());
            if (!children.isEmpty()) {
                vo.setChildren(children);
            }
            result.add(vo);
        }
        return result;
    }

    public GearCategory getCategoryById(Long id) {
        return gearCategoryMapper.selectById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updatePriority(Long id, Integer priority) {
        GearCategory category = new GearCategory();
        category.setId(id);
        category.setPriority(priority);
        category.setUpdateTime(LocalDateTime.now());
        gearCategoryMapper.updateById(category);
    }

    @Transactional(rollbackFor = Exception.class)
    public void offlineCategory(Long id) {
        GearCategory category = new GearCategory();
        category.setId(id);
        category.setStatus(0);
        category.setUpdateTime(LocalDateTime.now());
        gearCategoryMapper.updateById(category);
    }
}