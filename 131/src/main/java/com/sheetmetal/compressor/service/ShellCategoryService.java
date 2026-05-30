package com.sheetmetal.compressor.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sheetmetal.compressor.dto.ShellCategoryDTO;
import com.sheetmetal.compressor.entity.ProductionOrder;
import com.sheetmetal.compressor.entity.ShellCategory;
import com.sheetmetal.compressor.exception.BusinessException;
import com.sheetmetal.compressor.mapper.ProductionOrderMapper;
import com.sheetmetal.compressor.mapper.ShellCategoryMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class ShellCategoryService {

    private static final String CATEGORY_TREE_KEY = "compressor:category:tree";
    private static final String CATEGORY_LIST_KEY = "compressor:category:list";
    private static final long CACHE_EXPIRE_TIME = 30;

    @Autowired
    private ShellCategoryMapper categoryMapper;

    @Autowired
    private ProductionOrderMapper orderMapper;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    public List<ShellCategory> tree() {
        try {
            String cacheValue = redisTemplate.opsForValue().get(CATEGORY_TREE_KEY);
            if (cacheValue != null) {
                return objectMapper.readValue(cacheValue, new TypeReference<List<ShellCategory>>() {});
            }
        } catch (Exception e) {
        }

        List<ShellCategory> allCategories = categoryMapper.selectList(
            new LambdaQueryWrapper<ShellCategory>()
                .orderByAsc(ShellCategory::getLevel)
                .orderByAsc(ShellCategory::getSortOrder)
                .orderByDesc(ShellCategory::getPriority)
        );

        List<ShellCategory> tree = buildTreeRecursive(allCategories, 0L);

        try {
            redisTemplate.opsForValue().set(
                CATEGORY_TREE_KEY,
                objectMapper.writeValueAsString(tree),
                CACHE_EXPIRE_TIME,
                TimeUnit.MINUTES
            );
        } catch (Exception e) {
        }

        return tree;
    }

    private List<ShellCategory> buildTreeRecursive(List<ShellCategory> allCategories, Long parentId) {
        List<ShellCategory> result = new ArrayList<>();
        for (ShellCategory category : allCategories) {
            if (category.getParentId().equals(parentId)) {
                ShellCategory node = new ShellCategory();
                BeanUtils.copyProperties(category, node);
                node.setChildren(buildTreeRecursive(allCategories, category.getId()));
                result.add(node);
            }
        }
        return result;
    }

    public List<ShellCategory> list() {
        try {
            String cacheValue = redisTemplate.opsForValue().get(CATEGORY_LIST_KEY);
            if (cacheValue != null) {
                return objectMapper.readValue(cacheValue, new TypeReference<List<ShellCategory>>() {});
            }
        } catch (Exception e) {
        }

        List<ShellCategory> list = categoryMapper.selectList(
            new LambdaQueryWrapper<ShellCategory>()
                .orderByAsc(ShellCategory::getSortOrder)
        );

        try {
            redisTemplate.opsForValue().set(
                CATEGORY_LIST_KEY,
                objectMapper.writeValueAsString(list),
                CACHE_EXPIRE_TIME,
                TimeUnit.MINUTES
            );
        } catch (Exception e) {
        }

        return list;
    }

    public List<ShellCategory> getAvailableCategories() {
        return categoryMapper.selectList(
            new LambdaQueryWrapper<ShellCategory>()
                .eq(ShellCategory::getStatus, 1)
                .orderByAsc(ShellCategory::getSortOrder)
        );
    }

    public ShellCategory getById(Long id) {
        return categoryMapper.selectById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void add(ShellCategoryDTO dto) {
        LambdaQueryWrapper<ShellCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ShellCategory::getCategoryCode, dto.getCategoryCode());
        if (categoryMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("分类编码已存在");
        }

        ShellCategory category = new ShellCategory();
        BeanUtils.copyProperties(dto, category);

        if (category.getParentId() == null || category.getParentId() == 0L) {
            category.setParentId(0L);
            category.setLevel(1);
        } else {
            ShellCategory parent = categoryMapper.selectById(category.getParentId());
            if (parent == null) {
                throw new BusinessException("父分类不存在");
            }
            category.setLevel(parent.getLevel() + 1);
        }

        categoryMapper.insert(category);
        clearCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(ShellCategoryDTO dto) {
        ShellCategory existing = categoryMapper.selectById(dto.getId());
        if (existing == null) {
            throw new BusinessException("分类不存在");
        }

        if (!existing.getCategoryCode().equals(dto.getCategoryCode())) {
            LambdaQueryWrapper<ShellCategory> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(ShellCategory::getCategoryCode, dto.getCategoryCode());
            if (categoryMapper.selectCount(wrapper) > 0) {
                throw new BusinessException("分类编码已存在");
            }
        }

        ShellCategory category = new ShellCategory();
        BeanUtils.copyProperties(dto, category);
        categoryMapper.updateById(category);
        clearCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        Long childCount = categoryMapper.selectCount(
            new LambdaQueryWrapper<ShellCategory>()
                .eq(ShellCategory::getParentId, id)
        );
        if (childCount > 0) {
            throw new BusinessException("存在子分类，无法删除");
        }

        Long orderCount = orderMapper.selectCount(
            new LambdaQueryWrapper<ProductionOrder>()
                .eq(ProductionOrder::getCategoryId, id)
                .ne(ProductionOrder::getStatus, 11)
                .ne(ProductionOrder::getStatus, 13)
        );
        if (orderCount > 0) {
            throw new BusinessException("该分类存在进行中的工单，无法删除");
        }

        categoryMapper.deleteById(id);
        clearCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void updatePriority(Long id, Integer priority) {
        ShellCategory category = new ShellCategory();
        category.setId(id);
        category.setPriority(priority);
        categoryMapper.updateById(category);
        clearCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void offline(Long id) {
        ShellCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }

        List<Long> offlineIds = getAllSubCategoryIds(id);
        offlineIds.add(id);

        for (Long categoryId : offlineIds) {
            Long orderCount = orderMapper.selectCount(
                new LambdaQueryWrapper<ProductionOrder>()
                    .eq(ProductionOrder::getCategoryId, categoryId)
                    .in(ProductionOrder::getStatus, 1, 2)
            );
            if (orderCount > 0) {
                throw new BusinessException("分类[" + categoryId + "]存在待排产或已排产的工单，无法下线");
            }
        }

        for (Long categoryId : offlineIds) {
            ShellCategory update = new ShellCategory();
            update.setId(categoryId);
            update.setStatus(0);
            categoryMapper.updateById(update);
        }

        clearCache();
    }

    private List<Long> getAllSubCategoryIds(Long parentId) {
        List<Long> result = new ArrayList<>();
        List<ShellCategory> allCategories = categoryMapper.selectList(null);
        collectSubCategoryIds(allCategories, parentId, result);
        return result;
    }

    private void collectSubCategoryIds(List<ShellCategory> allCategories, Long parentId, List<Long> result) {
        for (ShellCategory category : allCategories) {
            if (category.getParentId().equals(parentId)) {
                result.add(category.getId());
                collectSubCategoryIds(allCategories, category.getId(), result);
            }
        }
    }

    public void checkCategoryAvailable(Long categoryId) {
        ShellCategory category = categoryMapper.selectById(categoryId);
        if (category == null) {
            throw new BusinessException("外壳分类不存在");
        }
        if (category.getStatus() == 0) {
            throw new BusinessException("该外壳分类已下线，无法创建工单");
        }
    }

    private void clearCache() {
        redisTemplate.delete(CATEGORY_TREE_KEY);
        redisTemplate.delete(CATEGORY_LIST_KEY);
    }
}
