package com.fitness.manufacture.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.metadata.OrderItem;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fitness.manufacture.common.BusinessException;
import com.fitness.manufacture.common.PageQuery;
import com.fitness.manufacture.common.ResultCode;
import com.fitness.manufacture.dto.MaterialDTO;
import com.fitness.manufacture.dto.MaterialQueryDTO;
import com.fitness.manufacture.entity.Material;
import com.fitness.manufacture.entity.StockWarning;
import com.fitness.manufacture.mapper.MaterialMapper;
import com.fitness.manufacture.mapper.StockWarningMapper;
import com.fitness.manufacture.service.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class MaterialServiceImpl extends ServiceImpl<MaterialMapper, Material> implements MaterialService {

    private final MaterialMapper materialMapper;
    private final StockWarningMapper stockWarningMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveMaterial(MaterialDTO dto) {
        Material exist = materialMapper.selectOne(new LambdaQueryWrapper<Material>()
                .eq(Material::getMaterialCode, dto.getMaterialCode()));
        if (exist != null) {
            throw new BusinessException(ResultCode.DATA_EXIST, "物料编码已存在");
        }

        Material material = new Material();
        BeanUtils.copyProperties(dto, material);
        if (material.getStatus() == null) {
            material.setStatus(1);
        }
        materialMapper.insert(material);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateMaterial(MaterialDTO dto) {
        Material material = materialMapper.selectById(dto.getId());
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        Material exist = materialMapper.selectOne(new LambdaQueryWrapper<Material>()
                .eq(Material::getMaterialCode, dto.getMaterialCode())
                .ne(Material::getId, dto.getId()));
        if (exist != null) {
            throw new BusinessException(ResultCode.DATA_EXIST, "物料编码已存在");
        }

        BeanUtils.copyProperties(dto, material);
        materialMapper.updateById(material);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteMaterial(Long id) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        materialMapper.deleteById(id);
    }

    @Override
    public IPage<Material> getMaterialPage(PageQuery query, String keyword, String materialType, Integer status) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(Material::getMaterialName, keyword)
                    .or().like(Material::getMaterialCode, keyword));
        }
        if (StringUtils.hasText(materialType)) {
            wrapper.eq(Material::getMaterialType, materialType);
        }
        if (status != null) {
            wrapper.eq(Material::getStatus, status);
        }
        wrapper.orderByDesc(Material::getCreateTime);

        Page<Material> page = new Page<>(query.getPageNum(), query.getPageSize());
        return materialMapper.selectPage(page, wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateMaterialStatus(Long id, Integer status) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        material.setStatus(status);
        materialMapper.updateById(material);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void checkStockWarning() {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        wrapper.ne(Material::getStatus, 0);
        wrapper.apply("stock_quantity <= warning_quantity");
        var materials = materialMapper.selectList(wrapper);

        for (Material material : materials) {
            StockWarning warning = new StockWarning();
            warning.setWarningType("库存不足");
            warning.setMaterialId(material.getId());
            warning.setMaterialName(material.getMaterialName());
            warning.setCurrentQuantity(material.getStockQuantity());
            warning.setWarningQuantity(material.getWarningQuantity());
            warning.setStatus(0);
            warning.setCreateTime(LocalDateTime.now());
            stockWarningMapper.insert(warning);

            material.setStatus(2);
            materialMapper.updateById(material);
        }
    }

    @Override
    public IPage<Material> getMaterialPageByConditions(MaterialQueryDTO queryDTO) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(Material::getMaterialName, queryDTO.getKeyword())
                    .or().like(Material::getMaterialCode, queryDTO.getKeyword()));
        }
        if (StringUtils.hasText(queryDTO.getMaterialType())) {
            wrapper.eq(Material::getMaterialType, queryDTO.getMaterialType());
        }
        if (queryDTO.getStatus() != null) {
            wrapper.eq(Material::getStatus, queryDTO.getStatus());
        }
        if (StringUtils.hasText(queryDTO.getSupplier())) {
            wrapper.like(Material::getSupplier, queryDTO.getSupplier());
        }
        if (queryDTO.getMinStock() != null) {
            wrapper.ge(Material::getStockQuantity, queryDTO.getMinStock());
        }
        if (queryDTO.getMaxStock() != null) {
            wrapper.le(Material::getStockQuantity, queryDTO.getMaxStock());
        }
        if (queryDTO.getStockWarning() != null && queryDTO.getStockWarning() == 1) {
            wrapper.apply("stock_quantity <= warning_quantity");
        }
        if (queryDTO.getStartTime() != null) {
            wrapper.ge(Material::getCreateTime, queryDTO.getStartTime());
        }
        if (queryDTO.getEndTime() != null) {
            wrapper.le(Material::getCreateTime, queryDTO.getEndTime());
        }

        Page<Material> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());

        if (StringUtils.hasText(queryDTO.getOrderBy())) {
            boolean isAsc = "asc".equalsIgnoreCase(queryDTO.getOrderDirection());
            switch (queryDTO.getOrderBy()) {
                case "stockQuantity" ->
                        page.addOrder(isAsc ? OrderItem.asc("stock_quantity") : OrderItem.desc("stock_quantity"));
                case "unitPrice" ->
                        page.addOrder(isAsc ? OrderItem.asc("unit_price") : OrderItem.desc("unit_price"));
                case "createTime" ->
                        page.addOrder(isAsc ? OrderItem.asc("create_time") : OrderItem.desc("create_time"));
                default -> page.addOrder(OrderItem.desc("create_time"));
            }
        } else {
            page.addOrder(OrderItem.desc("create_time"));
        }

        return materialMapper.selectPage(page, wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateStock(Long materialId, BigDecimal quantity, int type) {
        Material material = materialMapper.selectById(materialId);
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "物料不存在");
        }

        if (type == 1) {
            material.setStockQuantity(material.getStockQuantity().add(quantity));
        } else if (type == 2) {
            if (material.getStockQuantity().compareTo(quantity) < 0) {
                throw new BusinessException(ResultCode.MATERIAL_NOT_ENOUGH);
            }
            material.setStockQuantity(material.getStockQuantity().subtract(quantity));
        }

        if (material.getStockQuantity().compareTo(material.getWarningQuantity()) <= 0) {
            material.setStatus(2);
        } else if (material.getStatus() == 2 && material.getStockQuantity().compareTo(material.getWarningQuantity()) > 0) {
            material.setStatus(1);
        }

        materialMapper.updateById(material);
    }
}
