package com.hardware.stamping.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.hardware.stamping.annotation.Log;
import com.hardware.stamping.entity.ProductCategory;
import com.hardware.stamping.exception.BusinessException;
import com.hardware.stamping.mapper.ProductCategoryMapper;
import com.hardware.stamping.vo.ProductCategoryVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class ProductCategoryService {

    private static final String CATEGORY_CACHE_KEY = "product:category:tree";
    private static final String CATEGORY_ALL_KEY = "product:category:all";
    private static final long CACHE_EXPIRE_TIME = 1;

    @Autowired
    private ProductCategoryMapper productCategoryMapper;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Log("新增产品类目")
    @Transactional(rollbackFor = Exception.class)
    public void addCategory(ProductCategory category) {
        if (category.getParentId() == null || category.getParentId() == 0) {
            category.setParentId(0L);
            category.setLevel(1);
        } else {
            ProductCategory parent = productCategoryMapper.selectById(category.getParentId());
            if (parent == null) {
                throw new BusinessException("父类目不存在");
            }
            category.setLevel(parent.getLevel() + 1);
        }
        category.setStatus(1);
        category.setCreateTime(LocalDateTime.now());
        category.setUpdateTime(LocalDateTime.now());
        category.setDeleted(0);
        productCategoryMapper.insert(category);
        clearCategoryCache();
    }

    @Log("更新产品类目")
    @Transactional(rollbackFor = Exception.class)
    public void updateCategory(ProductCategory category) {
        ProductCategory exist = productCategoryMapper.selectById(category.getId());
        if (exist == null) {
            throw new BusinessException("类目不存在");
        }
        category.setUpdateTime(LocalDateTime.now());
        productCategoryMapper.updateById(category);
        clearCategoryCache();
    }

    @Log("删除产品类目")
    @Transactional(rollbackFor = Exception.class)
    public void deleteCategory(Long id) {
        Long count = productCategoryMapper.selectCount(
                new LambdaQueryWrapper<ProductCategory>().eq(ProductCategory::getParentId, id)
        );
        if (count > 0) {
            throw new BusinessException("存在子类目，无法删除");
        }
        productCategoryMapper.deleteById(id);
        clearCategoryCache();
    }

    @Log("停产下架工件型号")
    @Transactional(rollbackFor = Exception.class)
    public void discontinueCategory(Long id) {
        ProductCategory category = new ProductCategory();
        category.setId(id);
        category.setStatus(0);
        category.setUpdateTime(LocalDateTime.now());
        productCategoryMapper.updateById(category);
        clearCategoryCache();
    }

    @Log("恢复工件型号")
    @Transactional(rollbackFor = Exception.class)
    public void resumeCategory(Long id) {
        ProductCategory category = new ProductCategory();
        category.setId(id);
        category.setStatus(1);
        category.setUpdateTime(LocalDateTime.now());
        productCategoryMapper.updateById(category);
        clearCategoryCache();
    }

    public ProductCategory getById(Long id) {
        return productCategoryMapper.selectById(id);
    }

    public List<ProductCategory> listAll() {
        List<ProductCategory> cachedList = (List<ProductCategory>) redisTemplate.opsForValue().get(CATEGORY_ALL_KEY);
        if (cachedList != null && !cachedList.isEmpty()) {
            return cachedList;
        }

        List<ProductCategory> categories = productCategoryMapper.selectList(
                new LambdaQueryWrapper<ProductCategory>()
                        .orderByAsc(ProductCategory::getSort)
                        .orderByDesc(ProductCategory::getPriority)
        );

        redisTemplate.opsForValue().set(CATEGORY_ALL_KEY, categories, CACHE_EXPIRE_TIME, TimeUnit.HOURS);
        return categories;
    }

    public List<ProductCategoryVO> treeList() {
        List<ProductCategoryVO> cachedTree = (List<ProductCategoryVO>) redisTemplate.opsForValue().get(CATEGORY_CACHE_KEY);
        if (cachedTree != null && !cachedTree.isEmpty()) {
            return cachedTree;
        }

        List<ProductCategory> allCategories = listAll();
        List<ProductCategoryVO> voList = allCategories.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        List<ProductCategoryVO> tree = buildTree(voList, 0L);

        redisTemplate.opsForValue().set(CATEGORY_CACHE_KEY, tree, CACHE_EXPIRE_TIME, TimeUnit.HOURS);
        return tree;
    }

    public List<ProductCategoryVO> buildTree(List<ProductCategoryVO> allCategories, Long parentId) {
        Map<Long, List<ProductCategoryVO>> parentChildrenMap = allCategories.stream()
                .collect(Collectors.groupingBy(ProductCategoryVO::getParentId));

        return buildTreeRecursive(parentChildrenMap, parentId);
    }

    private List<ProductCategoryVO> buildTreeRecursive(Map<Long, List<ProductCategoryVO>> parentChildrenMap, Long parentId) {
        List<ProductCategoryVO> children = parentChildrenMap.getOrDefault(parentId, new ArrayList<>());

        children = children.stream()
                .sorted(Comparator.comparing(ProductCategoryVO::getSort)
                        .thenComparing(Comparator.comparing(ProductCategoryVO::getPriority).reversed()))
                .collect(Collectors.toList());

        for (ProductCategoryVO category : children) {
            List<ProductCategoryVO> subChildren = buildTreeRecursive(parentChildrenMap, category.getId());
            category.setChildren(subChildren);
        }

        return children;
    }

    public List<ProductCategory> listByParentId(Long parentId) {
        return productCategoryMapper.selectList(
                new LambdaQueryWrapper<ProductCategory>()
                        .eq(ProductCategory::getParentId, parentId)
                        .orderByAsc(ProductCategory::getSort)
                        .orderByDesc(ProductCategory::getPriority)
        );
    }

    public List<ProductCategory> getActiveCategories() {
        return productCategoryMapper.selectList(
                new LambdaQueryWrapper<ProductCategory>()
                        .eq(ProductCategory::getStatus, 1)
                        .orderByAsc(ProductCategory::getSort)
                        .orderByDesc(ProductCategory::getPriority)
        );
    }

    public void checkCategoryActive(Long categoryId) {
        ProductCategory category = getById(categoryId);
        if (category == null) {
            throw new BusinessException("产品类目不存在");
        }
        if (category.getStatus() == 0) {
            throw new BusinessException("该工件型号已停产下架，无法下发工单");
        }

        ProductCategory parent = getById(category.getParentId());
        while (parent != null && parent.getId() != 0) {
            if (parent.getStatus() == 0) {
                throw new BusinessException("父类目【" + parent.getCategoryName() + "】已停产下架，无法下发工单");
            }
            parent = getById(parent.getParentId());
        }
    }

    private ProductCategoryVO convertToVO(ProductCategory entity) {
        ProductCategoryVO vo = new ProductCategoryVO();
        BeanUtils.copyProperties(entity, vo);
        vo.setStatusText(entity.getStatus() == 1 ? "启用" : "停用");
        return vo;
    }

    private void clearCategoryCache() {
        redisTemplate.delete(CATEGORY_CACHE_KEY);
        redisTemplate.delete(CATEGORY_ALL_KEY);
    }
}
