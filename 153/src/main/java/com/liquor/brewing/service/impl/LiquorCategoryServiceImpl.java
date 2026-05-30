package com.liquor.brewing.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.liquor.brewing.common.Constants;
import com.liquor.brewing.entity.LiquorCategory;
import com.liquor.brewing.exception.BusinessException;
import com.liquor.brewing.mapper.LiquorCategoryMapper;
import com.liquor.brewing.service.LiquorCategoryService;
import com.liquor.brewing.util.CodeGenerator;
import com.liquor.brewing.util.RedisUtil;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class LiquorCategoryServiceImpl extends ServiceImpl<LiquorCategoryMapper, LiquorCategory> implements LiquorCategoryService {

    private static final String CATEGORY_TREE_CACHE_KEY = "category:tree";
    private static final long CACHE_EXPIRE_HOURS = 24;

    @Resource
    private CodeGenerator codeGenerator;

    @Resource
    private RedisUtil redisUtil;

    @Override
    @SuppressWarnings("unchecked")
    public List<LiquorCategory> tree() {
        try {
            Object cacheData = redisUtil.get(CATEGORY_TREE_CACHE_KEY);
            if (cacheData != null) {
                log.debug("从Redis缓存获取分类树数据");
                return (List<LiquorCategory>) cacheData;
            }
        } catch (Exception e) {
            log.warn("Redis缓存读取失败，直接从数据库查询：{}", e.getMessage());
        }

        List<LiquorCategory> all = list(new LambdaQueryWrapper<LiquorCategory>()
                .eq(LiquorCategory::getStatus, Constants.Status.ENABLE)
                .orderByAsc(LiquorCategory::getSortOrder));
        List<LiquorCategory> tree = buildTree(all, Constants.ROOT_PARENT_ID);

        try {
            redisUtil.set(CATEGORY_TREE_CACHE_KEY, tree, CACHE_EXPIRE_HOURS, TimeUnit.HOURS);
            log.debug("分类树数据已写入Redis缓存");
        } catch (Exception e) {
            log.warn("Redis缓存写入失败：{}", e.getMessage());
        }

        return tree;
    }

    private void clearCache() {
        try {
            redisUtil.delete(CATEGORY_TREE_CACHE_KEY);
            log.debug("分类树缓存已清除");
        } catch (Exception e) {
            log.warn("清除Redis缓存失败：{}", e.getMessage());
        }
    }

    private List<LiquorCategory> buildTree(List<LiquorCategory> all, Long parentId) {
        List<LiquorCategory> tree = new ArrayList<>();
        for (LiquorCategory category : all) {
            if (parentId.equals(category.getParentId())) {
                category.setChildren(buildTree(all, category.getId()));
                tree.add(category);
            }
        }
        return tree;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void add(LiquorCategory category) {
        category.setCategoryCode(codeGenerator.generateCategoryCode());
        if (category.getParentId() == null || category.getParentId() == 0) {
            category.setParentId(0L);
            category.setLevel(1);
            category.setTreePath(",0,");
        } else {
            LiquorCategory parent = getById(category.getParentId());
            if (parent == null) {
                throw new BusinessException("父分类不存在");
            }
            category.setLevel(parent.getLevel() + 1);
            category.setTreePath(parent.getTreePath() + category.getParentId() + ",");
        }
        category.setStatus(Constants.Status.ENABLE);
        save(category);
        clearCache();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(LiquorCategory category) {
        LiquorCategory exist = getById(category.getId());
        if (exist == null) {
            throw new BusinessException("分类不存在");
        }
        updateById(category);
        clearCache();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        Long count = count(new LambdaQueryWrapper<LiquorCategory>().eq(LiquorCategory::getParentId, id));
        if (count > 0) {
            throw new BusinessException("存在子分类，无法删除");
        }
        removeById(id);
        clearCache();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateStatus(Long id, Integer status) {
        LiquorCategory category = new LiquorCategory();
        category.setId(id);
        category.setStatus(status);
        updateById(category);
        clearCache();
    }
}
