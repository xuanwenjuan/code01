package com.rotor.manufacture.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.rotor.manufacture.dto.PageQueryDTO;
import com.rotor.manufacture.entity.ProductCategory;
import com.rotor.manufacture.mapper.ProductCategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductCategoryService {

    private final ProductCategoryMapper productCategoryMapper;

    @Transactional(rollbackFor = Exception.class)
    public void addCategory(ProductCategory category) {
        if (category.getParentId() == null || category.getParentId() == 0) {
            category.setParentId(0L);
            category.setLevel(1);
        } else {
            ProductCategory parent = productCategoryMapper.selectById(category.getParentId());
            category.setLevel(parent.getLevel() + 1);
        }
        category.setStatus(1);
        productCategoryMapper.insert(category);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateCategory(ProductCategory category) {
        productCategoryMapper.updateById(category);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteCategory(Long id) {
        productCategoryMapper.deleteById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void offlineCategory(Long id) {
        LambdaUpdateWrapper<ProductCategory> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(ProductCategory::getId, id)
                .set(ProductCategory::getStatus, 0);
        productCategoryMapper.update(null, wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updatePriority(Long id, Integer priority) {
        LambdaUpdateWrapper<ProductCategory> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(ProductCategory::getId, id)
                .set(ProductCategory::getPriority, priority);
        productCategoryMapper.update(null, wrapper);
    }

    public List<ProductCategory> getTree() {
        LambdaQueryWrapper<ProductCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(ProductCategory::getSort)
                .orderByDesc(ProductCategory::getPriority);
        List<ProductCategory> allCategories = productCategoryMapper.selectList(wrapper);

        return buildTree(allCategories, 0L);
    }

    private List<ProductCategory> buildTree(List<ProductCategory> categories, Long parentId) {
        List<ProductCategory> tree = new ArrayList<>();
        for (ProductCategory category : categories) {
            if (category.getParentId().equals(parentId)) {
                category.setChildren(buildTree(categories, category.getId()));
                tree.add(category);
            }
        }
        return tree;
    }

    public ProductCategory getById(Long id) {
        return productCategoryMapper.selectById(id);
    }

    public Page<ProductCategory> pageQuery(PageQueryDTO queryDTO) {
        Page<ProductCategory> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());
        LambdaQueryWrapper<ProductCategory> wrapper = new LambdaQueryWrapper<>();
        if (queryDTO.getKeyword() != null && !queryDTO.getKeyword().isEmpty()) {
            wrapper.and(w -> w.like(ProductCategory::getCategoryName, queryDTO.getKeyword())
                    .or().like(ProductCategory::getCategoryCode, queryDTO.getKeyword()));
        }
        if (queryDTO.getStatus() != null) {
            wrapper.eq(ProductCategory::getStatus, queryDTO.getStatus());
        }
        wrapper.orderByAsc(ProductCategory::getSort)
                .orderByDesc(ProductCategory::getPriority);
        return productCategoryMapper.selectPage(page, wrapper);
    }

    public void initCategories() {
        LambdaQueryWrapper<ProductCategory> wrapper = new LambdaQueryWrapper<>();
        if (productCategoryMapper.selectCount(wrapper) > 0) {
            return;
        }

        String[][] categories = {
                {"永磁同步电机转子", "PERMANENT_MAGNET"},
                {"异步电机转子", "ASYNCHRONOUS"},
                {"高压电机转子", "HIGH_VOLTAGE"},
                {"定制微型转子", "CUSTOM_MINI"}
        };

        for (int i = 0; i < categories.length; i++) {
            ProductCategory category = new ProductCategory();
            category.setCategoryName(categories[i][0]);
            category.setCategoryCode(categories[i][1]);
            category.setParentId(0L);
            category.setLevel(1);
            category.setSort(i + 1);
            category.setPriority(100 - i * 10);
            category.setStatus(1);
            productCategoryMapper.insert(category);
        }
    }
}