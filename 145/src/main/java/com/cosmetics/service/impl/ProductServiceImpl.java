package com.cosmetics.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cosmetics.common.PageQuery;
import com.cosmetics.common.ResultCode;
import com.cosmetics.entity.Product;
import com.cosmetics.exception.BusinessException;
import com.cosmetics.mapper.ProductMapper;
import com.cosmetics.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductMapper productMapper;

    @Override
    public Page<Product> getPage(PageQuery pageQuery, Long categoryId, String keyword, Integer status) {
        LambdaQueryWrapper<Product> wrapper = new LambdaQueryWrapper<>();
        if (categoryId != null) {
            wrapper.eq(Product::getCategoryId, categoryId);
        }
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(Product::getName, keyword)
                    .or().like(Product::getProductCode, keyword));
        }
        if (status != null) {
            wrapper.eq(Product::getStatus, status);
        }
        wrapper.orderByDesc(Product::getSalesPriority)
                .orderByDesc(Product::getCreateTime);

        return productMapper.selectPage(
                new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()),
                wrapper
        );
    }

    @Override
    public Product getById(Long id) {
        return productMapper.selectById(id);
    }

    @Override
    public void add(Product product) {
        Long count = productMapper.selectCount(
                new LambdaQueryWrapper<Product>()
                        .eq(Product::getProductCode, product.getProductCode())
        );
        if (count > 0) {
            throw new BusinessException(ResultCode.DATA_ALREADY_EXISTS.getCode(), "产品编码已存在");
        }
        if (product.getSalesPriority() == null) {
            product.setSalesPriority(0);
        }
        if (product.getStatus() == null) {
            product.setStatus(1);
        }
        productMapper.insert(product);
    }

    @Override
    public void update(Product product) {
        Product exist = productMapper.selectById(product.getId());
        if (exist == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }
        if (!exist.getProductCode().equals(product.getProductCode())) {
            Long count = productMapper.selectCount(
                    new LambdaQueryWrapper<Product>()
                            .eq(Product::getProductCode, product.getProductCode())
                            .ne(Product::getId, product.getId())
            );
            if (count > 0) {
                throw new BusinessException(ResultCode.DATA_ALREADY_EXISTS.getCode(), "产品编码已存在");
            }
        }
        productMapper.updateById(product);
    }

    @Override
    public void delete(Long id) {
        productMapper.deleteById(id);
    }

    @Override
    public void updateStatus(Long id, Integer status) {
        Product product = new Product();
        product.setId(id);
        product.setStatus(status);
        productMapper.updateById(product);
    }
}
