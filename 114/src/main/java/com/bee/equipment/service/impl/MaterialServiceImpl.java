package com.bee.equipment.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.bee.equipment.common.Constants;
import com.bee.equipment.common.ResultCodeEnum;
import com.bee.equipment.dto.MaterialDTO;
import com.bee.equipment.dto.MaterialQueryDTO;
import com.bee.equipment.entity.Material;
import com.bee.equipment.entity.EquipmentCategory;
import com.bee.equipment.exception.BusinessException;
import com.bee.equipment.mapper.MaterialMapper;
import com.bee.equipment.service.EquipmentCategoryService;
import com.bee.equipment.service.MaterialService;
import com.bee.equipment.vo.MaterialVO;
import cn.hutool.core.util.StrUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class MaterialServiceImpl extends ServiceImpl<MaterialMapper, Material> implements MaterialService {

    private static final String STOCK_LOCK_KEY = "stock:lock:";
    private static final String MATERIAL_CACHE_KEY = "material:";

    @Autowired
    private EquipmentCategoryService equipmentCategoryService;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Override
    public Page<MaterialVO> queryByConditions(MaterialQueryDTO queryDTO) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();

        if (StrUtil.isNotBlank(queryDTO.getName())) {
            wrapper.like(Material::getName, queryDTO.getName());
        }

        if (queryDTO.getCategoryId() != null && queryDTO.getCategoryId() > 0) {
            wrapper.eq(Material::getCategoryId, queryDTO.getCategoryId());
        }

        if (StrUtil.isNotBlank(queryDTO.getStatus())) {
            wrapper.eq(Material::getStatus, queryDTO.getStatus());
        }

        if (StrUtil.isNotBlank(queryDTO.getOrigin())) {
            wrapper.like(Material::getOrigin, queryDTO.getOrigin());
        }

        if (queryDTO.getMinQuantity() != null) {
            wrapper.ge(Material::getQuantity, queryDTO.getMinQuantity());
        }

        if (queryDTO.getMaxQuantity() != null) {
            wrapper.le(Material::getQuantity, queryDTO.getMaxQuantity());
        }

        if (queryDTO.getExpiryDateStart() != null) {
            wrapper.ge(Material::getExpiryDate, queryDTO.getExpiryDateStart());
        }

        if (queryDTO.getExpiryDateEnd() != null) {
            wrapper.le(Material::getExpiryDate, queryDTO.getExpiryDateEnd());
        }

        if ("asc".equalsIgnoreCase(queryDTO.getSortOrder())) {
            wrapper.orderByAsc(getSortField(queryDTO.getSortField()));
        } else {
            wrapper.orderByDesc(getSortField(queryDTO.getSortField()));
        }

        Page<Material> page = page(new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize()), wrapper);

        Page<MaterialVO> voPage = new Page<>(page.getCurrent(), page.getSize(), page.getTotal());
        List<MaterialVO> voList = new ArrayList<>();

        for (Material material : page.getRecords()) {
            MaterialVO vo = convertToVO(material);
            voList.add(vo);
        }

        voPage.setRecords(voList);
        return voPage;
    }

    private String getSortField(String sortField) {
        if (StrUtil.isBlank(sortField)) {
            return "createTime";
        }
        switch (sortField) {
            case "name":
                return "name";
            case "quantity":
                return "quantity";
            case "price":
                return "price";
            case "expiryDate":
                return "expiryDate";
            default:
                return "createTime";
        }
    }

    private MaterialVO convertToVO(Material material) {
        MaterialVO vo = new MaterialVO();
        BeanUtils.copyProperties(material, vo);

        if (material.getCategoryId() != null) {
            EquipmentCategory category = equipmentCategoryService.getById(material.getCategoryId());
            if (category != null) {
                vo.setCategoryName(category.getName());
            }
        }

        vo.setStatusDesc(getStatusDesc(material.getStatus()));

        if (material.getQuantity() != null && material.getPrice() != null) {
            vo.setTotalValue(material.getQuantity().multiply(material.getPrice()).setScale(2, RoundingMode.HALF_UP));
        }

        return vo;
    }

    private String getStatusDesc(String status) {
        switch (status) {
            case Constants.MATERIAL_STATUS_NORMAL:
                return "库存充足";
            case Constants.MATERIAL_STATUS_WARN:
                return "库存预警";
            case Constants.MATERIAL_STATUS_STOP:
                return "停止采购";
            default:
                return "未知";
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addMaterial(MaterialDTO materialDTO) {
        Material material = new Material();
        BeanUtils.copyProperties(materialDTO, material);
        material.setBatchNo("BATCH-" + System.currentTimeMillis());
        material.setCreateTime(LocalDateTime.now());
        material.setUpdateTime(LocalDateTime.now());
        updateMaterialStatus(material);
        save(material);
        clearMaterialCache(material.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateMaterial(MaterialDTO materialDTO) {
        Material material = new Material();
        BeanUtils.copyProperties(materialDTO, material);
        material.setUpdateTime(LocalDateTime.now());
        updateMaterialStatus(material);
        updateById(material);
        clearMaterialCache(material.getId());
    }

    private void updateMaterialStatus(Material material) {
        if (material.getQuantity() != null && material.getWarnQuantity() != null) {
            if (material.getQuantity().compareTo(material.getWarnQuantity()) <= 0) {
                material.setStatus(Constants.MATERIAL_STATUS_WARN);
            } else if (!Constants.MATERIAL_STATUS_STOP.equals(material.getStatus())) {
                material.setStatus(Constants.MATERIAL_STATUS_NORMAL);
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateStatus(Long id, String status) {
        Material material = getById(id);
        if (material == null) {
            throw new BusinessException(ResultCodeEnum.MATERIAL_NOT_EXIST);
        }
        lambdaUpdate()
                .eq(Material::getId, id)
                .set(Material::getStatus, status)
                .update();
        clearMaterialCache(id);
    }

    @Override
    public void checkExpiryAndWarn() {
        LocalDate now = LocalDate.now();
        LocalDate warnDate = now.plusDays(30);

        lambdaUpdate()
                .set(Material::getStatus, Constants.MATERIAL_STATUS_WARN)
                .eq(Material::getIsMoistureSensitive, 1)
                .le(Material::getExpiryDate, warnDate)
                .gt(Material::getExpiryDate, now)
                .ne(Material::getStatus, Constants.MATERIAL_STATUS_STOP)
                .update();
    }

    @Override
    public MaterialVO getDetailById(Long id) {
        String cacheKey = MATERIAL_CACHE_KEY + id;
        MaterialVO cachedVO = (MaterialVO) redisTemplate.opsForValue().get(cacheKey);
        if (cachedVO != null) {
            return cachedVO;
        }

        Material material = getById(id);
        if (material == null) {
            throw new BusinessException(ResultCodeEnum.MATERIAL_NOT_EXIST);
        }

        MaterialVO vo = convertToVO(material);
        redisTemplate.opsForValue().set(cacheKey, vo, 30, TimeUnit.MINUTES);
        return vo;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void lockStock(Long materialId, BigDecimal quantity, Long workOrderId) {
        String lockKey = STOCK_LOCK_KEY + materialId + ":" + workOrderId;

        Boolean locked = redisTemplate.opsForValue().setIfAbsent(lockKey, quantity, 2, TimeUnit.HOURS);
        if (locked == null || !locked) {
            throw new BusinessException("物料库存锁定失败，请稍后重试");
        }

        Material material = getById(materialId);
        if (material == null) {
            redisTemplate.delete(lockKey);
            throw new BusinessException(ResultCodeEnum.MATERIAL_NOT_EXIST);
        }

        if (material.getQuantity().compareTo(quantity) < 0) {
            redisTemplate.delete(lockKey);
            throw new BusinessException(ResultCodeEnum.STOCK_NOT_ENOUGH.getCode(),
                    "物料[" + material.getName() + "]库存不足，当前库存：" + material.getQuantity() + "，需要：" + quantity);
        }

        material.setQuantity(material.getQuantity().subtract(quantity));
        updateMaterialStatus(material);
        updateById(material);
        clearMaterialCache(materialId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void unlockStock(Long materialId, BigDecimal quantity, Long workOrderId) {
        String lockKey = STOCK_LOCK_KEY + materialId + ":" + workOrderId;
        redisTemplate.delete(lockKey);

        Material material = getById(materialId);
        if (material != null) {
            material.setQuantity(material.getQuantity().add(quantity));
            updateMaterialStatus(material);
            updateById(material);
            clearMaterialCache(materialId);
        }
    }

    private void clearMaterialCache(Long id) {
        redisTemplate.delete(MATERIAL_CACHE_KEY + id);
    }
}
