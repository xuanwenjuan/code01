package com.sheetmetal.compressor.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sheetmetal.compressor.common.PageResult;
import com.sheetmetal.compressor.dto.MaterialDTO;
import com.sheetmetal.compressor.dto.MaterialQueryDTO;
import com.sheetmetal.compressor.dto.StockUpdateDTO;
import com.sheetmetal.compressor.entity.Material;
import com.sheetmetal.compressor.exception.BusinessException;
import com.sheetmetal.compressor.mapper.MaterialMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class MaterialService {

    private static final String MATERIAL_LIST_KEY = "compressor:material:list";

    @Autowired
    private MaterialMapper materialMapper;

    @Autowired
    private StringRedisTemplate redisTemplate;

    public PageResult<Material> queryPage(MaterialQueryDTO dto) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(dto.getMaterialName())) {
            wrapper.like(Material::getMaterialName, dto.getMaterialName());
        }
        if (StringUtils.hasText(dto.getMaterialCode())) {
            wrapper.like(Material::getMaterialCode, dto.getMaterialCode());
        }
        if (dto.getMaterialType() != null) {
            wrapper.eq(Material::getMaterialType, dto.getMaterialType());
        }
        if (StringUtils.hasText(dto.getMaterialTexture())) {
            wrapper.like(Material::getMaterialTexture, dto.getMaterialTexture());
        }
        if (dto.getStatus() != null) {
            wrapper.eq(Material::getStatus, dto.getStatus());
        }
        if (StringUtils.hasText(dto.getSupplier())) {
            wrapper.like(Material::getSupplier, dto.getSupplier());
        }
        wrapper.orderByDesc(Material::getCreatedTime);

        IPage<Material> page = new Page<>(dto.getCurrent(), dto.getSize());
        IPage<Material> result = materialMapper.selectPage(page, wrapper);

        return PageResult.of(result.getRecords(), result.getTotal(), result.getSize(), result.getCurrent());
    }

    public Material getById(Long id) {
        return materialMapper.selectById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void add(MaterialDTO dto) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Material::getMaterialCode, dto.getMaterialCode());
        if (materialMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("原料编码已存在");
        }

        Material material = new Material();
        BeanUtils.copyProperties(dto, material);

        String batchNo = "BATCH" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        material.setBatchNo(batchNo);
        material.setInboundDate(LocalDate.now());

        if (material.getAvailableQuantity() == null) {
            material.setAvailableQuantity(material.getTotalQuantity());
        }

        updateMaterialStatus(material);

        if (material.getIsOutdoor() != null && material.getIsOutdoor() == 1
                && material.getNextCheckDate() == null) {
            material.setNextCheckDate(LocalDate.now().plusDays(
                    material.getMoistureProofDays() != null ? material.getMoistureProofDays() : 30));
        }

        materialMapper.insert(material);
        clearCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(MaterialDTO dto) {
        Material existing = materialMapper.selectById(dto.getId());
        if (existing == null) {
            throw new BusinessException("原料不存在");
        }

        if (!existing.getMaterialCode().equals(dto.getMaterialCode())) {
            LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(Material::getMaterialCode, dto.getMaterialCode());
            if (materialMapper.selectCount(wrapper) > 0) {
                throw new BusinessException("原料编码已存在");
            }
        }

        Material material = new Material();
        BeanUtils.copyProperties(dto, material);
        updateMaterialStatus(material);

        materialMapper.updateById(material);
        clearCache();
    }

    private void updateMaterialStatus(Material material) {
        if (material.getStatus() == null || material.getStatus() != 3) {
            BigDecimal warningQty = material.getWarningQuantity() != null ?
                    material.getWarningQuantity() : BigDecimal.ZERO;
            BigDecimal availableQty = material.getAvailableQuantity() != null ?
                    material.getAvailableQuantity() : BigDecimal.ZERO;

            if (availableQty.compareTo(warningQty) <= 0) {
                material.setStatus(2);
            } else {
                material.setStatus(1);
            }
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        materialMapper.deleteById(id);
        clearCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStock(StockUpdateDTO dto) {
        Material material = materialMapper.selectById(dto.getId());
        if (material == null) {
            throw new BusinessException("原料不存在");
        }

        BigDecimal newQuantity = material.getAvailableQuantity().add(dto.getQuantity());
        if (newQuantity.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("库存不足，当前可用: " + material.getAvailableQuantity());
        }

        material.setAvailableQuantity(newQuantity);
        updateMaterialStatus(material);
        materialMapper.updateById(material);
        clearCache();
    }

    public PageResult<Material> getNeedMoistureCheck(MaterialQueryDTO dto) {
        LocalDate today = LocalDate.now();
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Material::getIsOutdoor, 1)
                .le(Material::getNextCheckDate, today)
                .ne(Material::getStatus, 3)
                .orderByAsc(Material::getNextCheckDate);

        IPage<Material> page = new Page<>(dto.getCurrent(), dto.getSize());
        IPage<Material> result = materialMapper.selectPage(page, wrapper);

        return PageResult.of(result.getRecords(), result.getTotal(), result.getSize(), result.getCurrent());
    }

    @Transactional(rollbackFor = Exception.class)
    public void recordMoistureCheck(Long id, String remark) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }

        material.setLastCheckDate(LocalDate.now());
        material.setNextCheckDate(LocalDate.now().plusDays(
                material.getMoistureProofDays() != null ? material.getMoistureProofDays() : 30));
        if (StringUtils.hasText(remark)) {
            material.setDescription(material.getDescription() == null ? remark :
                    material.getDescription() + "; 防潮检查记录: " + remark);
        }
        materialMapper.updateById(material);
    }

    private void clearCache() {
        redisTemplate.delete(MATERIAL_LIST_KEY);
    }
}
