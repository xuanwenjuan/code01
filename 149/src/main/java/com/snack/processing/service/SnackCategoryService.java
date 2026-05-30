package com.snack.processing.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.snack.processing.annotation.OperationLog;
import com.snack.processing.common.Result;
import com.snack.processing.common.ResultCode;
import com.snack.processing.dto.category.CategoryAddDTO;
import com.snack.processing.dto.category.CategoryQueryDTO;
import com.snack.processing.entity.SnackCategory;
import com.snack.processing.exception.BusinessException;
import com.snack.processing.mapper.SnackCategoryMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SnackCategoryService extends ServiceImpl<SnackCategoryMapper, SnackCategory> {

    private final SnackCategoryMapper categoryMapper;
    private final RedisCacheService redisCacheService;

    @OperationLog(module = "零食品类管理", operation = "新增品类", description = "新增零食品类")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> addCategory(CategoryAddDTO dto) {
        SnackCategory exists = categoryMapper.selectOne(new LambdaQueryWrapper<SnackCategory>()
                .eq(SnackCategory::getCode, dto.getCode()));

        if (exists != null) {
            throw new BusinessException(ResultCode.DATA_EXISTS, "品类编码已存在");
        }

        SnackCategory category = new SnackCategory();
        category.setName(dto.getName());
        category.setCode(dto.getCode());
        category.setParentId(dto.getParentId());
        category.setLevel(dto.getLevel());
        category.setSortOrder(dto.getSortOrder());
        category.setPriority(dto.getPriority());
        category.setStatus(dto.getStatus());
        category.setDescription(dto.getDescription());

        categoryMapper.insert(category);
        clearCategoryCache();
        return Result.success();
    }

    @OperationLog(module = "零食品类管理", operation = "更新品类", description = "更新零食品类信息")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> updateCategory(Long id, CategoryAddDTO dto) {
        SnackCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        SnackCategory exists = categoryMapper.selectOne(new LambdaQueryWrapper<SnackCategory>()
                .eq(SnackCategory::getCode, dto.getCode())
                .ne(SnackCategory::getId, id));

        if (exists != null) {
            throw new BusinessException(ResultCode.DATA_EXISTS, "品类编码已存在");
        }

        category.setName(dto.getName());
        category.setCode(dto.getCode());
        category.setParentId(dto.getParentId());
        category.setLevel(dto.getLevel());
        category.setSortOrder(dto.getSortOrder());
        category.setPriority(dto.getPriority());
        category.setStatus(dto.getStatus());
        category.setDescription(dto.getDescription());

        categoryMapper.updateById(category);
        clearCategoryCache();
        return Result.success();
    }

    @OperationLog(module = "零食品类管理", operation = "删除品类", description = "删除零食品类")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> deleteCategory(Long id) {
        SnackCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        Long count = categoryMapper.selectCount(new LambdaQueryWrapper<SnackCategory>()
                .eq(SnackCategory::getParentId, id));

        if (count > 0) {
            throw new BusinessException(ResultCode.DATA_IN_USE, "该品类下存在子分类，无法删除");
        }

        categoryMapper.deleteById(id);
        clearCategoryCache();
        return Result.success();
    }

    @OperationLog(module = "零食品类管理", operation = "停用品类", description = "淘汰停用零食品类")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> disableCategory(Long id) {
        SnackCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        category.setStatus(0);
        categoryMapper.updateById(category);
        clearCategoryCache();
        return Result.success();
    }

    @OperationLog(module = "零食品类管理", operation = "启用品类", description = "启用零食品类")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> enableCategory(Long id) {
        SnackCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        category.setStatus(1);
        categoryMapper.updateById(category);
        clearCategoryCache();
        return Result.success();
    }

    public Result<SnackCategory> getCategoryById(Long id) {
        SnackCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }
        return Result.success(category);
    }

    public Result<IPage<SnackCategory>> getCategoryPage(CategoryQueryDTO dto) {
        LambdaQueryWrapper<SnackCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(dto.getName() != null, SnackCategory::getName, dto.getName())
                .eq(dto.getCode() != null, SnackCategory::getCode, dto.getCode())
                .eq(dto.getStatus() != null, SnackCategory::getStatus, dto.getStatus())
                .eq(dto.getParentId() != null, SnackCategory::getParentId, dto.getParentId())
                .orderByAsc(SnackCategory::getSortOrder)
                .orderByDesc(SnackCategory::getPriority);

        IPage<SnackCategory> page = categoryMapper.selectPage(dto.buildPage(), wrapper);
        return Result.success(page);
    }

    @SuppressWarnings("unchecked")
    public Result<List<SnackCategory>> getCategoryTree() {
        Object cached = redisCacheService.get(RedisCacheService.CATEGORY_TREE_KEY);
        if (cached != null) {
            log.debug("Category tree cache hit");
            return Result.success((List<SnackCategory>) cached);
        }

        log.debug("Category tree cache miss, querying database");
        List<SnackCategory> allCategories = categoryMapper.selectList(new LambdaQueryWrapper<SnackCategory>()
                .eq(SnackCategory::getStatus, 1)
                .orderByAsc(SnackCategory::getSortOrder)
                .orderByDesc(SnackCategory::getPriority));

        Map<Long, List<SnackCategory>> parentChildrenMap = new HashMap<>();
        for (SnackCategory category : allCategories) {
            Long parentId = category.getParentId() != null ? category.getParentId() : 0L;
            parentChildrenMap.computeIfAbsent(parentId, k -> new ArrayList<>()).add(category);
        }

        List<SnackCategory> rootCategories = parentChildrenMap.getOrDefault(0L, new ArrayList<>());
        buildChildren(rootCategories, parentChildrenMap);

        redisCacheService.set(RedisCacheService.CATEGORY_TREE_KEY, rootCategories, 2, TimeUnit.HOURS);

        return Result.success(rootCategories);
    }

    private void buildChildren(List<SnackCategory> categories, Map<Long, List<SnackCategory>> parentChildrenMap) {
        for (SnackCategory category : categories) {
            List<SnackCategory> children = parentChildrenMap.get(category.getId());
            if (children != null && !children.isEmpty()) {
                category.setChildren(children);
                buildChildren(children, parentChildrenMap);
            }
        }
    }

    public Result<List<SnackCategory>> getChildrenByParentId(Long parentId) {
        String cacheKey = RedisCacheService.CATEGORY_KEY_PREFIX + "children:" + parentId;
        Object cached = redisCacheService.get(cacheKey);
        if (cached != null) {
            return Result.success((List<SnackCategory>) cached);
        }

        List<SnackCategory> children = categoryMapper.selectList(new LambdaQueryWrapper<SnackCategory>()
                .eq(SnackCategory::getParentId, parentId)
                .eq(SnackCategory::getStatus, 1)
                .orderByAsc(SnackCategory::getSortOrder)
                .orderByDesc(SnackCategory::getPriority));

        redisCacheService.set(cacheKey, children, 2, TimeUnit.HOURS);
        return Result.success(children);
    }

    private void clearCategoryCache() {
        log.info("Clearing category cache...");
        redisCacheService.delete(RedisCacheService.CATEGORY_TREE_KEY);
        redisCacheService.deleteByPrefix(RedisCacheService.CATEGORY_KEY_PREFIX);
    }
}
