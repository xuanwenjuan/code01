package com.radiator.management.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.radiator.management.dto.MaterialQueryDTO;
import com.radiator.management.entity.MaterialInventory;
import com.radiator.management.mapper.MaterialInventoryMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
public class MaterialQueryService {

    @Autowired
    private MaterialInventoryMapper materialInventoryMapper;

    @Autowired
    private MaterialLockService materialLockService;

    @Cacheable(value = "materialQuery", key = "#dto.hashCode()", unless = "#result == null")
    public IPage<MaterialInventory> queryMaterials(MaterialQueryDTO dto) {
        LambdaQueryWrapper<MaterialInventory> wrapper = buildQueryWrapper(dto);
        applySorting(wrapper, dto);

        int pageNum = dto.getPage() != null ? dto.getPage() : 1;
        int pageSize = dto.getSize() != null ? dto.getSize() : 20;

        Page<MaterialInventory> page = new Page<>(pageNum, pageSize);
        IPage<MaterialInventory> result = materialInventoryMapper.selectPage(page, wrapper);

        result.getRecords().forEach(material -> {
            BigDecimal lockedQty = materialLockService.getLockedQuantity(material.getId());
        });

        return result;
    }

    @Cacheable(value = "materialList", key = "#dto.hashCode()", unless = "#result == null")
    public List<MaterialInventory> queryMaterialList(MaterialQueryDTO dto) {
        LambdaQueryWrapper<MaterialInventory> wrapper = buildQueryWrapper(dto);
        applySorting(wrapper, dto);
        return materialInventoryMapper.selectList(wrapper);
    }

    private LambdaQueryWrapper<MaterialInventory> buildQueryWrapper(MaterialQueryDTO dto) {
        LambdaQueryWrapper<MaterialInventory> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(dto.getMaterialName())) {
            wrapper.like(MaterialInventory::getMaterialName, dto.getMaterialName());
        }

        if (StringUtils.hasText(dto.getMaterialCode())) {
            wrapper.like(MaterialInventory::getMaterialCode, dto.getMaterialCode());
        }

        if (StringUtils.hasText(dto.getMaterialType())) {
            wrapper.eq(MaterialInventory::getMaterialType, dto.getMaterialType());
        }

        if (StringUtils.hasText(dto.getSpecification())) {
            wrapper.like(MaterialInventory::getSpecification, dto.getSpecification());
        }

        if (StringUtils.hasText(dto.getBatchNo())) {
            wrapper.like(MaterialInventory::getBatchNo, dto.getBatchNo());
        }

        if (StringUtils.hasText(dto.getStatus())) {
            wrapper.eq(MaterialInventory::getStatus, dto.getStatus());
        }

        if (dto.getMinQuantity() != null) {
            wrapper.ge(MaterialInventory::getQuantity, dto.getMinQuantity());
        }

        if (dto.getMaxQuantity() != null) {
            wrapper.le(MaterialInventory::getQuantity, dto.getMaxQuantity());
        }

        if (dto.getMinUnitPrice() != null) {
            wrapper.ge(MaterialInventory::getUnitPrice, dto.getMinUnitPrice());
        }

        if (dto.getMaxUnitPrice() != null) {
            wrapper.le(MaterialInventory::getUnitPrice, dto.getMaxUnitPrice());
        }

        if (dto.getWarningOnly() != null && dto.getWarningOnly()) {
            wrapper.le("quantity", "warning_quantity");
        }

        if (dto.getIsMoistureProof() != null) {
            wrapper.eq(MaterialInventory::getIsMoistureProof, dto.getIsMoistureProof());
        }

        return wrapper;
    }

    private void applySorting(LambdaQueryWrapper<MaterialInventory> wrapper, MaterialQueryDTO dto) {
        String sortField = dto.getSortField();
        String sortOrder = dto.getSortOrder();

        if (!StringUtils.hasText(sortField)) {
            sortField = "createTime";
        }

        boolean isAsc = "asc".equalsIgnoreCase(sortOrder);

        switch (sortField) {
            case "materialName":
                wrapper.orderBy(true, isAsc, MaterialInventory::getMaterialName);
                break;
            case "materialCode":
                wrapper.orderBy(true, isAsc, MaterialInventory::getMaterialCode);
                break;
            case "quantity":
                wrapper.orderBy(true, isAsc, MaterialInventory::getQuantity);
                break;
            case "unitPrice":
                wrapper.orderBy(true, isAsc, MaterialInventory::getUnitPrice);
                break;
            case "createTime":
            default:
                wrapper.orderBy(true, isAsc, MaterialInventory::getCreateTime);
                break;
        }
    }

    public long countByCondition(MaterialQueryDTO dto) {
        LambdaQueryWrapper<MaterialInventory> wrapper = buildQueryWrapper(dto);
        return materialInventoryMapper.selectCount(wrapper);
    }
}
