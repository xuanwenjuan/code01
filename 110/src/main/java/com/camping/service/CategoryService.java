package com.camping.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.camping.annotation.RequiresRole;
import com.camping.entity.Category;
import com.camping.entity.GroupOrder;
import com.camping.enums.RoleEnum;
import com.camping.exception.BusinessException;
import com.camping.mapper.CategoryMapper;
import com.camping.mapper.GroupOrderMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService extends ServiceImpl<CategoryMapper, Category> {

    private final StringRedisTemplate stringRedisTemplate;
    private final GroupOrderMapper groupOrderMapper;

    private static final String CATEGORY_TREE_KEY = "category:tree:v2";
    private static final String CATEGORY_ALL_KEY = "category:all:v2";
    private final ObjectMapper objectMapper = createObjectMapper();

    private ObjectMapper createObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        return mapper;
    }

    public List<Category> tree() {
        try {
            String cacheStr = stringRedisTemplate.opsForValue().get(CATEGORY_TREE_KEY);
            if (cacheStr != null && !cacheStr.isEmpty()) {
                return objectMapper.readValue(cacheStr, new TypeReference<List<Category>>() {});
            }
        } catch (Exception e) {
            log.warn("读取类目缓存失败，使用数据库查询", e);
        }

        List<Category> allCategories = list(new LambdaQueryWrapper<Category>()
                .orderByAsc(Category::getSort));

        List<Category> tree = buildTreeWithLoop(allCategories);

        try {
            stringRedisTemplate.opsForValue().set(CATEGORY_TREE_KEY,
                    objectMapper.writeValueAsString(tree), 1, TimeUnit.HOURS);
        } catch (Exception e) {
            log.warn("写入类目缓存失败", e);
        }

        return tree;
    }

    private List<Category> buildTreeWithLoop(List<Category> categories) {
        if (categories == null || categories.isEmpty()) {
            return Collections.emptyList();
        }

        Map<Long, List<Category>> childrenMap = new HashMap<>();
        for (Category category : categories) {
            if (category.getParentId() == null) {
                category.setParentId(0L);
            }
            childrenMap.computeIfAbsent(category.getParentId(), k -> new ArrayList<>())
                    .add(category);
        }

        List<Category> rootCategories = childrenMap.getOrDefault(0L, new ArrayList<>());
        for (Category root : rootCategories) {
            buildChildren(root, childrenMap);
        }

        return rootCategories;
    }

    private void buildChildren(Category parent, Map<Long, List<Category>> childrenMap) {
        List<Category> children = childrenMap.getOrDefault(parent.getId(), new ArrayList<>());
        parent.setChildren(children);
        for (Category child : children) {
            buildChildren(child, childrenMap);
        }
    }

    @RequiresRole({RoleEnum.ADMIN, RoleEnum.OPERATION})
    public void addCategory(Category category) {
        if (category.getParentId() != null && category.getParentId() > 0) {
            Category parent = getById(category.getParentId());
            if (parent == null) {
                throw new BusinessException("父类目不存在");
            }
            if (parent.getStatus() == 0) {
                throw new BusinessException("父类目已下架，不允许添加子类目");
            }
        }
        category.setStatus(1);
        save(category);
        clearCache();
    }

    @RequiresRole({RoleEnum.ADMIN, RoleEnum.OPERATION})
    public void updateCategory(Category category) {
        Category exist = getById(category.getId());
        if (exist == null) {
            throw new BusinessException("类目不存在");
        }

        if (category.getStatus() != null && category.getStatus() == 0) {
            checkCategoryBindOrder(category.getId());
        }

        if (category.getParentId() != null && !category.getParentId().equals(exist.getParentId())) {
            if (category.getParentId() > 0) {
                Category newParent = getById(category.getParentId());
                if (newParent == null || newParent.getStatus() == 0) {
                    throw new BusinessException("目标父类目不存在或已下架");
                }
            }
        }

        updateById(category);
        clearCache();
    }

    @RequiresRole({RoleEnum.ADMIN, RoleEnum.OPERATION})
    public void deleteCategory(Long id) {
        long childCount = count(new LambdaQueryWrapper<Category>()
                .eq(Category::getParentId, id));
        if (childCount > 0) {
            throw new BusinessException("存在子类目，无法删除");
        }

        checkCategoryBindOrder(id);
        removeById(id);
        clearCache();
    }

    @RequiresRole({RoleEnum.ADMIN, RoleEnum.OPERATION})
    public void offlineCategory(Long id) {
        checkCategoryBindOrder(id);

        List<Long> allChildrenIds = getAllChildrenIds(id);
        for (Long childId : allChildrenIds) {
            checkCategoryBindOrder(childId);
        }

        Category update = new Category();
        update.setId(id);
        update.setStatus(0);
        updateById(update);

        for (Long childId : allChildrenIds) {
            Category childUpdate = new Category();
            childUpdate.setId(childId);
            childUpdate.setStatus(0);
            updateById(childUpdate);
        }

        clearCache();
    }

    private void checkCategoryBindOrder(Long categoryId) {
        long orderCount = groupOrderMapper.selectCount(new LambdaQueryWrapper<GroupOrder>()
                .eq(GroupOrder::getCategoryId, categoryId)
                .in(GroupOrder::getStatus, Arrays.asList(1, 2, 3, 4, 7)));
        if (orderCount > 0) {
            throw new BusinessException("该类目下存在进行中的订单，无法操作");
        }
    }

    private List<Long> getAllChildrenIds(Long parentId) {
        List<Long> result = new ArrayList<>();
        List<Category> allCategories = list();
        collectChildrenIds(allCategories, parentId, result);
        return result;
    }

    private void collectChildrenIds(List<Category> categories, Long parentId, List<Long> result) {
        for (Category category : categories) {
            if (parentId.equals(category.getParentId())) {
                result.add(category.getId());
                collectChildrenIds(categories, category.getId(), result);
            }
        }
    }

    private void clearCache() {
        try {
            stringRedisTemplate.delete(Arrays.asList(CATEGORY_TREE_KEY, CATEGORY_ALL_KEY));
        } catch (Exception e) {
            log.warn("清除类目缓存失败", e);
        }
    }

    public List<Category> getAvailableCategories() {
        return list(new LambdaQueryWrapper<Category>()
                .eq(Category::getStatus, 1)
                .orderByAsc(Category::getSort));
    }
}
