package com.ancientpaper.service;

import com.ancientpaper.dto.CategoryDTO;
import com.ancientpaper.entity.PaperCategory;
import com.ancientpaper.exception.BusinessException;
import com.ancientpaper.mapper.PaperCategoryMapper;
import com.ancientpaper.vo.CategoryTreeVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaperCategoryService {

    private final PaperCategoryMapper categoryMapper;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String CATEGORY_TREE_KEY = "paper:category:tree";
    private static final String HOT_CATEGORY_KEY = "paper:category:hot";
    private static final long CACHE_EXPIRE_HOUR = 1;
    private static final long HOT_CACHE_EXPIRE_MINUTE = 30;

    public List<CategoryTreeVO> getCategoryTree() {
        try {
            Object cached = redisTemplate.opsForValue().get(CATEGORY_TREE_KEY);
            if (cached != null) {
                log.debug("从Redis获取分类树缓存");
                return objectMapper.convertValue(cached, new TypeReference<List<CategoryTreeVO>>() {});
            }
        } catch (Exception e) {
            log.warn("获取Redis分类树缓存失败:{}", e.getMessage());
        }

        List<PaperCategory> allCategories = categoryMapper.selectList(new LambdaQueryWrapper<PaperCategory>()
                .eq(PaperCategory::getStatus, 1)
                .orderByAsc(PaperCategory::getSortOrder, PaperCategory::getId));

        List<CategoryTreeVO> tree = buildTreeStream(allCategories, 0L);

        try {
            redisTemplate.opsForValue().set(CATEGORY_TREE_KEY, tree, CACHE_EXPIRE_HOUR, TimeUnit.HOURS);
        } catch (Exception e) {
            log.warn("设置Redis分类树缓存失败:{}", e.getMessage());
        }

        return tree;
    }

    private List<CategoryTreeVO> buildTreeStream(List<PaperCategory> categories, Long parentId) {
        Map<Long, List<PaperCategory>> groupByParent = categories.stream()
                .collect(Collectors.groupingBy(PaperCategory::getParentId));

        return buildTreeRecursive(groupByParent, parentId);
    }

    private List<CategoryTreeVO> buildTreeRecursive(Map<Long, List<PaperCategory>> groupByParent, Long parentId) {
        List<PaperCategory> children = groupByParent.get(parentId);
        if (children == null || children.isEmpty()) {
            return new ArrayList<>();
        }

        return children.stream()
                .map(category -> {
                    CategoryTreeVO vo = new CategoryTreeVO();
                    BeanUtils.copyProperties(category, vo);
                    List<CategoryTreeVO> childList = buildTreeRecursive(groupByParent, category.getId());
                    if (!childList.isEmpty()) {
                        vo.setChildren(childList);
                    }
                    return vo;
                })
                .collect(Collectors.toList());
    }

    public List<CategoryTreeVO> getHotCategories() {
        try {
            Object cached = redisTemplate.opsForValue().get(HOT_CATEGORY_KEY);
            if (cached != null) {
                log.debug("从Redis获取热门分类缓存");
                return objectMapper.convertValue(cached, new TypeReference<List<CategoryTreeVO>>() {});
            }
        } catch (Exception e) {
            log.warn("获取Redis热门分类缓存失败:{}", e.getMessage());
        }

        List<PaperCategory> hotCategories = categoryMapper.selectList(new LambdaQueryWrapper<PaperCategory>()
                .eq(PaperCategory::getStatus, 1)
                .eq(PaperCategory::getLevel, 1)
                .orderByAsc(PaperCategory::getSortOrder)
                .last("LIMIT 10"));

        List<CategoryTreeVO> result = hotCategories.stream()
                .map(category -> {
                    CategoryTreeVO vo = new CategoryTreeVO();
                    BeanUtils.copyProperties(category, vo);
                    return vo;
                })
                .collect(Collectors.toList());

        try {
            redisTemplate.opsForValue().set(HOT_CATEGORY_KEY, result, HOT_CACHE_EXPIRE_MINUTE, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.warn("设置Redis热门分类缓存失败:{}", e.getMessage());
        }

        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    public void addCategory(CategoryDTO dto) {
        PaperCategory existCode = categoryMapper.selectOne(new LambdaQueryWrapper<PaperCategory>()
                .eq(PaperCategory::getCategoryCode, dto.getCategoryCode()));
        if (existCode != null) {
            throw new BusinessException("分类编码已存在");
        }
        PaperCategory category = new PaperCategory();
        BeanUtils.copyProperties(dto, category);
        if (dto.getParentId() == null || dto.getParentId() == 0) {
            category.setParentId(0L);
            category.setLevel(1);
        } else {
            PaperCategory parent = categoryMapper.selectById(dto.getParentId());
            if (parent == null) {
                throw new BusinessException("父分类不存在");
            }
            category.setLevel(parent.getLevel() + 1);
        }
        categoryMapper.insert(category);
        clearCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateCategory(CategoryDTO dto) {
        PaperCategory category = categoryMapper.selectById(dto.getId());
        if (category == null) {
            throw new BusinessException("分类不存在");
        }
        if (!category.getCategoryCode().equals(dto.getCategoryCode())) {
            PaperCategory existCode = categoryMapper.selectOne(new LambdaQueryWrapper<PaperCategory>()
                    .eq(PaperCategory::getCategoryCode, dto.getCategoryCode()));
            if (existCode != null) {
                throw new BusinessException("分类编码已存在");
            }
        }
        BeanUtils.copyProperties(dto, category);
        if (dto.getParentId() != null && !dto.getParentId().equals(category.getParentId())) {
            if (dto.getParentId() == 0) {
                category.setLevel(1);
            } else {
                PaperCategory parent = categoryMapper.selectById(dto.getParentId());
                if (parent == null) {
                    throw new BusinessException("父分类不存在");
                }
                category.setLevel(parent.getLevel() + 1);
            }
        }
        categoryMapper.updateById(category);
        clearCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteCategory(Long id) {
        PaperCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }
        Long childCount = categoryMapper.selectCount(new LambdaQueryWrapper<PaperCategory>()
                .eq(PaperCategory::getParentId, id));
        if (childCount > 0) {
            throw new BusinessException("存在子分类，无法删除");
        }
        categoryMapper.deleteById(id);
        clearCache();
    }

    public List<PaperCategory> getChildCategories(Long parentId) {
        return categoryMapper.selectList(new LambdaQueryWrapper<PaperCategory>()
                .eq(PaperCategory::getParentId, parentId)
                .eq(PaperCategory::getStatus, 1)
                .orderByAsc(PaperCategory::getSortOrder));
    }

    private void clearCache() {
        try {
            redisTemplate.delete(CATEGORY_TREE_KEY);
            redisTemplate.delete(HOT_CATEGORY_KEY);
            log.info("分类缓存已清除");
        } catch (Exception e) {
            log.warn("清除Redis分类缓存失败:{}", e.getMessage());
        }
    }
}
