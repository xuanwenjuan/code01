package com.zongshi.brush.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zongshi.brush.dto.BrushCategoryDTO;
import com.zongshi.brush.entity.BrushCategory;
import com.zongshi.brush.exception.BusinessException;
import com.zongshi.brush.mapper.BrushCategoryMapper;
import com.zongshi.brush.service.BrushCategoryService;
import com.zongshi.brush.vo.BrushCategoryTreeVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BrushCategoryServiceImpl extends ServiceImpl<BrushCategoryMapper, BrushCategory> implements BrushCategoryService {

    private static final List<String> VALID_BRUSH_TYPES = Arrays.asList("狼毫笔", "羊毫笔", "兼毫笔", "工艺收藏笔");
    private static final String HOT_CATEGORY_KEY = "brush:hot:category";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long addCategory(BrushCategoryDTO dto) {
        validateCategoryData(dto);

        LambdaQueryWrapper<BrushCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BrushCategory::getCategoryCode, dto.getCategoryCode());
        wrapper.eq(BrushCategory::getIsDeleted, 0);
        Long count = this.baseMapper.selectCount(wrapper);
        if (count > 0) {
            throw new BusinessException("类目编码已存在");
        }

        if (dto.getParentId() != null && dto.getParentId() != 0) {
            BrushCategory parent = this.baseMapper.selectById(dto.getParentId());
            if (parent == null || parent.getIsDeleted() == 1) {
                throw new BusinessException("父类目不存在");
            }
            if (parent.getStatus() == 0) {
                throw new BusinessException("父类目已下架，不能新增子类目");
            }
        }

        BrushCategory category = new BrushCategory();
        BeanUtils.copyProperties(dto, category);
        if (category.getSortOrder() == null) {
            category.setSortOrder(0);
        }
        if (category.getStatus() == null) {
            category.setStatus(1);
        }
        this.baseMapper.insert(category);
        return category.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateCategory(BrushCategoryDTO dto) {
        if (dto.getId() == null) {
            throw new BusinessException("类目ID不能为空");
        }
        validateCategoryData(dto);

        BrushCategory exist = this.baseMapper.selectById(dto.getId());
        if (exist == null || exist.getIsDeleted() == 1) {
            throw new BusinessException("类目不存在");
        }

        LambdaQueryWrapper<BrushCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BrushCategory::getCategoryCode, dto.getCategoryCode());
        wrapper.eq(BrushCategory::getIsDeleted, 0);
        wrapper.ne(BrushCategory::getId, dto.getId());
        Long count = this.baseMapper.selectCount(wrapper);
        if (count > 0) {
            throw new BusinessException("类目编码已存在");
        }

        if (dto.getParentId() != null && !dto.getParentId().equals(exist.getParentId())) {
            if (dto.getParentId().equals(dto.getId())) {
                throw new BusinessException("不能将自己设置为父类目");
            }
            List<BrushCategory> children = getChildrenById(dto.getId());
            if (children.stream().anyMatch(c -> c.getId().equals(dto.getParentId()))) {
                throw new BusinessException("不能将子类目设置为父类目");
            }
        }

        BrushCategory category = new BrushCategory();
        BeanUtils.copyProperties(dto, category);
        this.baseMapper.updateById(category);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteCategory(Long id) {
        BrushCategory category = this.baseMapper.selectById(id);
        if (category == null || category.getIsDeleted() == 1) {
            throw new BusinessException("类目不存在");
        }

        List<BrushCategory> children = getChildrenById(id);
        if (!CollectionUtils.isEmpty(children)) {
            throw new BusinessException("存在子类目，不能删除");
        }

        this.baseMapper.deleteById(id);
    }

    @Override
    public BrushCategory getCategoryById(Long id) {
        BrushCategory category = this.baseMapper.selectById(id);
        if (category == null || category.getIsDeleted() == 1) {
            throw new BusinessException("类目不存在");
        }
        return category;
    }

    @Override
    public List<BrushCategoryTreeVO> getCategoryTree(Integer status) {
        List<BrushCategory> allCategories = this.baseMapper.selectCategoryTree(null, status);
        return buildTree(allCategories, 0L);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void offlineCategory(Long id) {
        BrushCategory category = this.baseMapper.selectById(id);
        if (category == null || category.getIsDeleted() == 1) {
            throw new BusinessException("类目不存在");
        }

        List<BrushCategory> children = getChildrenById(id);
        for (BrushCategory child : children) {
            child.setStatus(0);
            this.baseMapper.updateById(child);
        }

        category.setStatus(0);
        this.baseMapper.updateById(category);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateSort(List<BrushCategoryDTO> list) {
        if (CollectionUtils.isEmpty(list)) {
            return;
        }
        for (BrushCategoryDTO dto : list) {
            if (dto.getId() == null || dto.getSortOrder() == null) {
                continue;
            }
            BrushCategory category = new BrushCategory();
            category.setId(dto.getId());
            category.setSortOrder(dto.getSortOrder());
            this.baseMapper.updateById(category);
        }
    }

    @Override
    public List<BrushCategory> getChildrenById(Long id) {
        return this.baseMapper.selectChildrenById(id);
    }

    @Override
    public List<BrushCategory> getHotCategories() {
        try {
            String cacheValue = redisTemplate.opsForValue().get(HOT_CATEGORY_KEY);
            if (StringUtils.hasText(cacheValue)) {
                return objectMapper.readValue(cacheValue, new TypeReference<List<BrushCategory>>() {});
            }
        } catch (Exception e) {
            log.warn("从Redis获取热门分类失败，从数据库查询", e);
        }

        LambdaQueryWrapper<BrushCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BrushCategory::getStatus, 1);
        wrapper.eq(BrushCategory::getIsDeleted, 0);
        wrapper.orderByDesc(BrushCategory::getViewCount);
        wrapper.last("LIMIT 10");
        List<BrushCategory> categories = this.baseMapper.selectList(wrapper);

        try {
            String cacheValue = objectMapper.writeValueAsString(categories);
            redisTemplate.opsForValue().set(HOT_CATEGORY_KEY, cacheValue, 1, TimeUnit.HOURS);
        } catch (Exception e) {
            log.warn("缓存热门分类失败", e);
        }

        return categories;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void incrementViewCount(Long id) {
        BrushCategory category = getCategoryById(id);
        category.setViewCount(category.getViewCount() + 1);
        this.baseMapper.updateById(category);

        try {
            redisTemplate.delete(HOT_CATEGORY_KEY);
        } catch (Exception e) {
            log.warn("删除热门分类缓存失败", e);
        }
    }

    private List<BrushCategoryTreeVO> buildTree(List<BrushCategory> categories, Long parentId) {
        return categories.stream()
                .filter(c -> c.getParentId().equals(parentId))
                .map(c -> {
                    BrushCategoryTreeVO vo = new BrushCategoryTreeVO();
                    BeanUtils.copyProperties(c, vo);
                    vo.setChildren(buildTree(categories, c.getId()));
                    return vo;
                })
                .collect(Collectors.toList());
    }

    private void validateCategoryData(BrushCategoryDTO dto) {
        if (dto.getCategoryType() == null || dto.getCategoryType() < 1 || dto.getCategoryType() > 4) {
            throw new BusinessException("类目类型不正确，范围：1-4");
        }

        if (StringUtils.hasText(dto.getBrushType()) && !VALID_BRUSH_TYPES.contains(dto.getBrushType())) {
            throw new BusinessException("毛笔类型不正确，只能是：狼毫笔、羊毫笔、兼毫笔、工艺收藏笔");
        }

        if (dto.getCategoryType() >= 3 && !StringUtils.hasText(dto.getBrushType())) {
            throw new BusinessException("笔型和尺寸规格类目必须指定毛笔类型");
        }

        if (dto.getCategoryType() == 4 && !StringUtils.hasText(dto.getCraftType())) {
            throw new BusinessException("尺寸规格类目必须指定工艺类型");
        }
    }
}
