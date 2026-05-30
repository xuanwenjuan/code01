package com.aquascape.service;

import com.aquascape.dto.MaterialCategoryDTO;
import com.aquascape.entity.MaterialCategory;
import com.aquascape.exception.BusinessException;
import com.aquascape.mapper.MaterialCategoryMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class MaterialCategoryService {

    private static final String CATEGORY_TREE_CACHE_KEY = "category:tree";
    private static final String HOT_CATEGORY_CACHE_KEY = "category:hot";

    @Autowired
    private MaterialCategoryMapper categoryMapper;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @SuppressWarnings("unchecked")
    public List<MaterialCategory> treeList() {
        Object cacheObj = redisTemplate.opsForValue().get(CATEGORY_TREE_CACHE_KEY);
        if (cacheObj != null) {
            return (List<MaterialCategory>) cacheObj;
        }

        List<MaterialCategory> allCategories = categoryMapper.selectList(
                new LambdaQueryWrapper<MaterialCategory>().eq(MaterialCategory::getStatus, 1)
        );
        List<MaterialCategory> tree = buildTree(allCategories, 0L);
        redisTemplate.opsForValue().set(CATEGORY_TREE_CACHE_KEY, tree, 1, TimeUnit.HOURS);
        return tree;
    }

    @SuppressWarnings("unchecked")
    public List<MaterialCategory> getHotCategories() {
        Object cacheObj = redisTemplate.opsForValue().get(HOT_CATEGORY_CACHE_KEY);
        if (cacheObj != null) {
            return (List<MaterialCategory>) cacheObj;
        }

        List<MaterialCategory> hotCategories = categoryMapper.selectList(
                new LambdaQueryWrapper<MaterialCategory>()
                        .eq(MaterialCategory::getStatus, 1)
                        .eq(MaterialCategory::getLevel, 1)
                        .orderByAsc(MaterialCategory::getSort)
                        .last("limit 8")
        );
        redisTemplate.opsForValue().set(HOT_CATEGORY_CACHE_KEY, hotCategories, 30, TimeUnit.MINUTES);
        return hotCategories;
    }

    private List<MaterialCategory> buildTree(List<MaterialCategory> categories, Long parentId) {
        if (categories == null || categories.isEmpty()) {
            return new ArrayList<>();
        }

        Map<Long, List<MaterialCategory>> parentChildrenMap = categories.stream()
                .collect(Collectors.groupingBy(MaterialCategory::getParentId));

        for (MaterialCategory category : categories) {
            category.setChildren(parentChildrenMap.getOrDefault(category.getId(), new ArrayList<>()));
        }

        return parentChildrenMap.getOrDefault(parentId, new ArrayList<>());
    }

    public void create(MaterialCategoryDTO dto) {
        if (dto.getParentId() != null && dto.getParentId() != 0) {
            MaterialCategory parent = categoryMapper.selectById(dto.getParentId());
            if (parent == null) {
                throw new BusinessException("父类目不存在");
            }
            if (parent.getStatus() == 0) {
                throw new BusinessException("父类目已下架，无法新增子类目");
            }
        }

        MaterialCategory category = new MaterialCategory();
        BeanUtils.copyProperties(dto, category);
        if (dto.getParentId() == null || dto.getParentId() == 0) {
            category.setParentId(0L);
            category.setLevel(1);
        } else {
            MaterialCategory parent = categoryMapper.selectById(dto.getParentId());
            category.setLevel(parent.getLevel() + 1);
        }
        categoryMapper.insert(category);
        clearCategoryCache();
    }

    public void update(Long id, MaterialCategoryDTO dto) {
        MaterialCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("类目不存在");
        }

        if (dto.getParentId() != null && dto.getParentId() != 0) {
            if (dto.getParentId().equals(id)) {
                throw new BusinessException("不能将自己设为父类目");
            }
            MaterialCategory parent = categoryMapper.selectById(dto.getParentId());
            if (parent == null) {
                throw new BusinessException("父类目不存在");
            }
            if (parent.getStatus() == 0) {
                throw new BusinessException("父类目已下架");
            }
        }

        BeanUtils.copyProperties(dto, category, "id");
        categoryMapper.updateById(category);
        clearCategoryCache();
    }

    public void delete(Long id) {
        List<MaterialCategory> allCategories = categoryMapper.selectList(null);
        if (hasChildren(allCategories, id)) {
            throw new BusinessException("存在子类目，无法删除");
        }
        categoryMapper.deleteById(id);
        clearCategoryCache();
    }

    private boolean hasChildren(List<MaterialCategory> categories, Long parentId) {
        return categories.stream().anyMatch(c -> parentId.equals(c.getParentId()));
    }

    public void offline(Long id) {
        MaterialCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("类目不存在");
        }
        category.setStatus(0);
        categoryMapper.updateById(category);
        clearCategoryCache();
    }

    public void online(Long id) {
        MaterialCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("类目不存在");
        }
        if (category.getParentId() != 0) {
            MaterialCategory parent = categoryMapper.selectById(category.getParentId());
            if (parent != null && parent.getStatus() == 0) {
                throw new BusinessException("父类目已下架，请先上架父类目");
            }
        }
        category.setStatus(1);
        categoryMapper.updateById(category);
        clearCategoryCache();
    }

    public void validateCategoryAvailable(Long categoryId) {
        if (categoryId == null) {
            throw new BusinessException("类目ID不能为空");
        }
        MaterialCategory category = categoryMapper.selectById(categoryId);
        if (category == null) {
            throw new BusinessException("类目不存在");
        }
        if (category.getStatus() == 0) {
            throw new BusinessException("该类目已下架，无法录入素材");
        }
    }

    public MaterialCategory getById(Long id) {
        return categoryMapper.selectById(id);
    }

    public List<MaterialCategory> list() {
        return categoryMapper.selectList(null);
    }

    private void clearCategoryCache() {
        redisTemplate.delete(CATEGORY_TREE_CACHE_KEY);
        redisTemplate.delete(HOT_CATEGORY_CACHE_KEY);
    }
}
