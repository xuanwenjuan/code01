package com.household.management.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.household.management.common.entity.PageQuery;
import com.household.management.common.exception.BusinessException;
import com.household.management.common.result.ResultCode;
import com.household.management.entity.Product;
import com.household.management.mapper.ProductMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
public class ProductService {

    private final ProductMapper productMapper;

    public ProductService(ProductMapper productMapper) {
        this.productMapper = productMapper;
    }

    public IPage<Product> page(PageQuery pageQuery, String productName, Long categoryId, Integer status) {
        LambdaQueryWrapper<Product> wrapper = new LambdaQueryWrapper<>();
        if (productName != null && !productName.isEmpty()) {
            wrapper.like(Product::getProductName, productName);
        }
        if (categoryId != null) {
            wrapper.eq(Product::getCategoryId, categoryId);
        }
        if (status != null) {
            wrapper.eq(Product::getStatus, status);
        }
        wrapper.orderByDesc(Product::getPriority).orderByDesc(Product::getId);

        return productMapper.selectPage(new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()), wrapper);
    }

    public List<Product> list() {
        return productMapper.selectProductListWithCategory();
    }

    public Product getById(Long id) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        return product;
    }

    @Transactional(rollbackFor = Exception.class)
    public void add(Product product) {
        LambdaQueryWrapper<Product> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Product::getProductCode, product.getProductCode());
        if (productMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("产品编码已存在");
        }
        if (product.getPriority() == null) {
            product.setPriority(0);
        }
        productMapper.insert(product);
        log.info("新增产品：{}", product.getProductName());
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(Product product) {
        Product existing = productMapper.selectById(product.getId());
        if (existing == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (!existing.getProductCode().equals(product.getProductCode())) {
            LambdaQueryWrapper<Product> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(Product::getProductCode, product.getProductCode());
            if (productMapper.selectCount(wrapper) > 0) {
                throw new BusinessException("产品编码已存在");
            }
        }
        productMapper.updateById(product);
        log.info("更新产品：{}", product.getProductName());
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        productMapper.deleteById(id);
        log.info("删除产品：{}", product.getProductName());
    }

    public void updateStatus(Long id, Integer status) {
        Product product = new Product();
        product.setId(id);
        product.setStatus(status);
        productMapper.updateById(product);
        log.info("更新产品状态：id={}, status={}", id, status);
    }

    public void updatePriority(Long id, Integer priority) {
        Product product = new Product();
        product.setId(id);
        product.setPriority(priority);
        productMapper.updateById(product);
        log.info("更新产品优先级：id={}, priority={}", id, priority);
    }
}
