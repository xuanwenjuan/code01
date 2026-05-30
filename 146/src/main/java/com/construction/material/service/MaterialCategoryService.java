package com.construction.material.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.construction.material.common.PageQuery;
import com.construction.material.common.PageResult;
import com.construction.material.dto.MaterialCategoryDTO;
import com.construction.material.entity.MaterialCategory;
import com.construction.material.exception.BusinessException;
import com.construction.material.mapper.MaterialCategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaterialCategoryService {

    private final MaterialCategoryMapper categoryMapper;

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "categoryCache", allEntries = true)
    public void addCategory(MaterialCategoryDTO dto) {
        LambdaQueryWrapper<MaterialCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialCategory::getCategoryCode, dto.getCategoryCode())
                .eq(MaterialCategory::getDeleted, 0);
        if (categoryMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("品类编码已存在");
        }

        MaterialCategory category = new MaterialCategory();
        category.setCategoryName(dto.getCategoryName());
        category.setCategoryCode(dto.getCategoryCode());
        category.setParentId(dto.getParentId() != null ? dto.getParentId() : 0L);
        category.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        category.setUnit(dto.getUnit());
        category.setSpecification(dto.getSpecification());
        category.setPriority(dto.getPriority() != null ? dto.getPriority() : 0);
        category.setStatus(dto.getStatus());
        category.setRemark(dto.getRemark());

        if (dto.getParentId() != null && dto.getParentId() > 0) {
            MaterialCategory parent = categoryMapper.selectById(dto.getParentId());
            if (parent == null) {
                throw new BusinessException("父级分类不存在");
            }
            category.setLevel(parent.getLevel() + 1);
            category.setAncestors(parent.getAncestors() + "," + parent.getId());
        } else {
            category.setLevel(1);
            category.setAncestors("0");
        }

        categoryMapper.insert(category);
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "categoryCache", allEntries = true)
    public void updateCategory(MaterialCategoryDTO dto) {
        MaterialCategory category = categoryMapper.selectById(dto.getId());
        if (category == null) {
            throw new BusinessException("分类不存在");
        }

        LambdaQueryWrapper<MaterialCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialCategory::getCategoryCode, dto.getCategoryCode())
                .ne(MaterialCategory::getId, dto.getId())
                .eq(MaterialCategory::getDeleted, 0);
        if (categoryMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("品类编码已存在");
        }

        category.setCategoryName(dto.getCategoryName());
        category.setCategoryCode(dto.getCategoryCode());
        category.setSortOrder(dto.getSortOrder());
        category.setUnit(dto.getUnit());
        category.setSpecification(dto.getSpecification());
        category.setPriority(dto.getPriority());
        category.setStatus(dto.getStatus());
        category.setRemark(dto.getRemark());

        categoryMapper.updateById(category);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteCategory(Long id) {
        MaterialCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }

        LambdaQueryWrapper<MaterialCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialCategory::getParentId, id)
                .eq(MaterialCategory::getDeleted, 0);
        if (categoryMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("存在子分类，无法删除");
        }

        categoryMapper.deleteById(id);
    }

    public MaterialCategory getCategory(Long id) {
        return categoryMapper.selectById(id);
    }

    public PageResult<MaterialCategory> getCategoryPage(PageQuery pageQuery) {
        LambdaQueryWrapper<MaterialCategory> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(pageQuery.getKeyword())) {
            wrapper.like(MaterialCategory::getCategoryName, pageQuery.getKeyword())
                    .or()
                    .like(MaterialCategory::getCategoryCode, pageQuery.getKeyword());
        }
        wrapper.eq(MaterialCategory::getDeleted, 0);
        wrapper.orderByAsc(MaterialCategory::getSortOrder);
        wrapper.orderByDesc(MaterialCategory::getPriority);

        Page<MaterialCategory> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());
        IPage<MaterialCategory> result = categoryMapper.selectPage(page, wrapper);

        return new PageResult<>(result.getRecords(), result.getTotal(),
                (int) result.getCurrent(), (int) result.getSize());
    }

    @Cacheable(value = "categoryCache", key = "'tree'")
    public List<MaterialCategory> getCategoryTree() {
        List<MaterialCategory> allCategories = categoryMapper.selectAllTree();
        return buildTree(allCategories, 0L);
    }

    private List<MaterialCategory> buildTree(List<MaterialCategory> categories, Long parentId) {
        List<MaterialCategory> result = new ArrayList<>();
        Map<Long, List<MaterialCategory>> childrenMap = categories.stream()
                .collect(Collectors.groupingBy(c -> c.getParentId() != null ? c.getParentId() : 0L));

        List<MaterialCategory> rootNodes = categories.stream()
                .filter(c -> (c.getParentId() == null ? 0L : c.getParentId()).equals(parentId))
                .sorted((a, b) -> {
                    int sortCompare = Integer.compare(
                            a.getSortOrder() != null ? a.getSortOrder() : 0,
                            b.getSortOrder() != null ? b.getSortOrder() : 0
                    );
                    if (sortCompare != 0) return sortCompare;
                    return Integer.compare(
                            b.getPriority() != null ? b.getPriority() : 0,
                            a.getPriority() != null ? a.getPriority() : 0
                    );
                })
                .toList();

        for (MaterialCategory node : rootNodes) {
            List<MaterialCategory> children = buildTree(categories, node.getId());
            node.setChildren(children);
            result.add(node);
        }

        return result;
    }

    public List<MaterialCategory> getChildrenByParentId(Long parentId) {
        return categoryMapper.selectByParentId(parentId);
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "categoryCache", allEntries = true)
    public void disableCategory(Long id) {
        MaterialCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }
        category.setStatus(0);
        categoryMapper.updateById(category);
    }

    @Transactional(rollbackFor = Exception.class)
    public void enableCategory(Long id) {
        MaterialCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }
        category.setStatus(1);
        categoryMapper.updateById(category);
    }
}
