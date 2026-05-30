package com.oiledumbrella.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.oiledumbrella.entity.UmbrellaCategory;
import com.oiledumbrella.entity.UmbrellaStyle;
import com.oiledumbrella.exception.BusinessException;
import com.oiledumbrella.mapper.UmbrellaCategoryMapper;
import com.oiledumbrella.mapper.UmbrellaStyleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UmbrellaStyleService {

    private final UmbrellaStyleMapper styleMapper;
    private final UmbrellaCategoryMapper categoryMapper;
    private final CacheService cacheService;

    public Page<UmbrellaStyle> page(Integer pageNum, Integer pageSize, Long categoryId, String keyword) {
        Page<UmbrellaStyle> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<UmbrellaStyle> wrapper = new LambdaQueryWrapper<>();
        if (categoryId != null) {
            wrapper.eq(UmbrellaStyle::getCategoryId, categoryId);
        }
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(UmbrellaStyle::getStyleName, keyword)
                    .or().like(UmbrellaStyle::getStyleCode, keyword));
        }
        wrapper.orderByDesc(UmbrellaStyle::getSortOrder)
                .orderByDesc(UmbrellaStyle::getCreateTime);
        return styleMapper.selectPage(page, wrapper);
    }

    public List<UmbrellaStyle> getHotStyles() {
        List<UmbrellaStyle> cached = cacheService.getHotStylesFromCache();
        if (cached != null) {
            return cached;
        }

        List<UmbrellaStyle> styles = styleMapper.selectList(
                new LambdaQueryWrapper<UmbrellaStyle>()
                        .eq(UmbrellaStyle::getStatus, 1)
                        .orderByDesc(UmbrellaStyle::getOrderCount)
                        .orderByDesc(UmbrellaStyle::getViewCount)
                        .last("LIMIT 20")
        );

        cacheService.cacheHotStyles(styles);
        return styles;
    }

    @Transactional
    public void add(UmbrellaStyle style) {
        UmbrellaStyle exist = styleMapper.selectOne(
                new LambdaQueryWrapper<UmbrellaStyle>()
                        .eq(UmbrellaStyle::getStyleCode, style.getStyleCode())
        );
        if (exist != null) {
            throw new BusinessException("款式编码已存在");
        }

        UmbrellaCategory category = categoryMapper.selectById(style.getCategoryId());
        if (category == null || category.getStatus() == 0) {
            throw new BusinessException("所属分类不存在或已下架");
        }

        if (style.getViewCount() == null) style.setViewCount(0);
        if (style.getOrderCount() == null) style.setOrderCount(0);

        styleMapper.insert(style);
        cacheService.evictHotStyleCache();
    }

    @Transactional
    public void update(UmbrellaStyle style) {
        UmbrellaStyle exist = styleMapper.selectById(style.getId());
        if (exist == null) {
            throw new BusinessException("款式不存在");
        }
        styleMapper.updateById(style);
        cacheService.evictHotStyleCache();
    }

    @Transactional
    public void delete(Long id) {
        styleMapper.deleteById(id);
        cacheService.evictHotStyleCache();
    }

    @Transactional
    public void offShelve(Long id) {
        UmbrellaStyle style = new UmbrellaStyle();
        style.setId(id);
        style.setStatus(0);
        styleMapper.updateById(style);
        cacheService.evictHotStyleCache();
    }

    public UmbrellaStyle getById(Long id) {
        UmbrellaStyle style = styleMapper.selectById(id);
        if (style != null) {
            style.setViewCount(style.getViewCount() + 1);
            styleMapper.updateById(style);
        }
        return style;
    }

    public void validateStyleAvailable(Long styleId) {
        UmbrellaStyle style = styleMapper.selectById(styleId);
        if (style == null) {
            throw new BusinessException("伞品款式不存在");
        }
        if (style.getStatus() == 0) {
            throw new BusinessException("该伞品款式已下架，无法创建订单");
        }

        UmbrellaCategory category = categoryMapper.selectById(style.getCategoryId());
        if (category == null || category.getStatus() == 0) {
            throw new BusinessException("该伞品所属分类已下架，无法创建订单");
        }
    }

    @Transactional
    public void incrementOrderCount(Long styleId) {
        UmbrellaStyle style = styleMapper.selectById(styleId);
        if (style != null) {
            style.setOrderCount(style.getOrderCount() + 1);
            styleMapper.updateById(style);
            cacheService.evictHotStyleCache();
        }
    }
}
