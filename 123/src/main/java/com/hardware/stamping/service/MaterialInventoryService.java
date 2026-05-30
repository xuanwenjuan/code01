package com.hardware.stamping.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hardware.stamping.annotation.Log;
import com.hardware.stamping.dto.MaterialInventoryQueryDTO;
import com.hardware.stamping.entity.MaterialInventory;
import com.hardware.stamping.exception.BusinessException;
import com.hardware.stamping.mapper.MaterialInventoryMapper;
import com.hardware.stamping.vo.MaterialInventoryVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class MaterialInventoryService {

    private static final String MATERIAL_CACHE_KEY = "material:list";

    @Autowired
    private MaterialInventoryMapper materialInventoryMapper;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Log("原料入库")
    @Transactional(rollbackFor = Exception.class)
    public void addMaterial(MaterialInventory material) {
        if (material.getBatchCode() == null || material.getBatchCode().isEmpty()) {
            material.setBatchCode(generateBatchCode(material.getMaterialType()));
        }

        MaterialInventory exist = materialInventoryMapper.selectOne(
                new LambdaQueryWrapper<MaterialInventory>()
                        .eq(MaterialInventory::getBatchCode, material.getBatchCode())
        );
        if (exist != null) {
            throw new BusinessException("批次编码已存在");
        }

        if (material.getTotalPrice() == null && material.getUnitPrice() != null && material.getQuantity() != null) {
            material.setTotalPrice(material.getUnitPrice().multiply(material.getQuantity()));
        }

        if (material.getProductionDate() == null) {
            material.setProductionDate(LocalDate.now());
        }

        updateStockStatus(material);
        material.setCreateTime(LocalDateTime.now());
        material.setUpdateTime(LocalDateTime.now());
        material.setDeleted(0);
        materialInventoryMapper.insert(material);
        clearMaterialCache();
    }

    @Log("更新原料信息")
    @Transactional(rollbackFor = Exception.class)
    public void updateMaterial(MaterialInventory material) {
        MaterialInventory exist = materialInventoryMapper.selectById(material.getId());
        if (exist == null) {
            throw new BusinessException("原料不存在");
        }
        if (material.getTotalPrice() == null && material.getUnitPrice() != null && material.getQuantity() != null) {
            material.setTotalPrice(material.getUnitPrice().multiply(material.getQuantity()));
        }
        updateStockStatus(material);
        material.setUpdateTime(LocalDateTime.now());
        materialInventoryMapper.updateById(material);
        clearMaterialCache();
    }

    @Log("删除原料记录")
    @Transactional(rollbackFor = Exception.class)
    public void deleteMaterial(Long id) {
        materialInventoryMapper.deleteById(id);
        clearMaterialCache();
    }

    public MaterialInventory getById(Long id) {
        return materialInventoryMapper.selectById(id);
    }

    public List<MaterialInventory> listAll() {
        List<MaterialInventory> cachedList = (List<MaterialInventory>) redisTemplate.opsForValue().get(MATERIAL_CACHE_KEY);
        if (cachedList != null && !cachedList.isEmpty()) {
            return cachedList;
        }

        List<MaterialInventory> list = materialInventoryMapper.selectList(
                new LambdaQueryWrapper<MaterialInventory>()
                        .orderByDesc(MaterialInventory::getCreateTime)
        );

        redisTemplate.opsForValue().set(MATERIAL_CACHE_KEY, list, 30, TimeUnit.MINUTES);
        return list;
    }

    public IPage<MaterialInventoryVO> queryPage(MaterialInventoryQueryDTO queryDTO) {
        Page<MaterialInventoryVO> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());
        IPage<MaterialInventoryVO> resultPage = materialInventoryMapper.queryPage(page, queryDTO);
        resultPage.getRecords().forEach(this::fillStatusText);
        return resultPage;
    }

    public List<MaterialInventory> listByMaterialType(String materialType) {
        return materialInventoryMapper.selectList(
                new LambdaQueryWrapper<MaterialInventory>()
                        .eq(MaterialInventory::getMaterialType, materialType)
                        .orderByDesc(MaterialInventory::getCreateTime)
        );
    }

    public List<MaterialInventory> listWarningMaterials() {
        return materialInventoryMapper.selectList(
                new LambdaQueryWrapper<MaterialInventory>()
                        .eq(MaterialInventory::getStockStatus, 2)
                        .or()
                        .eq(MaterialInventory::getStockStatus, 3)
                        .orderByDesc(MaterialInventory::getCreateTime)
        );
    }

    @Transactional(rollbackFor = Exception.class)
    public void checkAndUpdateOxidationWarning() {
        List<MaterialInventory> oxidizableMaterials = materialInventoryMapper.selectList(
                new LambdaQueryWrapper<MaterialInventory>()
                        .eq(MaterialInventory::getIsOxidizable, 1)
                        .in(MaterialInventory::getStockStatus, 0, 1)
        );

        LocalDate today = LocalDate.now();
        for (MaterialInventory material : oxidizableMaterials) {
            if (material.getExpirationDate() != null) {
                if (material.getExpirationDate().isBefore(today)) {
                    material.setStockStatus(3);
                } else if (material.getExpirationDate().minusDays(7).isBefore(today)) {
                    material.setStockStatus(2);
                }
                materialInventoryMapper.updateById(material);
            }
        }
        clearMaterialCache();
    }

    private void fillStatusText(MaterialInventoryVO vo) {
        if (vo.getStockStatus() == null) {
            return;
        }
        switch (vo.getStockStatus()) {
            case 0:
                vo.setStockStatusText("无库存");
                break;
            case 1:
                vo.setStockStatusText("库存充足");
                break;
            case 2:
                vo.setStockStatusText("库存预警");
                break;
            case 3:
                vo.setStockStatusText("过期");
                break;
            default:
                vo.setStockStatusText("未知状态");
                break;
        }
    }

    private void updateStockStatus(MaterialInventory material) {
        BigDecimal quantity = material.getQuantity();
        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            material.setStockStatus(0);
        } else if (quantity.compareTo(new BigDecimal("100")) < 0) {
            material.setStockStatus(2);
        } else {
            material.setStockStatus(1);
        }
    }

    private String generateBatchCode(String materialType) {
        String typeCode = materialType.length() >= 2 ? materialType.substring(0, 2).toUpperCase() : "MT";
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int random = (int) (Math.random() * 1000);
        return typeCode + dateStr + String.format("%03d", random);
    }

    private void clearMaterialCache() {
        redisTemplate.delete(MATERIAL_CACHE_KEY);
    }
}
