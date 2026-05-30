package com.plastic.injection.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.plastic.injection.annotation.OperationLog;
import com.plastic.injection.common.ResultCode;
import com.plastic.injection.context.UserContext;
import com.plastic.injection.dto.ProductCategoryDTO;
import com.plastic.injection.exception.BusinessException;
import com.plastic.injection.mapper.ProductCategoryMapper;
import com.plastic.injection.po.ProductCategoryPO;
import com.plastic.injection.vo.CategoryTreeVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductCategoryService {

    private final ProductCategoryMapper productCategoryMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String CATEGORY_TREE_CACHE_KEY = "category:tree";
    private static final String HOT_CATEGORIES_CACHE_KEY = "category:hot";
    private static final long CACHE_EXPIRE_TIME = 1;
    private static final TimeUnit CACHE_EXPIRE_UNIT = TimeUnit.HOURS;

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "产品类目", description = "保存产品类目")
    public Long saveCategory(ProductCategoryDTO dto) {
        String operator = UserContext.getUsername();

        if (dto.getParentId() != null && dto.getParentId() != 0) {
            ProductCategoryPO parent = productCategoryMapper.selectById(dto.getParentId());
            if (parent == null) {
                throw new BusinessException(ResultCode.CATEGORY_NOT_FOUND.getCode(), "父类目不存在");
            }
            if (parent.getStatus() == 0) {
                throw new BusinessException(ResultCode.CATEGORY_DISABLED.getCode(), "父类目已下架");
            }
        }

        ProductCategoryPO po;
        if (dto.getId() != null) {
            po = productCategoryMapper.selectById(dto.getId());
            if (po == null) {
                throw new BusinessException(ResultCode.CATEGORY_NOT_FOUND);
            }
            BeanUtils.copyProperties(dto, po);
            po.setUpdateBy(operator);
            productCategoryMapper.updateById(po);
        } else {
            po = new ProductCategoryPO();
            BeanUtils.copyProperties(dto, po);
            po.setParentId(dto.getParentId() != null ? dto.getParentId() : 0L);
            po.setLevel(calculateLevel(po.getParentId()));
            po.setStatus(1);
            po.setCreateBy(operator);
            po.setUpdateBy(operator);
            productCategoryMapper.insert(po);
        }

        clearCache();
        return po.getId();
    }

    private int calculateLevel(Long parentId) {
        if (parentId == null || parentId == 0) {
            return 1;
        }
        ProductCategoryPO parent = productCategoryMapper.selectById(parentId);
        return parent != null ? parent.getLevel() + 1 : 1;
    }

    public List<CategoryTreeVO> getCategoryTree() {
        Object cached = redisTemplate.opsForValue().get(CATEGORY_TREE_CACHE_KEY);
        if (cached != null && cached instanceof List) {
            return (List<CategoryTreeVO>) cached;
        }

        LambdaQueryWrapper<ProductCategoryPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductCategoryPO::getStatus, 1)
                .orderByAsc(ProductCategoryPO::getSort)
                .orderByDesc(ProductCategoryPO::getPriority);

        List<ProductCategoryPO> allCategories = productCategoryMapper.selectList(wrapper);
        List<CategoryTreeVO> rootNodes = new ArrayList<>();

        for (ProductCategoryPO category : allCategories) {
            if (category.getParentId() == null || category.getParentId() == 0) {
                CategoryTreeVO vo = convertToVO(category);
                buildChildren(vo, allCategories);
                rootNodes.add(vo);
            }
        }

        redisTemplate.opsForValue().set(CATEGORY_TREE_CACHE_KEY, rootNodes, CACHE_EXPIRE_TIME, CACHE_EXPIRE_UNIT);
        return rootNodes;
    }

    private void buildChildren(CategoryTreeVO parent, List<ProductCategoryPO> allCategories) {
        List<CategoryTreeVO> children = new ArrayList<>();
        for (ProductCategoryPO category : allCategories) {
            if (category.getParentId() != null && category.getParentId().equals(parent.getId())) {
                CategoryTreeVO vo = convertToVO(category);
                buildChildren(vo, allCategories);
                children.add(vo);
            }
        }
        parent.setChildren(children);
    }

    public List<CategoryTreeVO> getHotCategories() {
        Object cached = redisTemplate.opsForValue().get(HOT_CATEGORIES_CACHE_KEY);
        if (cached != null && cached instanceof List) {
            return (List<CategoryTreeVO>) cached;
        }

        LambdaQueryWrapper<ProductCategoryPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductCategoryPO::getStatus, 1)
                .eq(ProductCategoryPO::getLevel, 1)
                .orderByDesc(ProductCategoryPO::getPriority)
                .orderByAsc(ProductCategoryPO::getSort)
                .last("LIMIT 10");

        List<ProductCategoryPO> list = productCategoryMapper.selectList(wrapper);
        List<CategoryTreeVO> result = list.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        redisTemplate.opsForValue().set(HOT_CATEGORIES_CACHE_KEY, result, CACHE_EXPIRE_TIME, CACHE_EXPIRE_UNIT);
        return result;
    }

    public Page<CategoryTreeVO> pageQuery(Integer pageNum, Integer pageSize, String categoryName, Integer status) {
        Page<ProductCategoryPO> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<ProductCategoryPO> wrapper = new LambdaQueryWrapper<>();
        if (categoryName != null && !categoryName.isEmpty()) {
            wrapper.like(ProductCategoryPO::getCategoryName, categoryName);
        }
        if (status != null) {
            wrapper.eq(ProductCategoryPO::getStatus, status);
        }
        wrapper.orderByAsc(ProductCategoryPO::getSort)
                .orderByDesc(ProductCategoryPO::getPriority);

        Page<ProductCategoryPO> resultPage = productCategoryMapper.selectPage(page, wrapper);

        Page<CategoryTreeVO> voPage = new Page<>(resultPage.getCurrent(), resultPage.getSize(), resultPage.getTotal());
        voPage.setRecords(resultPage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList()));

        return voPage;
    }

    public CategoryTreeVO getById(Long id) {
        ProductCategoryPO po = productCategoryMapper.selectById(id);
        if (po == null) {
            throw new BusinessException(ResultCode.CATEGORY_NOT_FOUND);
        }
        return convertToVO(po);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "产品类目", description = "更新类目状态")
    public void updateStatus(Long id, Integer status) {
        ProductCategoryPO po = productCategoryMapper.selectById(id);
        if (po == null) {
            throw new BusinessException(ResultCode.CATEGORY_NOT_FOUND);
        }

        if (status == 0) {
            List<Long> childIds = getAllChildIds(id);
            childIds.add(id);
            for (Long childId : childIds) {
                ProductCategoryPO child = new ProductCategoryPO();
                child.setId(childId);
                child.setStatus(0);
                child.setUpdateBy(UserContext.getUsername());
                productCategoryMapper.updateById(child);
            }
        } else {
            po.setStatus(status);
            po.setUpdateBy(UserContext.getUsername());
            productCategoryMapper.updateById(po);
        }

        clearCache();
    }

    private List<Long> getAllChildIds(Long parentId) {
        List<Long> result = new ArrayList<>();
        LambdaQueryWrapper<ProductCategoryPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductCategoryPO::getParentId, parentId);
        List<ProductCategoryPO> children = productCategoryMapper.selectList(wrapper);

        for (ProductCategoryPO child : children) {
            result.add(child.getId());
            result.addAll(getAllChildIds(child.getId()));
        }
        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "产品类目", description = "删除产品类目")
    public void deleteById(Long id) {
        LambdaQueryWrapper<ProductCategoryPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductCategoryPO::getParentId, id);
        if (productCategoryMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("存在子类目，无法删除");
        }
        productCategoryMapper.deleteById(id);
        clearCache();
    }

    public boolean isCategoryAvailable(Long categoryId) {
        if (categoryId == null) {
            return false;
        }
        ProductCategoryPO po = productCategoryMapper.selectById(categoryId);
        if (po == null) {
            return false;
        }
        if (po.getStatus() == 0) {
            return false;
        }
        if (po.getParentId() != null && po.getParentId() != 0) {
            return isCategoryAvailable(po.getParentId());
        }
        return true;
    }

    private CategoryTreeVO convertToVO(ProductCategoryPO po) {
        CategoryTreeVO vo = new CategoryTreeVO();
        BeanUtils.copyProperties(po, vo);
        vo.setChildren(new ArrayList<>());
        return vo;
    }

    private void clearCache() {
        redisTemplate.delete(CATEGORY_TREE_CACHE_KEY);
        redisTemplate.delete(HOT_CATEGORIES_CACHE_KEY);
    }
}
