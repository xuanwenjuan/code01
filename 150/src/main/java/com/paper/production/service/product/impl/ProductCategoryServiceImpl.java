package com.paper.production.service.product.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.paper.production.common.ResultCode;
import com.paper.production.dto.product.ProductCategoryDTO;
import com.paper.production.entity.product.ProductCategory;
import com.paper.production.exception.BusinessException;
import com.paper.production.mapper.product.ProductCategoryMapper;
import com.paper.production.service.product.ProductCategoryService;
import com.paper.production.utils.RedisUtil;
import com.paper.production.vo.product.ProductCategoryTreeVO;
import jakarta.annotation.Resource;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProductCategoryServiceImpl extends ServiceImpl<ProductCategoryMapper, ProductCategory> implements ProductCategoryService {

    private static final String CATEGORY_CACHE_KEY = "product:category:tree";
    private static final String CATEGORY_TYPE_CACHE_KEY = "product:category:tree:type:";
    private static final long CACHE_EXPIRE_TIME = 3600;

    @Resource
    private RedisUtil redisUtil;

    @Override
    public void saveCategory(ProductCategoryDTO dto) {
        LambdaQueryWrapper<ProductCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductCategory::getCategoryCode, dto.getCategoryCode());
        if (count(wrapper) > 0) {
            throw new BusinessException(ResultCode.DATA_ALREADY_EXIST.getCode(), "分类编码已存在");
        }

        ProductCategory category = new ProductCategory();
        BeanUtils.copyProperties(dto, category);
        if (category.getParentId() == null) {
            category.setParentId(0L);
        }
        if (category.getSort() == null) {
            category.setSort(0);
        }
        if (category.getStatus() == null) {
            category.setStatus(1);
        }
        save(category);
        clearCache();
    }

    @Override
    public void updateCategory(ProductCategoryDTO dto) {
        if (dto.getId() == null) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), "ID不能为空");
        }
        ProductCategory category = getById(dto.getId());
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        LambdaQueryWrapper<ProductCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductCategory::getCategoryCode, dto.getCategoryCode());
        wrapper.ne(ProductCategory::getId, dto.getId());
        if (count(wrapper) > 0) {
            throw new BusinessException(ResultCode.DATA_ALREADY_EXIST.getCode(), "分类编码已存在");
        }

        BeanUtils.copyProperties(dto, category);
        updateById(category);
        clearCache();
    }

    @Override
    public void deleteCategory(Long id) {
        ProductCategory category = getById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        LambdaQueryWrapper<ProductCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductCategory::getParentId, id);
        if (count(wrapper) > 0) {
            throw new BusinessException(ResultCode.DATA_CANNOT_DELETE.getCode(), "存在子分类，无法删除");
        }

        removeById(id);
        clearCache();
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<ProductCategoryTreeVO> getCategoryTree() {
        Object cacheObj = redisUtil.get(CATEGORY_CACHE_KEY);
        if (cacheObj != null) {
            return (List<ProductCategoryTreeVO>) cacheObj;
        }

        List<ProductCategory> categories = list();
        List<ProductCategoryTreeVO> tree = buildTree(categories, 0L);
        redisUtil.set(CATEGORY_CACHE_KEY, tree, CACHE_EXPIRE_TIME);
        return tree;
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<ProductCategoryTreeVO> getCategoryTreeByType(String categoryType) {
        String cacheKey = CATEGORY_TYPE_CACHE_KEY + categoryType;
        Object cacheObj = redisUtil.get(cacheKey);
        if (cacheObj != null) {
            return (List<ProductCategoryTreeVO>) cacheObj;
        }

        LambdaQueryWrapper<ProductCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductCategory::getCategoryType, categoryType);
        List<ProductCategory> categories = list(wrapper);
        List<ProductCategoryTreeVO> tree = buildTree(categories, 0L);
        redisUtil.set(cacheKey, tree, CACHE_EXPIRE_TIME);
        return tree;
    }

    @Override
    public void stopProduction(Long id) {
        ProductCategory category = getById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        category.setStatus(0);
        updateById(category);
        clearCache();
    }

    @Override
    public void updatePriority(Long id, Integer priority) {
        ProductCategory category = getById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        category.setPriority(priority);
        updateById(category);
        clearCache();
    }

    private List<ProductCategoryTreeVO> buildTree(List<ProductCategory> categories, Long parentId) {
        List<ProductCategoryTreeVO> result = new ArrayList<>();

        Map<Long, List<ProductCategory>> groupMap = categories.stream()
                .collect(Collectors.groupingBy(ProductCategory::getParentId));

        buildTreeRecursive(result, groupMap, parentId);

        return result;
    }

    private void buildTreeRecursive(List<ProductCategoryTreeVO> result, Map<Long, List<ProductCategory>> groupMap, Long parentId) {
        List<ProductCategory> children = groupMap.get(parentId);
        if (children != null) {
            for (ProductCategory category : children) {
                ProductCategoryTreeVO vo = new ProductCategoryTreeVO();
                BeanUtils.copyProperties(category, vo);
                result.add(vo);

                List<ProductCategoryTreeVO> childList = new ArrayList<>();
                buildTreeRecursive(childList, groupMap, category.getId());
                if (!childList.isEmpty()) {
                    vo.setChildren(childList);
                }
            }
        }
    }

    private void clearCache() {
        redisUtil.delete(CATEGORY_CACHE_KEY);
        List<String> keys = redisUtil.keys(CATEGORY_TYPE_CACHE_KEY + "*");
        if (keys != null && !keys.isEmpty()) {
            for (String key : keys) {
                redisUtil.delete(key);
            }
        }
    }
}
