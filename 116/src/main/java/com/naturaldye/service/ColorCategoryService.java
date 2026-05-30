package com.naturaldye.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.naturaldye.annotation.OperationLog;
import com.naturaldye.common.BusinessException;
import com.naturaldye.dto.CategoryTreeDTO;
import com.naturaldye.entity.ColorCategory;
import com.naturaldye.enums.CategoryStatusEnum;
import com.naturaldye.mapper.ColorCategoryMapper;
import com.naturaldye.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ColorCategoryService {

    private final ColorCategoryMapper colorCategoryMapper;
    private final RedisUtil redisUtil;
    private final ObjectMapper objectMapper;

    private static final String CATEGORY_TREE_KEY = "category:tree";
    private static final String CATEGORY_ACTIVE_TREE_KEY = "category:active:tree";
    private static final String CATEGORY_HOT_KEY = "category:hot";
    private static final String CATEGORY_CACHE_KEY = "category:";

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "类目管理", operation = "新增类目", description = "新增色系类目")
    public void addCategory(ColorCategory category) {
        if (category.getParentId() != null && category.getParentId() != 0) {
            ColorCategory parent = colorCategoryMapper.selectById(category.getParentId());
            if (parent == null) {
                throw new BusinessException("父类目不存在");
            }
        }
        category.setStatus(CategoryStatusEnum.ACTIVE.getCode());
        colorCategoryMapper.insert(category);
        clearCategoryCache();
        log.info("新增类目成功: {}", category.getCategoryName());
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "类目管理", operation = "更新类目", description = "更新色系类目信息")
    public void updateCategory(ColorCategory category) {
        ColorCategory exist = colorCategoryMapper.selectById(category.getId());
        if (exist == null) {
            throw new BusinessException("类目不存在");
        }
        colorCategoryMapper.updateById(category);
        clearCategoryCache();
        clearCategoryCache(category.getId());
        log.info("更新类目成功: {}", category.getCategoryName());
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "类目管理", operation = "删除类目", description = "删除色系类目")
    public void deleteCategory(Long id) {
        LambdaQueryWrapper<ColorCategory> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(ColorCategory::getParentId, id);
        Long count = colorCategoryMapper.selectCount(queryWrapper);
        if (count > 0) {
            throw new BusinessException("存在子类目，无法删除");
        }
        colorCategoryMapper.deleteById(id);
        clearCategoryCache();
        clearCategoryCache(id);
        redisUtil.zRemove(CATEGORY_HOT_KEY, id.toString());
        log.info("删除类目成功: {}", id);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "类目管理", operation = "下架类目", description = "下架色系类目")
    public void discontinueCategory(Long id) {
        ColorCategory category = new ColorCategory();
        category.setId(id);
        category.setStatus(CategoryStatusEnum.DISCONTINUED.getCode());
        colorCategoryMapper.updateById(category);
        clearCategoryCache();
        clearCategoryCache(id);
        log.info("下架类目成功: {}", id);
    }

    public boolean isCategoryActive(Long id) {
        ColorCategory category = getCategoryById(id);
        if (category == null) {
            return false;
        }
        return CategoryStatusEnum.ACTIVE.getCode().equals(category.getStatus());
    }

    @SuppressWarnings("unchecked")
    public List<CategoryTreeDTO> getCategoryTree() {
        try {
            Object cacheData = redisUtil.get(CATEGORY_TREE_KEY);
            if (cacheData != null) {
                return objectMapper.convertValue(cacheData,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, CategoryTreeDTO.class));
            }
        } catch (Exception e) {
            log.warn("获取类目树缓存失败，从数据库查询", e);
        }

        LambdaQueryWrapper<ColorCategory> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.orderByAsc(ColorCategory::getSortOrder);
        List<ColorCategory> allCategories = colorCategoryMapper.selectList(queryWrapper);
        List<CategoryTreeDTO> tree = buildTreeDTO(allCategories);

        try {
            redisUtil.set(CATEGORY_TREE_KEY, tree, 1, TimeUnit.HOURS);
        } catch (Exception e) {
            log.warn("类目树缓存写入失败", e);
        }

        return tree;
    }

    @SuppressWarnings("unchecked")
    public List<CategoryTreeDTO> getActiveCategoryTree() {
        try {
            Object cacheData = redisUtil.get(CATEGORY_ACTIVE_TREE_KEY);
            if (cacheData != null) {
                return objectMapper.convertValue(cacheData,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, CategoryTreeDTO.class));
            }
        } catch (Exception e) {
            log.warn("获取活跃类目树缓存失败，从数据库查询", e);
        }

        LambdaQueryWrapper<ColorCategory> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(ColorCategory::getStatus, CategoryStatusEnum.ACTIVE.getCode());
        queryWrapper.orderByAsc(ColorCategory::getSortOrder);
        List<ColorCategory> allCategories = colorCategoryMapper.selectList(queryWrapper);
        List<CategoryTreeDTO> tree = buildTreeDTO(allCategories);

        try {
            redisUtil.set(CATEGORY_ACTIVE_TREE_KEY, tree, 1, TimeUnit.HOURS);
        } catch (Exception e) {
            log.warn("活跃类目树缓存写入失败", e);
        }

        return tree;
    }

    private List<CategoryTreeDTO> buildTreeDTO(List<ColorCategory> allCategories) {
        Map<Long, CategoryTreeDTO> categoryMap = new HashMap<>();
        List<CategoryTreeDTO> roots = new ArrayList<>();

        for (ColorCategory category : allCategories) {
            CategoryTreeDTO dto = new CategoryTreeDTO();
            BeanUtils.copyProperties(category, dto);
            categoryMap.put(category.getId(), dto);
        }

        for (CategoryTreeDTO dto : categoryMap.values()) {
            Long parentId = dto.getParentId();
            if (parentId == null || parentId == 0) {
                roots.add(dto);
            } else {
                CategoryTreeDTO parent = categoryMap.get(parentId);
                if (parent != null) {
                    if (parent.getChildren() == null) {
                        parent.setChildren(new ArrayList<>());
                    }
                    parent.getChildren().add(dto);
                }
            }
        }

        return roots;
    }

    public ColorCategory getCategoryById(Long id) {
        String cacheKey = CATEGORY_CACHE_KEY + id;
        try {
            Object cacheData = redisUtil.get(cacheKey);
            if (cacheData != null) {
                return objectMapper.convertValue(cacheData, ColorCategory.class);
            }
        } catch (Exception e) {
            log.warn("获取类目缓存失败: {}", e.getMessage());
        }

        ColorCategory category = colorCategoryMapper.selectById(id);
        if (category != null) {
            try {
                redisUtil.set(cacheKey, category, 30, TimeUnit.MINUTES);
            } catch (Exception e) {
                log.warn("类目缓存写入失败: {}", e.getMessage());
            }
        }
        return category;
    }

    public void incrementCategoryUsage(Long categoryId) {
        try {
            redisUtil.zIncrement(CATEGORY_HOT_KEY, categoryId.toString(), 1);
        } catch (Exception e) {
            log.warn("热门类目计数失败: {}", e.getMessage());
        }
    }

    public List<ColorCategory> getHotCategories(int topN) {
        List<ColorCategory> result = new ArrayList<>();
        try {
            Set<Object> hotIds = redisUtil.zReverseRange(CATEGORY_HOT_KEY, 0, topN - 1);
            if (hotIds != null && !hotIds.isEmpty()) {
                for (Object idObj : hotIds) {
                    Long id = Long.parseLong(idObj.toString());
                    ColorCategory category = getCategoryById(id);
                    if (category != null && CategoryStatusEnum.ACTIVE.getCode().equals(category.getStatus())) {
                        result.add(category);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("获取热门类目失败: {}", e.getMessage());
        }

        if (result.isEmpty()) {
            LambdaQueryWrapper<ColorCategory> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(ColorCategory::getStatus, CategoryStatusEnum.ACTIVE.getCode())
                    .orderByDesc(ColorCategory::getSortOrder)
                    .last("LIMIT " + topN);
            result = colorCategoryMapper.selectList(queryWrapper);
        }

        return result;
    }

    private void clearCategoryCache() {
        try {
            List<String> keys = new ArrayList<>();
            keys.add(CATEGORY_TREE_KEY);
            keys.add(CATEGORY_ACTIVE_TREE_KEY);
            redisUtil.delete(keys);
        } catch (Exception e) {
            log.warn("清除类目缓存失败: {}", e.getMessage());
        }
    }

    private void clearCategoryCache(Long id) {
        try {
            if (id != null) {
                redisUtil.delete(CATEGORY_CACHE_KEY + id);
            }
        } catch (Exception e) {
            log.warn("清除类目缓存失败: {}", e.getMessage());
        }
    }
}
