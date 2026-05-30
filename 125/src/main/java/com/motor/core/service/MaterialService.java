package com.motor.core.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.motor.core.common.BusinessException;
import com.motor.core.dto.MaterialQueryDTO;
import com.motor.core.entity.po.MaterialPO;
import com.motor.core.mapper.MaterialMapper;
import com.motor.core.vo.MaterialVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class MaterialService extends ServiceImpl<MaterialMapper, MaterialPO> {
    private final MaterialMapper materialMapper;

    public Page<MaterialVO> queryByConditions(MaterialQueryDTO queryDTO) {
        Page<MaterialPO> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());
        Page<MaterialPO> poPage = materialMapper.queryByConditions(page, queryDTO);
        return poPage.convert(this::convertToVO);
    }

    public MaterialVO getDetailById(Long id) {
        MaterialPO po = getById(id);
        if (po == null) {
            throw new BusinessException("物料不存在");
        }
        return convertToVO(po);
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean stockIn(Long id, BigDecimal quantity, String remark) {
        MaterialPO material = getById(id);
        if (material == null) {
            throw new BusinessException("物料不存在");
        }

        material.setQuantity(material.getQuantity().add(quantity));
        updateStockStatus(material);
        return updateById(material);
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean lockStock(Long id, BigDecimal quantity) {
        int rows = materialMapper.lockMaterialStock(id, quantity);
        if (rows <= 0) {
            throw new BusinessException("物料库存不足，锁定失败");
        }

        MaterialPO material = getById(id);
        updateStockStatus(material);
        return true;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean unlockStock(Long id, BigDecimal quantity) {
        int rows = materialMapper.unlockMaterialStock(id, quantity);
        if (rows <= 0) {
            throw new BusinessException("解锁失败，锁定数量不足");
        }

        MaterialPO material = getById(id);
        updateStockStatus(material);
        return true;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean deductStock(Long id, BigDecimal quantity) {
        int rows = materialMapper.deductMaterialStock(id, quantity);
        if (rows <= 0) {
            throw new BusinessException("扣减库存失败，锁定数量不足");
        }

        MaterialPO material = getById(id);
        updateStockStatus(material);
        return true;
    }

    private void updateStockStatus(MaterialPO material) {
        BigDecimal available = material.getQuantity().subtract(
            material.getLockedQuantity() != null ? material.getLockedQuantity() : BigDecimal.ZERO
        );

        if (material.getWarningQuantity() != null && available.compareTo(material.getWarningQuantity()) <= 0) {
            material.setStockStatus(2);
        } else {
            material.setStockStatus(1);
        }
        updateById(material);
    }

    private MaterialVO convertToVO(MaterialPO po) {
        MaterialVO vo = new MaterialVO();
        BeanUtils.copyProperties(po, vo);

        switch (po.getStockStatus()) {
            case 1 -> vo.setStockStatusDesc("库存充足");
            case 2 -> vo.setStockStatusDesc("库存预警");
            case 3 -> vo.setStockStatusDesc("停止采购");
            default -> vo.setStockStatusDesc("未知");
        }

        BigDecimal locked = po.getLockedQuantity() != null ? po.getLockedQuantity() : BigDecimal.ZERO;
        vo.setAvailableQuantity(po.getQuantity().subtract(locked));

        if (po.getProductionDate() != null && po.getShelfLifeDays() != null) {
            LocalDate expireDate = po.getProductionDate().plusDays(po.getShelfLifeDays());
            vo.setRemainingDays((int) ChronoUnit.DAYS.between(LocalDate.now(), expireDate));
        }

        return vo;
    }
}
