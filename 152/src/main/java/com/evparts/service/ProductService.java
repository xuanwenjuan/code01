package com.evparts.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.evparts.common.PageResult;
import com.evparts.common.ResultCode;
import com.evparts.dto.ProductDTO;
import com.evparts.dto.ProductQueryDTO;
import com.evparts.entity.Product;
import com.evparts.entity.ProductCategory;
import com.evparts.exception.BusinessException;
import com.evparts.mapper.ProductCategoryMapper;
import com.evparts.mapper.ProductMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private ProductCategoryMapper categoryMapper;

    public PageResult<Product> getPage(ProductQueryDTO queryDTO) {
        LambdaQueryWrapper<Product> wrapper = new LambdaQueryWrapper<>();
        if (queryDTO.getProductName() != null && !queryDTO.getProductName().isEmpty()) {
            wrapper.like(Product::getProductName, queryDTO.getProductName());
        }
        if (queryDTO.getProductCode() != null && !queryDTO.getProductCode().isEmpty()) {
            wrapper.like(Product::getProductCode, queryDTO.getProductCode());
        }
        if (queryDTO.getCategoryId() != null) {
            wrapper.eq(Product::getCategoryId, queryDTO.getCategoryId());
        }
        if (queryDTO.getStatus() != null) {
            wrapper.eq(Product::getStatus, queryDTO.getStatus());
        }
        wrapper.orderByDesc(Product::getPriority).orderByDesc(Product::getCreateTime);

        IPage<Product> page = productMapper.selectPage(queryDTO.toPage(), wrapper);
        for (Product product : page.getRecords()) {
            ProductCategory category = categoryMapper.selectById(product.getCategoryId());
            if (category != null) {
                product.setCategoryName(category.getCategoryName());
            }
        }
        return PageResult.of(page);
    }

    public List<Product> getList() {
        return productMapper.selectList(
                new LambdaQueryWrapper<Product>()
                        .eq(Product::getStatus, 1)
                        .orderByDesc(Product::getPriority)
        );
    }

    public Product getById(Long id) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            throw new BusinessException(ResultCode.PRODUCT_NOT_EXIST);
        }
        ProductCategory category = categoryMapper.selectById(product.getCategoryId());
        if (category != null) {
            product.setCategoryName(category.getCategoryName());
        }
        return product;
    }

    @Transactional(rollbackFor = Exception.class)
    public void add(ProductDTO dto) {
        Long count = productMapper.selectCount(
                new LambdaQueryWrapper<Product>()
                        .eq(Product::getProductCode, dto.getProductCode())
        );
        if (count > 0) {
            throw new BusinessException(ResultCode.PRODUCT_CODE_EXIST);
        }
        Product product = new Product();
        BeanUtils.copyProperties(dto, product);
        productMapper.insert(product);
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(ProductDTO dto) {
        Product product = productMapper.selectById(dto.getId());
        if (product == null) {
            throw new BusinessException(ResultCode.PRODUCT_NOT_EXIST);
        }
        if (!product.getProductCode().equals(dto.getProductCode())) {
            Long count = productMapper.selectCount(
                    new LambdaQueryWrapper<Product>()
                            .eq(Product::getProductCode, dto.getProductCode())
            );
            if (count > 0) {
                throw new BusinessException(ResultCode.PRODUCT_CODE_EXIST);
            }
        }
        BeanUtils.copyProperties(dto, product);
        productMapper.updateById(product);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStatus(Long id, Integer status) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            throw new BusinessException(ResultCode.PRODUCT_NOT_EXIST);
        }
        product.setStatus(status);
        productMapper.updateById(product);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updatePriority(Long id, Integer priority) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            throw new BusinessException(ResultCode.PRODUCT_NOT_EXIST);
        }
        product.setPriority(priority);
        productMapper.updateById(product);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            throw new BusinessException(ResultCode.PRODUCT_NOT_EXIST);
        }
        productMapper.deleteById(id);
    }

}
