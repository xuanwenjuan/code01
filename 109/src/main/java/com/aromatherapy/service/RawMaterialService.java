package com.aromatherapy.service;

import com.aromatherapy.entity.dto.MaterialStockInDTO;
import com.aromatherapy.entity.dto.RawMaterialQueryDTO;
import com.aromatherapy.entity.po.RawMaterialPO;
import com.aromatherapy.entity.vo.RawMaterialVO;
import com.aromatherapy.exception.BusinessException;
import com.aromatherapy.mapper.RawMaterialMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RawMaterialService {

    private final RawMaterialMapper rawMaterialMapper;

    public Page<RawMaterialVO> queryPage(RawMaterialQueryDTO dto) {
        LambdaQueryWrapper<RawMaterialPO> wrapper = new LambdaQueryWrapper<>();
        
        if (dto.getMaterialName() != null && !dto.getMaterialName().isEmpty()) {
            wrapper.like(RawMaterialPO::getMaterialName, dto.getMaterialName());
        }
        
        if (dto.getExtractionProcess() != null && !dto.getExtractionProcess().isEmpty()) {
            wrapper.eq(RawMaterialPO::getExtractionProcess, dto.getExtractionProcess());
        }
        
        if (dto.getStockStatus() != null) {
            wrapper.eq(RawMaterialPO::getStockStatus, dto.getStockStatus());
        }
        
        if (dto.getStatus() != null) {
            wrapper.eq(RawMaterialPO::getStatus, dto.getStatus());
        }
        
        wrapper.orderByDesc(RawMaterialPO::getCreateTime);
        
        Page<RawMaterialPO> page = new Page<>(dto.getPageNum(), dto.getPageSize());
        Page<RawMaterialPO> poPage = rawMaterialMapper.selectPage(page, wrapper);
        
        Page<RawMaterialVO> voPage = new Page<>(poPage.getCurrent(), poPage.getSize(), poPage.getTotal());
        List<RawMaterialVO> voList = new ArrayList<>();
        
        for (RawMaterialPO po : poPage.getRecords()) {
            RawMaterialVO vo = convertToVO(po);
            voList.add(vo);
        }
        voPage.setRecords(voList);
        return voPage;
    }

    @Transactional(rollbackFor = Exception.class)
    public void stockIn(MaterialStockInDTO dto) {
        RawMaterialPO exist = rawMaterialMapper.selectOne(
            new LambdaQueryWrapper<RawMaterialPO>().eq(RawMaterialPO::getBatchCode, dto.getBatchCode())
        );
        if (exist != null) {
            throw new BusinessException("批次号已存在");
        }
        
        RawMaterialPO po = new RawMaterialPO();
        BeanUtils.copyProperties(dto, po);
        po.setStockQuantity(dto.getQuantity());
        po.setLockedQuantity(BigDecimal.ZERO);
        po.setExpiryDate(dto.getProductionDate().plusDays(dto.getShelfLife()));
        po.setStockStatus(calculateStockStatus(dto.getQuantity(), dto.getWarningQuantity()));
        
        rawMaterialMapper.insert(po);
        log.info("原料入库成功：批次号={}, 原料名称={}, 数量={}", dto.getBatchCode(), dto.getMaterialName(), dto.getQuantity());
    }

    @Transactional(rollbackFor = Exception.class)
    public void lockStock(Long rawMaterialId, BigDecimal quantity) {
        RawMaterialPO material = rawMaterialMapper.selectById(rawMaterialId);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        
        BigDecimal availableStock = material.getStockQuantity().subtract(material.getLockedQuantity());
        if (availableStock.compareTo(quantity) < 0) {
            throw new BusinessException("库存不足，可用：" + availableStock + "，需要：" + quantity);
        }
        
        material.setLockedQuantity(material.getLockedQuantity().add(quantity));
        material.setStockStatus(calculateStockStatus(material.getStockQuantity(), material.getWarningQuantity()));
        rawMaterialMapper.updateById(material);
        
        log.info("锁定原料库存：原料ID={}, 锁定数量={}, 当前锁定总量={}", rawMaterialId, quantity, material.getLockedQuantity());
    }

    @Transactional(rollbackFor = Exception.class)
    public void unlockStock(Long rawMaterialId, BigDecimal quantity) {
        RawMaterialPO material = rawMaterialMapper.selectById(rawMaterialId);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        
        if (material.getLockedQuantity().compareTo(quantity) < 0) {
            throw new BusinessException("解锁数量超过锁定数量");
        }
        
        material.setLockedQuantity(material.getLockedQuantity().subtract(quantity));
        material.setStockStatus(calculateStockStatus(material.getStockQuantity(), material.getWarningQuantity()));
        rawMaterialMapper.updateById(material);
        
        log.info("解锁原料库存：原料ID={}, 解锁数量={}, 当前锁定总量={}", rawMaterialId, quantity, material.getLockedQuantity());
    }

    @Transactional(rollbackFor = Exception.class)
    public void deductStock(Long rawMaterialId, BigDecimal quantity) {
        RawMaterialPO material = rawMaterialMapper.selectById(rawMaterialId);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        
        if (material.getLockedQuantity().compareTo(quantity) < 0) {
            throw new BusinessException("锁定库存不足");
        }
        
        material.setStockQuantity(material.getStockQuantity().subtract(quantity));
        material.setLockedQuantity(material.getLockedQuantity().subtract(quantity));
        material.setStockStatus(calculateStockStatus(material.getStockQuantity(), material.getWarningQuantity()));
        rawMaterialMapper.updateById(material);
        
        log.info("扣减原料库存：原料ID={}, 扣减数量={}, 剩余库存={}", rawMaterialId, quantity, material.getStockQuantity());
    }

    public RawMaterialVO getById(Long id) {
        RawMaterialPO po = rawMaterialMapper.selectById(id);
        if (po == null) {
            return null;
        }
        return convertToVO(po);
    }

    private RawMaterialVO convertToVO(RawMaterialPO po) {
        RawMaterialVO vo = new RawMaterialVO();
        BeanUtils.copyProperties(po, vo);
        vo.setStatusDesc(getStatusDesc(po.getStatus()));
        vo.setStockStatusDesc(getStockStatusDesc(po.getStockStatus()));
        return vo;
    }

    private String getStatusDesc(Integer status) {
        if (status == null) return "未知";
        return switch (status) {
            case 0 -> "过期停用";
            case 1 -> "正常";
            case 2 -> "临期";
            default -> "未知";
        };
    }

    private String getStockStatusDesc(Integer stockStatus) {
        if (stockStatus == null) return "未知";
        return switch (stockStatus) {
            case 0 -> "不足";
            case 1 -> "充足";
            case 2 -> "盈余";
            default -> "未知";
        };
    }

    private Integer calculateStockStatus(BigDecimal stock, BigDecimal warning) {
        if (stock == null) stock = BigDecimal.ZERO;
        if (warning == null) warning = BigDecimal.ZERO;
        
        int compare = stock.compareTo(warning);
        if (compare < 0) {
            return 0;
        } else if (compare == 0) {
            return 1;
        } else {
            BigDecimal doubleWarning = warning.multiply(new BigDecimal("2"));
            return stock.compareTo(doubleWarning) >= 0 ? 2 : 1;
        }
    }
}
