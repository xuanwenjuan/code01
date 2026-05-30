package com.fitness.manufacture.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fitness.manufacture.common.BusinessException;
import com.fitness.manufacture.common.PageQuery;
import com.fitness.manufacture.common.PageResult;
import com.fitness.manufacture.common.ResultCode;
import com.fitness.manufacture.dto.ProductDTO;
import com.fitness.manufacture.entity.Product;
import com.fitness.manufacture.entity.ProductCategory;
import com.fitness.manufacture.mapper.ProductCategoryMapper;
import com.fitness.manufacture.mapper.ProductMapper;
import com.fitness.manufacture.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductMapper productMapper;
    private final ProductCategoryMapper productCategoryMapper;

    @Override
    public void saveProduct(ProductDTO dto) {
        Product exist = productMapper.selectOne(new LambdaQueryWrapper<Product>()
                .eq(Product::getProductCode, dto.getProductCode()));
        if (exist != null) {
            throw new BusinessException(ResultCode.DATA_EXIST, "产品编码已存在");
        }

        ProductCategory category = productCategoryMapper.selectById(dto.getCategoryId());
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "产品分类不存在");
        }

        Product product = new Product();
        BeanUtils.copyProperties(dto, product);
        product.setCategoryPath(getCategoryPath(dto.getCategoryId()));
        if (product.getPriority() == null) {
            product.setPriority(5);
        }
        productMapper.insert(product);
    }

    @Override
    public void updateProduct(ProductDTO dto) {
        Product product = productMapper.selectById(dto.getId());
        if (product == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        Product exist = productMapper.selectOne(new LambdaQueryWrapper<Product>()
                .eq(Product::getProductCode, dto.getProductCode())
                .ne(Product::getId, dto.getId()));
        if (exist != null) {
            throw new BusinessException(ResultCode.DATA_EXIST, "产品编码已存在");
        }

        if (!product.getCategoryId().equals(dto.getCategoryId())) {
            ProductCategory category = productCategoryMapper.selectById(dto.getCategoryId());
            if (category == null) {
                throw new BusinessException(ResultCode.DATA_NOT_EXIST, "产品分类不存在");
            }
            product.setCategoryPath(getCategoryPath(dto.getCategoryId()));
        }

        BeanUtils.copyProperties(dto, product);
        productMapper.updateById(product);
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        productMapper.deleteById(id);
    }

    @Override
    public void stopProduction(Long id) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        product.setStatus(0);
        productMapper.updateById(product);
    }

    @Override
    public void updatePriority(Long id, Integer priority) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        product.setPriority(priority);
        productMapper.updateById(product);
    }

    @Override
    public ProductDTO getProductById(Long id) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        ProductDTO dto = new ProductDTO();
        BeanUtils.copyProperties(product, dto);
        return dto;
    }

    @Override
    public PageResult<Product> getProductPage(PageQuery query, Long categoryId, Integer status) {
        LambdaQueryWrapper<Product> wrapper = new LambdaQueryWrapper<>();
        if (categoryId != null) {
            wrapper.eq(Product::getCategoryId, categoryId);
        }
        if (status != null) {
            wrapper.eq(Product::getStatus, status);
        }
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.and(w -> w.like(Product::getProductName, query.getKeyword())
                    .or().like(Product::getProductCode, query.getKeyword())
                    .or().like(Product::getModel, query.getKeyword()));
        }
        wrapper.orderByDesc(Product::getPriority);
        wrapper.orderByDesc(Product::getCreateTime);

        Page<Product> page = new Page<>(query.getPageNum(), query.getPageSize());
        productMapper.selectPage(page, wrapper);
        return PageResult.of(page);
    }

    private String getCategoryPath(Long categoryId) {
        List<String> pathList = new ArrayList<>();
        Long currentId = categoryId;
        while (currentId != null && currentId > 0) {
            ProductCategory category = productCategoryMapper.selectById(currentId);
            if (category == null) {
                break;
            }
            pathList.add(0, category.getCategoryName());
            currentId = category.getParentId();
        }
        return String.join("/", pathList);
    }
}
