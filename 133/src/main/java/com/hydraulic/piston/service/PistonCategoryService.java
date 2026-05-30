package com.hydraulic.piston.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hydraulic.piston.dto.PistonCategoryDTO;
import com.hydraulic.piston.entity.PistonCategory;
import com.hydraulic.piston.exception.BusinessException;
import com.hydraulic.piston.mapper.PistonCategoryMapper;
import com.hydraulic.piston.vo.PistonCategoryVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PistonCategoryService {

    private final PistonCategoryMapper categoryMapper;

    public Page<PistonCategoryVO> getPage(Integer pageNum, Integer pageSize, String categoryName, Integer status) {
        Page<PistonCategory> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<PistonCategory> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(categoryName)) {
            wrapper.like(PistonCategory::getCategoryName, categoryName);
        }
        if (status != null) {
            wrapper.eq(PistonCategory::getStatus, status);
        }
        wrapper.orderByAsc(PistonCategory::getSort)
               .orderByDesc(PistonCategory::getCreateTime);

        Page<PistonCategory> resultPage = categoryMapper.selectPage(page, wrapper);

        List<PistonCategoryVO> voList = resultPage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        Page<PistonCategoryVO> voPage = new Page<>(resultPage.getCurrent(), resultPage.getSize(), resultPage.getTotal());
        voPage.setRecords(voList);
        return voPage;
    }

    public List<PistonCategoryVO> getList(String categoryName, Integer status) {
        LambdaQueryWrapper<PistonCategory> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(categoryName)) {
            wrapper.like(PistonCategory::getCategoryName, categoryName);
        }
        if (status != null) {
            wrapper.eq(PistonCategory::getStatus, status);
        }
        wrapper.orderByAsc(PistonCategory::getSort)
               .orderByDesc(PistonCategory::getCreateTime);

        List<PistonCategory> list = categoryMapper.selectList(wrapper);
        return list.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Cacheable(value = "pistonCategory", key = "'tree'")
    public List<PistonCategoryVO> getTree() {
        List<PistonCategory> allCategories = categoryMapper.selectList(
                new LambdaQueryWrapper<PistonCategory>()
                        .orderByAsc(PistonCategory::getSort)
        );

        List<PistonCategoryVO> allVOs = allCategories.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        List<PistonCategoryVO> rootCategories = allVOs.stream()
                .filter(vo -> vo.getParentId() == null || vo.getParentId() == 0)
                .collect(Collectors.toList());

        for (PistonCategoryVO root : rootCategories) {
            buildChildren(root, allVOs);
        }

        return rootCategories;
    }

    private void buildChildren(PistonCategoryVO parent, List<PistonCategoryVO> allVOs) {
        List<PistonCategoryVO> children = allVOs.stream()
                .filter(vo -> parent.getId().equals(vo.getParentId()))
                .collect(Collectors.toList());

        if (!children.isEmpty()) {
            parent.setChildren(children);
            for (PistonCategoryVO child : children) {
                buildChildren(child, allVOs);
            }
        }
    }

    @Cacheable(value = "pistonCategory", key = "#id")
    public PistonCategoryVO getById(Long id) {
        PistonCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }
        return convertToVO(category);
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "pistonCategory", allEntries = true)
    public void create(PistonCategoryDTO dto) {
        PistonCategory category = new PistonCategory();
        BeanUtils.copyProperties(dto, category);

        if (dto.getParentId() != null && dto.getParentId() > 0) {
            PistonCategory parent = categoryMapper.selectById(dto.getParentId());
            if (parent == null) {
                throw new BusinessException("父分类不存在");
            }
            category.setLevel(parent.getLevel() + 1);
        } else {
            category.setLevel(1);
            category.setParentId(0L);
        }

        if (category.getSort() == null) {
            category.setSort(0);
        }
        if (category.getPriority() == null) {
            category.setPriority(0);
        }
        if (category.getStatus() == null) {
            category.setStatus(1);
        }

        categoryMapper.insert(category);
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "pistonCategory", allEntries = true)
    public void update(PistonCategoryDTO dto) {
        PistonCategory exist = categoryMapper.selectById(dto.getId());
        if (exist == null) {
            throw new BusinessException("分类不存在");
        }

        PistonCategory category = new PistonCategory();
        BeanUtils.copyProperties(dto, category);

        if (dto.getParentId() != null && dto.getParentId() > 0) {
            if (dto.getParentId().equals(dto.getId())) {
                throw new BusinessException("不能将自己设为父分类");
            }
            PistonCategory parent = categoryMapper.selectById(dto.getParentId());
            if (parent == null) {
                throw new BusinessException("父分类不存在");
            }
            category.setLevel(parent.getLevel() + 1);
        } else {
            category.setLevel(1);
            category.setParentId(0L);
        }

        categoryMapper.updateById(category);
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "pistonCategory", allEntries = true)
    public void delete(Long id) {
        PistonCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }

        Long childCount = categoryMapper.selectCount(
                new LambdaQueryWrapper<PistonCategory>()
                        .eq(PistonCategory::getParentId, id)
        );

        if (childCount > 0) {
            throw new BusinessException("该分类下存在子分类，无法删除");
        }

        categoryMapper.deleteById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "pistonCategory", allEntries = true)
    public void updatePriority(Long id, Integer priority) {
        PistonCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }
        category.setPriority(priority);
        categoryMapper.updateById(category);
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "pistonCategory", allEntries = true)
    public void offline(Long id) {
        PistonCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }
        category.setStatus(0);
        categoryMapper.updateById(category);
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "pistonCategory", allEntries = true)
    public void online(Long id) {
        PistonCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }
        category.setStatus(1);
        categoryMapper.updateById(category);
    }

    @Cacheable(value = "pistonCategory", key = "'children:' + #parentId")
    public List<PistonCategoryVO> getChildrenByParentId(Long parentId) {
        List<PistonCategory> list = categoryMapper.selectList(
                new LambdaQueryWrapper<PistonCategory>()
                        .eq(PistonCategory::getParentId, parentId)
                        .orderByAsc(PistonCategory::getSort)
        );
        return list.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    private PistonCategoryVO convertToVO(PistonCategory category) {
        PistonCategoryVO vo = new PistonCategoryVO();
        BeanUtils.copyProperties(category, vo);
        vo.setChildren(new ArrayList<>());
        return vo;
    }
}