package com.oiledumbrella.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.oiledumbrella.annotation.OperationLog;
import com.oiledumbrella.dto.MaterialInStockDTO;
import com.oiledumbrella.dto.MaterialQueryDTO;
import com.oiledumbrella.entity.Material;
import com.oiledumbrella.entity.MaterialBatch;
import com.oiledumbrella.exception.BusinessException;
import com.oiledumbrella.mapper.MaterialBatchMapper;
import com.oiledumbrella.mapper.MaterialMapper;
import com.oiledumbrella.vo.MaterialVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialMapper materialMapper;
    private final MaterialBatchMapper materialBatchMapper;

    public Page<MaterialVO> queryByConditions(MaterialQueryDTO queryDTO) {
        Page<Material> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        
        if (queryDTO.getMaterialName() != null && !queryDTO.getMaterialName().isEmpty()) {
            wrapper.like(Material::getMaterialName, queryDTO.getMaterialName());
        }
        if (queryDTO.getMaterialCode() != null && !queryDTO.getMaterialCode().isEmpty()) {
            wrapper.like(Material::getMaterialCode, queryDTO.getMaterialCode());
        }
        if (queryDTO.getMaterialType() != null && !queryDTO.getMaterialType().isEmpty()) {
            wrapper.eq(Material::getMaterialType, queryDTO.getMaterialType());
        }
        if (queryDTO.getMaterialQuality() != null && !queryDTO.getMaterialQuality().isEmpty()) {
            wrapper.eq(Material::getMaterialQuality, queryDTO.getMaterialQuality());
        }
        if (queryDTO.getUsePurpose() != null && !queryDTO.getUsePurpose().isEmpty()) {
            wrapper.like(Material::getUsePurpose, queryDTO.getUsePurpose());
        }
        if (queryDTO.getStatus() != null) {
            wrapper.eq(Material::getStatus, queryDTO.getStatus());
        }
        if (queryDTO.getMinStock() != null) {
            wrapper.ge(Material::getCurrentStock, queryDTO.getMinStock());
        }
        if (queryDTO.getMaxStock() != null) {
            wrapper.le(Material::getCurrentStock, queryDTO.getMaxStock());
        }
        if (queryDTO.getSupplier() != null && !queryDTO.getSupplier().isEmpty()) {
            wrapper.like(Material::getSupplier, queryDTO.getSupplier());
        }
        
        wrapper.orderByDesc(Material::getCreateTime);
        Page<Material> materialPage = materialMapper.selectPage(page, wrapper);
        
        Page<MaterialVO> voPage = new Page<>(materialPage.getCurrent(), materialPage.getSize(), materialPage.getTotal());
        List<MaterialVO> voList = materialPage.getRecords().stream().map(this::convertToVO).collect(Collectors.toList());
        voPage.setRecords(voList);
        
        return voPage;
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(operationType = "入库", businessType = "原料管理", description = "原料入库")
    public void inStock(MaterialInStockDTO dto, Long operatorId) {
        Material material = materialMapper.selectById(dto.getMaterialId());
        if (material == null) {
            throw new BusinessException("原料不存在");
        }

        MaterialBatch batch = new MaterialBatch();
        BeanUtils.copyProperties(dto, batch);
        batch.setTotalPrice(dto.getUnitPrice().multiply(dto.getQuantity()));
        if (batch.getPurchaseDate() == null) {
            batch.setPurchaseDate(LocalDate.now());
        }
        batch.setStatus(1);
        materialBatchMapper.insert(batch);

        material.setCurrentStock(material.getCurrentStock().add(dto.getQuantity()));
        material.setAvailableStock(material.getCurrentStock().subtract(material.getLockedStock() != null ? material.getLockedStock() : BigDecimal.ZERO));
        updateStockStatus(material);
        materialMapper.updateById(material);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(operationType = "出库", businessType = "原料管理", description = "原料出库")
    public void outStock(Long batchId, BigDecimal quantity, Long operatorId) {
        MaterialBatch batch = materialBatchMapper.selectById(batchId);
        if (batch == null) {
            throw new BusinessException("批次不存在");
        }
        if (batch.getQuantity().compareTo(quantity) < 0) {
            throw new BusinessException("批次库存不足");
        }

        batch.setQuantity(batch.getQuantity().subtract(quantity));
        if (batch.getQuantity().compareTo(BigDecimal.ZERO) == 0) {
            batch.setStatus(0);
        }
        materialBatchMapper.updateById(batch);

        Material material = materialMapper.selectById(batch.getMaterialId());
        material.setCurrentStock(material.getCurrentStock().subtract(quantity));
        material.setAvailableStock(material.getCurrentStock().subtract(material.getLockedStock() != null ? material.getLockedStock() : BigDecimal.ZERO));
        updateStockStatus(material);
        materialMapper.updateById(material);
    }

    @Transactional(rollbackFor = Exception.class)
    public void lockStock(Long materialId, BigDecimal quantity) {
        Material material = materialMapper.selectById(materialId);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        
        BigDecimal available = material.getCurrentStock().subtract(material.getLockedStock() != null ? material.getLockedStock() : BigDecimal.ZERO);
        if (available.compareTo(quantity) < 0) {
            throw new BusinessException("原料[" + material.getMaterialName() + "]库存不足，可用库存: " + available);
        }
        
        material.setLockedStock((material.getLockedStock() != null ? material.getLockedStock() : BigDecimal.ZERO).add(quantity));
        material.setAvailableStock(material.getCurrentStock().subtract(material.getLockedStock()));
        materialMapper.updateById(material);
    }

    @Transactional(rollbackFor = Exception.class)
    public void unlockStock(Long materialId, BigDecimal quantity) {
        Material material = materialMapper.selectById(materialId);
        if (material == null) {
            return;
        }
        
        BigDecimal newLocked = material.getLockedStock() != null ? material.getLockedStock().subtract(quantity) : BigDecimal.ZERO;
        if (newLocked.compareTo(BigDecimal.ZERO) < 0) {
            newLocked = BigDecimal.ZERO;
        }
        material.setLockedStock(newLocked);
        material.setAvailableStock(material.getCurrentStock().subtract(newLocked));
        materialMapper.updateById(material);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(operationType = "报废", businessType = "原料管理", description = "原料报废")
    public void scrapStock(Long materialId, BigDecimal quantity, String reason, Long operatorId) {
        Material material = materialMapper.selectById(materialId);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        
        material.setCurrentStock(material.getCurrentStock().subtract(quantity));
        material.setAvailableStock(material.getCurrentStock().subtract(material.getLockedStock() != null ? material.getLockedStock() : BigDecimal.ZERO));
        updateStockStatus(material);
        materialMapper.updateById(material);
    }

    private void updateStockStatus(Material material) {
        if (material.getCurrentStock().compareTo(BigDecimal.ZERO) <= 0) {
            material.setStatus(0);
        } else if (material.getCurrentStock().compareTo(material.getMinStock()) <= 0) {
            material.setStatus(1);
        } else {
            material.setStatus(2);
        }
    }

    private MaterialVO convertToVO(Material material) {
        MaterialVO vo = new MaterialVO();
        BeanUtils.copyProperties(material, vo);
        String statusName = switch (material.getStatus()) {
            case 0 -> "断货停用";
            case 1 -> "库存紧张";
            case 2 -> "库存充足";
            default -> "未知";
        };
        vo.setStatusName(statusName);
        return vo;
    }

    public void add(Material material) {
        if (material.getLockedStock() == null) {
            material.setLockedStock(BigDecimal.ZERO);
        }
        if (material.getAvailableStock() == null) {
            material.setAvailableStock(material.getCurrentStock() != null ? material.getCurrentStock() : BigDecimal.ZERO);
        }
        materialMapper.insert(material);
    }

    public void update(Material material) {
        materialMapper.updateById(material);
    }

    public void delete(Long id) {
        materialMapper.deleteById(id);
    }

    public Material getById(Long id) {
        return materialMapper.selectById(id);
    }

    public List<Material> getLowStock() {
        return materialMapper.selectList(
                new LambdaQueryWrapper<Material>()
                        .in(Material::getStatus, 0, 1)
                        .orderByAsc(Material::getCurrentStock)
        );
    }

    public List<Material> list() {
        return materialMapper.selectList(
                new LambdaQueryWrapper<Material>()
                        .eq(Material::getStatus, 2)
                        .orderByAsc(Material::getMaterialName)
        );
    }
}
