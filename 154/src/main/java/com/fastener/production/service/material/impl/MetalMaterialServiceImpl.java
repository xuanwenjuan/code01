package com.fastener.production.service.material.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fastener.production.common.entity.PageQuery;
import com.fastener.production.common.exception.BusinessException;
import com.fastener.production.common.result.ResultCode;
import com.fastener.production.entity.material.MetalMaterial;
import com.fastener.production.entity.material.dto.MetalMaterialDTO;
import com.fastener.production.entity.material.dto.MetalMaterialQueryDTO;
import com.fastener.production.mapper.material.MetalMaterialMapper;
import com.fastener.production.service.material.MetalMaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MetalMaterialServiceImpl extends ServiceImpl<MetalMaterialMapper, MetalMaterial> implements MetalMaterialService {

    private final MetalMaterialMapper metalMaterialMapper;

    @Override
    public IPage<MetalMaterial> page(PageQuery pageQuery, String materialName, Integer materialType, Integer status) {
        Page<MetalMaterial> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());
        LambdaQueryWrapper<MetalMaterial> wrapper = new LambdaQueryWrapper<>();
        if (materialName != null && !materialName.isEmpty()) {
            wrapper.like(MetalMaterial::getMaterialName, materialName);
        }
        if (materialType != null) {
            wrapper.eq(MetalMaterial::getMaterialType, materialType);
        }
        if (status != null) {
            wrapper.eq(MetalMaterial::getStatus, status);
        }
        wrapper.orderByDesc(MetalMaterial::getCreateTime);
        return this.page(page, wrapper);
    }

    @Override
    public IPage<MetalMaterial> queryByConditions(PageQuery pageQuery, MetalMaterialQueryDTO queryDTO) {
        Page<MetalMaterial> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());
        LambdaQueryWrapper<MetalMaterial> wrapper = buildQueryWrapper(queryDTO);
        wrapper.orderByDesc(MetalMaterial::getCreateTime);
        return this.page(page, wrapper);
    }

    @Override
    public List<MetalMaterial> listByConditions(MetalMaterialQueryDTO queryDTO) {
        LambdaQueryWrapper<MetalMaterial> wrapper = buildQueryWrapper(queryDTO);
        wrapper.orderByDesc(MetalMaterial::getCreateTime);
        return this.list(wrapper);
    }

    private LambdaQueryWrapper<MetalMaterial> buildQueryWrapper(MetalMaterialQueryDTO queryDTO) {
        LambdaQueryWrapper<MetalMaterial> wrapper = new LambdaQueryWrapper<>();

        if (queryDTO == null) {
            return wrapper;
        }

        if (StringUtils.hasText(queryDTO.getKeyword())) {
            String keyword = queryDTO.getKeyword().trim();
            wrapper.and(w -> w.like(MetalMaterial::getMaterialName, keyword)
                    .or().like(MetalMaterial::getMaterialCode, keyword)
                    .or().like(MetalMaterial::getMaterialGrade, keyword)
                    .or().like(MetalMaterial::getSpecification, keyword)
                    .or().like(MetalMaterial::getSupplier, keyword));
        }

        if (StringUtils.hasText(queryDTO.getMaterialName())) {
            wrapper.like(MetalMaterial::getMaterialName, queryDTO.getMaterialName().trim());
        }

        if (StringUtils.hasText(queryDTO.getMaterialCode())) {
            wrapper.like(MetalMaterial::getMaterialCode, queryDTO.getMaterialCode().trim());
        }

        if (queryDTO.getMaterialType() != null) {
            wrapper.eq(MetalMaterial::getMaterialType, queryDTO.getMaterialType());
        }

        if (StringUtils.hasText(queryDTO.getMaterialGrade())) {
            wrapper.eq(MetalMaterial::getMaterialGrade, queryDTO.getMaterialGrade().trim());
        }

        if (StringUtils.hasText(queryDTO.getSpecification())) {
            wrapper.like(MetalMaterial::getSpecification, queryDTO.getSpecification().trim());
        }

        if (StringUtils.hasText(queryDTO.getOrigin())) {
            wrapper.eq(MetalMaterial::getOrigin, queryDTO.getOrigin().trim());
        }

        if (StringUtils.hasText(queryDTO.getSupplier())) {
            wrapper.eq(MetalMaterial::getSupplier, queryDTO.getSupplier().trim());
        }

        if (queryDTO.getStatus() != null) {
            wrapper.eq(MetalMaterial::getStatus, queryDTO.getStatus());
        }

        return wrapper;
    }

    @Override
    public List<MetalMaterial> listByType(Integer materialType) {
        return metalMaterialMapper.selectByType(materialType);
    }

    @Override
    public List<String> listAllGrades() {
        return this.list(new LambdaQueryWrapper<MetalMaterial>()
                        .select(MetalMaterial::getMaterialGrade)
                        .isNotNull(MetalMaterial::getMaterialGrade)
                        .ne(MetalMaterial::getMaterialGrade, "")
                        .groupBy(MetalMaterial::getMaterialGrade))
                .stream()
                .map(MetalMaterial::getMaterialGrade)
                .distinct()
                .collect(Collectors.toList());
    }

    @Override
    public List<String> listAllSuppliers() {
        return this.list(new LambdaQueryWrapper<MetalMaterial>()
                        .select(MetalMaterial::getSupplier)
                        .isNotNull(MetalMaterial::getSupplier)
                        .ne(MetalMaterial::getSupplier, "")
                        .groupBy(MetalMaterial::getSupplier))
                .stream()
                .map(MetalMaterial::getSupplier)
                .distinct()
                .collect(Collectors.toList());
    }

    @Override
    public List<String> listAllOrigins() {
        return this.list(new LambdaQueryWrapper<MetalMaterial>()
                        .select(MetalMaterial::getOrigin)
                        .isNotNull(MetalMaterial::getOrigin)
                        .ne(MetalMaterial::getOrigin, "")
                        .groupBy(MetalMaterial::getOrigin))
                .stream()
                .map(MetalMaterial::getOrigin)
                .distinct()
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void add(MetalMaterialDTO dto) {
        MetalMaterial existing = metalMaterialMapper.selectByCode(dto.getMaterialCode());
        if (existing != null) {
            throw new BusinessException(ResultCode.DATA_ALREADY_EXIST, "原料编码已存在");
        }

        MetalMaterial material = new MetalMaterial();
        BeanUtils.copyProperties(dto, material);
        this.save(material);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(MetalMaterialDTO dto) {
        MetalMaterial material = this.getById(dto.getId());
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        if (!material.getMaterialCode().equals(dto.getMaterialCode())) {
            MetalMaterial existing = metalMaterialMapper.selectByCode(dto.getMaterialCode());
            if (existing != null) {
                throw new BusinessException(ResultCode.DATA_ALREADY_EXIST, "原料编码已存在");
            }
        }

        BeanUtils.copyProperties(dto, material);
        this.updateById(material);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        MetalMaterial material = this.getById(id);
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        this.removeById(id);
    }
}
