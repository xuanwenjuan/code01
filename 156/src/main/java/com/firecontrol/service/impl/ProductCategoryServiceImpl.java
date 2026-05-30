package com.firecontrol.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.firecontrol.common.ResultCode;
import com.firecontrol.dto.ProductCategoryDTO;
import com.firecontrol.entity.ProductCategory;
import com.firecontrol.exception.BusinessException;
import com.firecontrol.mapper.ProductCategoryMapper;
import com.firecontrol.service.ProductCategoryService;
import jakarta.annotation.Resource;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProductCategoryServiceImpl implements ProductCategoryService {

    @Resource
    private ProductCategoryMapper productCategoryMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addCategory(ProductCategoryDTO dto) {
        ProductCategory existing = productCategoryMapper.selectOne(
                new LambdaQueryWrapper<ProductCategory>()
                        .eq(ProductCategory::getCategoryCode, dto.getCategoryCode())
        );
        if (existing != null) {
            throw new BusinessException(ResultCode.DATA_ALREADY_EXIST.getCode(), "分类编码已存在");
        }

        ProductCategory category = new ProductCategory();
        BeanUtils.copyProperties(dto, category);

        if (dto.getParentId() != null && dto.getParentId() > 0) {
            ProductCategory parent = productCategoryMapper.selectById(dto.getParentId());
            if (parent == null) {
                throw new BusinessException(ResultCode.DATA_NOT_EXIST.getCode(), "父级分类不存在");
            }
            category.setCategoryLevel(parent.getCategoryLevel() + 1);
        } else {
            category.setParentId(0L);
        }

        productCategoryMapper.insert(category);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateCategory(ProductCategoryDTO dto) {
        ProductCategory category = productCategoryMapper.selectById(dto.getId());
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        ProductCategory existing = productCategoryMapper.selectOne(
                new LambdaQueryWrapper<ProductCategory>()
                        .eq(ProductCategory::getCategoryCode, dto.getCategoryCode())
                        .ne(ProductCategory::getId, dto.getId())
        );
        if (existing != null) {
            throw new BusinessException(ResultCode.DATA_ALREADY_EXIST.getCode(), "分类编码已存在");
        }

        BeanUtils.copyProperties(dto, category);
        productCategoryMapper.updateById(category);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteCategory(Long id) {
        ProductCategory category = productCategoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        Long count = productCategoryMapper.selectCount(
                new LambdaQueryWrapper<ProductCategory>()
                        .eq(ProductCategory::getParentId, id)
        );
        if (count > 0) {
            throw new BusinessException(ResultCode.DATA_IN_USE.getCode(), "该分类下存在子分类，无法删除");
        }

        productCategoryMapper.deleteById(id);
    }

    @Override
    public ProductCategory getCategoryById(Long id) {
        return productCategoryMapper.selectById(id);
    }

    @Override
    public List<ProductCategory> getCategoryTree() {
        List<ProductCategory> allCategories = productCategoryMapper.selectList(
                new LambdaQueryWrapper<ProductCategory>()
                        .orderByAsc(ProductCategory::getSortOrder)
        );

        Map<Long, List<ProductCategory>> childrenMap = allCategories.stream()
                .collect(Collectors.groupingBy(c -> c.getParentId() == null ? 0L : c.getParentId()));

        List<ProductCategory> rootCategories = allCategories.stream()
                .filter(c -> c.getParentId() == null || c.getParentId() == 0)
                .peek(c -> buildChildren(c, childrenMap))
                .collect(Collectors.toList());

        return rootCategories;
    }

    private void buildChildren(ProductCategory parent, Map<Long, List<ProductCategory>> childrenMap) {
        List<ProductCategory> children = childrenMap.getOrDefault(parent.getId(), new ArrayList<>());
        parent.setChildren(children);
        for (ProductCategory child : children) {
            buildChildren(child, childrenMap);
        }
    }

    @Override
    public List<ProductCategory> getChildrenByParentId(Long parentId) {
        return productCategoryMapper.selectList(
                new LambdaQueryWrapper<ProductCategory>()
                        .eq(ProductCategory::getParentId, parentId)
                        .orderByAsc(ProductCategory::getSortOrder)
        );
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updatePriority(Long id, Integer priority) {
        ProductCategory category = productCategoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        category.setPriority(priority);
        productCategoryMapper.updateById(category);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateStatus(Long id, Integer status) {
        ProductCategory category = productCategoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        category.setStatus(status);
        productCategoryMapper.updateById(category);
    }
}
