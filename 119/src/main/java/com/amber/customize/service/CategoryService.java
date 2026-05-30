package com.amber.customize.service;

import com.amber.customize.entity.Category;
import com.amber.customize.enums.RoleEnum;
import com.amber.customize.mapper.CategoryMapper;
import com.amber.customize.util.BeanConvertUtil;
import com.amber.customize.util.UserContext;
import com.amber.customize.vo.CategoryVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService extends ServiceImpl<CategoryMapper, Category> {

    private static final String CATEGORY_TREE_KEY = "category:tree";
    private static final String HOT_CATEGORY_KEY = "category:hot";
    private final RedisTemplate<String, Object> redisTemplate;

    public List<CategoryVO> tree() {
        Object cached = redisTemplate.opsForValue().get(CATEGORY_TREE_KEY);
        if (cached != null) {
            return (List<CategoryVO>) cached;
        }
        List<Category> all = list(new LambdaQueryWrapper<Category>()
                .eq(Category::getStatus, 1)
                .orderByAsc(Category::getSort));
        List<CategoryVO> tree = buildTree(all.stream().map(this::convertToVO).toList(), 0L);
        redisTemplate.opsForValue().set(CATEGORY_TREE_KEY, tree, 1, TimeUnit.HOURS);
        return tree;
    }

    public List<CategoryVO> treeAll() {
        List<Category> all = list(new LambdaQueryWrapper<Category>()
                .orderByAsc(Category::getSort));
        return buildTree(all.stream().map(this::convertToVO).toList(), 0L);
    }

    private List<CategoryVO> buildTree(List<CategoryVO> all, Long parentId) {
        return all.stream()
                .filter(c -> parentId.equals(c.getParentId()))
                .peek(c -> c.setChildren(buildTree(all, c.getId())))
                .collect(Collectors.toList());
    }

    public List<CategoryVO> getHotCategories() {
        Object cached = redisTemplate.opsForValue().get(HOT_CATEGORY_KEY);
        if (cached != null) {
            return (List<CategoryVO>) cached;
        }
        List<Category> hotCategories = list(new LambdaQueryWrapper<Category>()
                .eq(Category::getStatus, 1)
                .eq(Category::getParentId, 0L)
                .orderByAsc(Category::getSort)
                .last("LIMIT 10"));
        List<CategoryVO> result = hotCategories.stream().map(this::convertToVO).toList();
        redisTemplate.opsForValue().set(HOT_CATEGORY_KEY, result, 30, TimeUnit.MINUTES);
        return result;
    }

    public List<CategoryVO> listByStatus(Integer status) {
        List<Category> list = list(new LambdaQueryWrapper<Category>()
                .eq(Category::getStatus, status)
                .orderByAsc(Category::getSort));
        return list.stream().map(this::convertToVO).toList();
    }

    public CategoryVO getDetail(Long id) {
        Category category = getById(id);
        if (category == null) {
            throw new RuntimeException("类目不存在");
        }
        return convertToVO(category);
    }

    @Transactional(rollbackFor = Exception.class)
    public void add(Category category) {
        if (category.getParentId() == null) {
            category.setParentId(0L);
        }
        save(category);
        clearCategoryCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(Category category) {
        updateById(category);
        clearCategoryCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        removeById(id);
        clearCategoryCache();
    }

    public boolean isCategoryEnabled(Long categoryId) {
        Category category = getById(categoryId);
        return category != null && category.getStatus() == 1;
    }

    private void clearCategoryCache() {
        redisTemplate.delete(CATEGORY_TREE_KEY);
        redisTemplate.delete(HOT_CATEGORY_KEY);
    }

    private CategoryVO convertToVO(Category category) {
        CategoryVO vo = BeanConvertUtil.convert(category, CategoryVO::new);
        if (category.getStatus() != null) {
            vo.setStatusDesc(category.getStatus() == 1 ? "上架" : "下架");
        }
        return vo;
    }

}
