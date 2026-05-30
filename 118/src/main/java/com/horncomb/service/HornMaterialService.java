package com.horncomb.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.horncomb.annotation.OperationLog;
import com.horncomb.common.BusinessException;
import com.horncomb.common.Constants;
import com.horncomb.common.UserContext;
import com.horncomb.dto.HornMaterialDTO;
import com.horncomb.dto.HornMaterialQueryDTO;
import com.horncomb.entity.HornMaterial;
import com.horncomb.mapper.HornMaterialMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HornMaterialService {

    private final HornMaterialMapper hornMaterialMapper;

    public IPage<HornMaterial> page(int pageNum, int pageSize, HornMaterialQueryDTO queryDTO) {
        Page<HornMaterial> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<HornMaterial> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(queryDTO.getBatchNo())) {
            wrapper.like(HornMaterial::getBatchNo, queryDTO.getBatchNo());
        }
        if (StringUtils.hasText(queryDTO.getHornType())) {
            wrapper.eq(HornMaterial::getHornType, queryDTO.getHornType());
        }
        if (StringUtils.hasText(queryDTO.getGrade())) {
            wrapper.eq(HornMaterial::getGrade, queryDTO.getGrade());
        }
        if (StringUtils.hasText(queryDTO.getStockStatus())) {
            wrapper.eq(HornMaterial::getStockStatus, queryDTO.getStockStatus());
        }
        if (StringUtils.hasText(queryDTO.getOrigin())) {
            wrapper.like(HornMaterial::getOrigin, queryDTO.getOrigin());
        }
        if (queryDTO.getMinThickness() != null) {
            wrapper.ge(HornMaterial::getThickness, queryDTO.getMinThickness());
        }
        if (queryDTO.getMaxThickness() != null) {
            wrapper.le(HornMaterial::getThickness, queryDTO.getMaxThickness());
        }
        if (queryDTO.getMinQuantity() != null) {
            wrapper.ge(HornMaterial::getQuantity, queryDTO.getMinQuantity());
        }
        if (queryDTO.getMaxQuantity() != null) {
            wrapper.le(HornMaterial::getQuantity, queryDTO.getMaxQuantity());
        }
        if (queryDTO.getPurchaseStartDate() != null) {
            wrapper.ge(HornMaterial::getPurchaseDate, queryDTO.getPurchaseStartDate());
        }
        if (queryDTO.getPurchaseEndDate() != null) {
            wrapper.le(HornMaterial::getPurchaseDate, queryDTO.getPurchaseEndDate());
        }
        if (queryDTO.getExpireStartDate() != null) {
            wrapper.ge(HornMaterial::getExpireRemindDate, queryDTO.getExpireStartDate());
        }
        if (queryDTO.getExpireEndDate() != null) {
            wrapper.le(HornMaterial::getExpireRemindDate, queryDTO.getExpireEndDate());
        }

        wrapper.orderByDesc(HornMaterial::getCreateTime);
        return hornMaterialMapper.selectPage(page, wrapper);
    }

    public HornMaterial getById(Long id) {
        HornMaterial material = hornMaterialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        return material;
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "原料管理", type = "新增", description = "新增牛角原料")
    public void create(HornMaterialDTO dto) {
        HornMaterial exist = hornMaterialMapper.selectOne(
                new LambdaQueryWrapper<HornMaterial>()
                        .eq(HornMaterial::getBatchNo, dto.getBatchNo())
        );
        if (exist != null) {
            throw new BusinessException("批次编号已存在");
        }

        HornMaterial material = new HornMaterial();
        BeanUtils.copyProperties(dto, material);
        material.setId(null);
        material.setTotalPrice(dto.getUnitPrice().multiply(new BigDecimal(dto.getQuantity())));
        material.setPurchaserId(UserContext.getUserId());
        updateStockStatus(material);
        if (material.getWarningQuantity() == null) {
            material.setWarningQuantity(10);
        }
        hornMaterialMapper.insert(material);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "原料管理", type = "修改", description = "修改牛角原料")
    public void update(HornMaterialDTO dto) {
        HornMaterial material = hornMaterialMapper.selectById(dto.getId());
        if (material == null) {
            throw new BusinessException("原料不存在");
        }

        if (!material.getBatchNo().equals(dto.getBatchNo())) {
            HornMaterial exist = hornMaterialMapper.selectOne(
                    new LambdaQueryWrapper<HornMaterial>()
                            .eq(HornMaterial::getBatchNo, dto.getBatchNo())
            );
            if (exist != null) {
                throw new BusinessException("批次编号已存在");
            }
        }

        BeanUtils.copyProperties(dto, material);
        material.setTotalPrice(dto.getUnitPrice().multiply(new BigDecimal(dto.getQuantity())));
        updateStockStatus(material);
        hornMaterialMapper.updateById(material);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "原料管理", type = "库存更新", description = "更新原料库存")
    public void updateStock(Long id, Integer quantity) {
        HornMaterial material = hornMaterialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }

        int newQuantity = material.getQuantity() + quantity;
        if (newQuantity < 0) {
            throw new BusinessException("库存不足");
        }

        material.setQuantity(newQuantity);
        material.setTotalPrice(material.getUnitPrice().multiply(new BigDecimal(newQuantity)));
        updateStockStatus(material);
        hornMaterialMapper.updateById(material);
    }

    @Transactional(rollbackFor = Exception.class)
    public void batchDeductStock(List<Long> ids, List<Integer> quantities) {
        if (ids.size() != quantities.size()) {
            throw new BusinessException("参数不匹配");
        }
        for (int i = 0; i < ids.size(); i++) {
            updateStock(ids.get(i), -quantities.get(i));
        }
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "原料管理", type = "锁定库存", description = "锁定原料库存")
    public void lockStock(Long materialId, Integer quantity, Long workOrderId) {
        HornMaterial material = hornMaterialMapper.selectById(materialId);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        if (material.getQuantity() < quantity) {
            throw new BusinessException("原料库存不足，无法锁定");
        }
        if (Constants.STOCK_STATUS_OUT.equals(material.getStockStatus())) {
            throw new BusinessException("原料已断货，无法锁定");
        }

        int newQuantity = material.getQuantity() - quantity;
        material.setQuantity(newQuantity);
        material.setTotalPrice(material.getUnitPrice().multiply(new BigDecimal(newQuantity)));
        updateStockStatus(material);
        hornMaterialMapper.updateById(material);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "原料管理", type = "解锁库存", description = "解锁原料库存")
    public void unlockStock(Long materialId, Integer quantity) {
        HornMaterial material = hornMaterialMapper.selectById(materialId);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }

        int newQuantity = material.getQuantity() + quantity;
        material.setQuantity(newQuantity);
        material.setTotalPrice(material.getUnitPrice().multiply(new BigDecimal(newQuantity)));
        updateStockStatus(material);
        hornMaterialMapper.updateById(material);
    }

    private void updateStockStatus(HornMaterial material) {
        if (material.getQuantity() <= 0) {
            material.setStockStatus(Constants.STOCK_STATUS_OUT);
        } else if (material.getQuantity() <= material.getWarningQuantity()) {
            material.setStockStatus(Constants.STOCK_STATUS_WARNING);
        } else {
            material.setStockStatus(Constants.STOCK_STATUS_NORMAL);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "原料管理", type = "删除", description = "删除牛角原料")
    public void delete(Long id) {
        hornMaterialMapper.deleteById(id);
    }
}
