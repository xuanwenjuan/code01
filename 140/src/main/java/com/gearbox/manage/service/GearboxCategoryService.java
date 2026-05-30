package com.gearbox.manage.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gearbox.manage.entity.GearboxCategory;
import com.gearbox.manage.exception.BusinessException;
import com.gearbox.manage.mapper.GearboxCategoryMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GearboxCategoryService extends ServiceImpl<GearboxCategoryMapper, GearboxCategory> {

    public List<GearboxCategory> tree() {
        List<GearboxCategory> allList = list();
        return buildTree(allList, 0L);
    }

    private List<GearboxCategory> buildTree(List<GearboxCategory> allList, Long parentId) {
        List<GearboxCategory> tree = new ArrayList<>();
        for (GearboxCategory category : allList) {
            if (category.getParentId().equals(parentId)) {
                category.setChildren(buildTree(allList, category.getId()));
                tree.add(category);
            }
        }
        return tree;
    }

    public List<GearboxCategory> listByType(String categoryType) {
        return lambdaQuery()
                .eq(GearboxCategory::getCategoryType, categoryType)
                .list();
    }

    public boolean add(GearboxCategory category) {
        if (category.getParentId() == null) {
            category.setParentId(0L);
        }
        if (category.getPriority() == null) {
            category.setPriority(0);
        }
        if (category.getStatus() == null) {
            category.setStatus(1);
        }
        return save(category);
    }

    public boolean update(GearboxCategory category) {
        return updateById(category);
    }

    public boolean offline(Long id) {
        GearboxCategory category = getById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }
        category.setStatus(0);
        return updateById(category);
    }

    public boolean updatePriority(Long id, Integer priority) {
        GearboxCategory category = getById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }
        category.setPriority(priority);
        return updateById(category);
    }
}
