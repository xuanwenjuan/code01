package com.fastener.production.service.product.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fastener.production.common.entity.PageQuery;
import com.fastener.production.common.enums.CategoryStatusEnum;
import com.fastener.production.common.exception.BusinessException;
import com.fastener.production.common.result.ResultCode;
import com.fastener.production.entity.product.ProductCategory;
import com.fastener.production.entity.product.dto.ProductCategoryDTO;
import com.fastener.production.entity.product.vo.ProductCategoryTreeVO;
import com.fastener.production.mapper.product.ProductCategoryMapper;
import com.fastener.production.service.product.ProductCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductCategoryServiceImpl extends ServiceImpl<ProductCategoryMapper, ProductCategory> implements ProductCategoryService {

    private final ProductCategoryMapper productCategoryMapper;

    @Override
    @Cacheable(value = "productCategory", key = "'page:' + #pageQuery.pageNum + ':' + #pageQuery.pageSize + ':' + #categoryName + ':' + #status", cacheManager = "redisCacheManager", unless = "#result == null")
    public IPage<ProductCategory> page(PageQuery pageQuery, String categoryName, Integer status) {
        Page<ProductCategory> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());
        LambdaQueryWrapper<ProductCategory> wrapper = new LambdaQueryWrapper<>();
        if (categoryName != null && !categoryName.isEmpty()) {
            wrapper.like(ProductCategory::getCategoryName, categoryName);
        }
        if (status != null) {
            wrapper.eq(ProductCategory::getStatus, status);
        }
        wrapper.orderByAsc(ProductCategory::getSortOrder);
        wrapper.orderByDesc(ProductCategory::getCreateTime);
        return this.page(page, wrapper);
    }

    @Override
    @Cacheable(value = "productCategory", key = "'tree'", cacheManager = "redisCacheManager", unless = "#result == null")
    public ProductCategoryTreeVO getTree() {
        List<ProductCategory> allCategories = this.list(new LambdaQueryWrapper<ProductCategory>()
                .eq(ProductCategory::getDeleted, 0)
                .orderByAsc(ProductCategory::getSortOrder)
                .orderByAsc(ProductCategory::getId));

        List<ProductCategoryTreeVO> allVOs = allCategories.stream()
                .map(this::convertToTreeVO)
                .collect(Collectors.toList());

        ProductCategoryTreeVO root = new ProductCategoryTreeVO();
        root.setId(0L);
        root.setCategoryName("产品分类");
        root.setChildren(buildTree(allVOs, 0L));
        return root;
    }

    @Override
    @Cacheable(value = "productCategory", key = "'children:' + #parentId", cacheManager = "redisCacheManager", unless = "#result == null || #result.size() == 0")
    public List<ProductCategoryTreeVO> getChildren(Long parentId) {
        List<ProductCategory> categories = productCategoryMapper.selectByParentId(parentId);
        return categories.stream()
                .map(this::convertToTreeVO)
                .collect(Collectors.toList());
    }

    private List<ProductCategoryTreeVO> buildTree(List<ProductCategoryTreeVO> allVOs, Long parentId) {
        List<ProductCategoryTreeVO> children = allVOs.stream()
                .filter(vo -> parentId.equals(vo.getParentId()))
                .collect(Collectors.toList());

        for (ProductCategoryTreeVO child : children) {
            child.setChildren(buildTree(allVOs, child.getId()));
        }

        return children;
    }

    private ProductCategoryTreeVO convertToTreeVO(ProductCategory category) {
        ProductCategoryTreeVO vo = new ProductCategoryTreeVO();
        BeanUtils.copyProperties(category, vo);
        for (CategoryStatusEnum statusEnum : CategoryStatusEnum.values()) {
            if (statusEnum.getCode().equals(category.getStatus())) {
                vo.setStatusName(statusEnum.getName()));
                break;
            }
        }
        vo.setChildren(new ArrayList<>()));
        return vo;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "productCategory", allEntries = true)
    public void add(ProductCategoryDTO dto) {
        ProductCategory existing = productCategoryMapper.selectByCode(dto.getCategoryCode());
        if (existing != null) {
            throw new BusinessException(ResultCode.DATA_ALREADY_EXIST, "分类编码已存在");
        }

        ProductCategory category = new ProductCategory();
        BeanUtils.copyProperties(dto, category);

        if (dto.getParentId() != null && dto.getParentId() > 0) {
            ProductCategory parent = this.getById(dto.getParentId());
            if (parent == null) {
                throw new BusinessException(ResultCode.DATA_NOT_EXIST, "父级分类不存在");
            }
            category.setLevel(parent.getLevel() + 1));
        } else {
            category.setLevel(1));
        }

        this.save(category);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "productCategory", allEntries = true)
    public void update(ProductCategoryDTO dto) {
        ProductCategory category = this.getById(dto.getId());
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        if (!category.getCategoryCode().equals(dto.getCategoryCode())) {
            ProductCategory existing = productCategoryMapper.selectByCode(dto.getCategoryCode());
            if (existing != null) {
                throw new BusinessException(ResultCode.DATA_ALREADY_EXIST, "分类编码已存在");
            }
        }

        BeanUtils.copyProperties(dto, category);

        if (dto.getParentId() != null && dto.getParentId() > 0) {
            if (dto.getParentId().equals(dto.getId())) {
                throw new BusinessException(ResultCode.PARAM_ERROR, "父级分类不能是自己");
            }
            ProductCategory parent = this.getById(dto.getParentId());
            if (parent == null) {
                throw new BusinessException(ResultCode.DATA_NOT_EXIST, "父级分类不存在");
            }
            category.setLevel(parent.getLevel() + 1));
        } else {
            category.setLevel(1));
        }

        this.updateById(category);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "productCategory", allEntries = true)
    public void delete(Long id) {
        ProductCategory category = this.getById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        Integer childCount = productCategoryMapper.countChildren(id);
        if (childCount > 0) {
            throw new BusinessException(ResultCode.DATA_STATUS_ERROR, "存在子分类，无法删除");
        }

        this.removeById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "productCategory", allEntries = true)
    public void updateStatus(Long id, Integer status) {
        ProductCategory category = this.getById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        boolean validStatus = false;
        for (CategoryStatusEnum statusEnum : CategoryStatusEnum.values()) {
            if (statusEnum.getCode().equals(status)) {
                validStatus = true;
                break;
            }
        }
        if (!validStatus) {
            throw new BusinessException(ResultCode.PARAM_ERROR, "无效的状态值");
        }

        category.setStatus(status);
        this.updateById(category);
    }
}
