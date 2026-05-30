package com.spindle.manage.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.spindle.manage.entity.SpindleCategory;
import com.spindle.manage.mapper.SpindleCategoryMapper;
import com.spindle.manage.service.SpindleCategoryService;
import com.spindle.manage.vo.CategoryTreeVO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SpindleCategoryServiceImpl extends ServiceImpl<SpindleCategoryMapper, SpindleCategory> implements SpindleCategoryService {

    @Override
    public List<CategoryTreeVO> getCategoryTree() {
        LambdaQueryWrapper<SpindleCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(SpindleCategory::getSort);
        List<SpindleCategory> allCategories = this.list(wrapper);

        List<SpindleCategory> rootCategories = allCategories.stream()
                .filter(c -> c.getParentId() == null || c.getParentId() == 0)
                .collect(Collectors.toList());

        return buildTree(rootCategories, allCategories);
    }

    private List<CategoryTreeVO> buildTree(List<SpindleCategory> parentCategories, List<SpindleCategory> allCategories) {
        List<CategoryTreeVO> tree = new ArrayList<>();
        for (SpindleCategory parent : parentCategories) {
            CategoryTreeVO vo = new CategoryTreeVO();
            BeanUtils.copyProperties(parent, vo);

            List<SpindleCategory> children = allCategories.stream()
                    .filter(c -> c.getParentId() != null && c.getParentId().equals(parent.getId()))
                    .collect(Collectors.toList());

            if (!children.isEmpty()) {
                vo.setChildren(buildTree(children, allCategories));
            }
            tree.add(vo);
        }
        return tree;
    }

    @Override
    public boolean addCategory(SpindleCategory category) {
        if (category.getParentId() == null || category.getParentId() == 0) {
            category.setParentId(0L);
            category.setLevel(1);
        } else {
            SpindleCategory parent = this.getById(category.getParentId());
            if (parent != null) {
                category.setLevel(parent.getLevel() + 1);
            } else {
                category.setLevel(1);
            }
        }
        return this.save(category);
    }

    @Override
    public boolean updateCategory(SpindleCategory category) {
        return this.updateById(category);
    }

    @Override
    public boolean offlineCategory(Long id) {
        SpindleCategory category = new SpindleCategory();
        category.setId(id);
        category.setStatus(0);
        return this.updateById(category);
    }

    @Override
    public boolean updatePriority(Long id, Integer sort) {
        SpindleCategory category = new SpindleCategory();
        category.setId(id);
        category.setSort(sort);
        return this.updateById(category);
    }

}
