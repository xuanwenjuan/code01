package com.heritage.dye.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.heritage.dye.common.BusinessException;
import com.heritage.dye.mapper.SupplyLedgerMapper;
import com.heritage.dye.po.SupplyLedgerPO;
import com.heritage.dye.vo.SupplyLedgerVO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SupplyLedgerService extends ServiceImpl<SupplyLedgerMapper, SupplyLedgerPO> {

    public Page<SupplyLedgerVO> page(Integer pageNum, Integer pageSize, LocalDate startDate, LocalDate endDate,
                                      Long dyeCategoryId, Long materialOriginId) {
        Page<SupplyLedgerPO> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<SupplyLedgerPO> wrapper = new LambdaQueryWrapper<>();
        if (startDate != null) {
            wrapper.ge(SupplyLedgerPO::getStatisticsDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(SupplyLedgerPO::getStatisticsDate, endDate);
        }
        if (dyeCategoryId != null) {
            wrapper.eq(SupplyLedgerPO::getDyeCategoryId, dyeCategoryId);
        }
        if (materialOriginId != null) {
            wrapper.eq(SupplyLedgerPO::getMaterialOriginId, materialOriginId);
        }
        wrapper.orderByDesc(SupplyLedgerPO::getStatisticsDate);
        Page<SupplyLedgerPO> result = baseMapper.selectPage(page, wrapper);
        Page<SupplyLedgerVO> voPage = new Page<>(result.getCurrent(), result.getSize(), result.getTotal());
        voPage.setRecords(result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList()));
        return voPage;
    }

    public SupplyLedgerVO getById(Long id) {
        SupplyLedgerPO po = baseMapper.selectById(id);
        if (po == null) {
            throw new BusinessException("台账记录不存在");
        }
        return convertToVO(po);
    }

    private SupplyLedgerVO convertToVO(SupplyLedgerPO po) {
        SupplyLedgerVO vo = new SupplyLedgerVO();
        BeanUtils.copyProperties(po, vo);
        return vo;
    }

    public Map<String, Object> getStatistics(LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<SupplyLedgerPO> wrapper = new LambdaQueryWrapper<>();
        if (startDate != null) {
            wrapper.ge(SupplyLedgerPO::getStatisticsDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(SupplyLedgerPO::getStatisticsDate, endDate);
        }
        List<SupplyLedgerPO> list = baseMapper.selectList(wrapper);

        BigDecimal totalMaterial = list.stream()
                .map(SupplyLedgerPO::getMaterialConsumption)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalOutput = list.stream()
                .map(SupplyLedgerPO::getProductOutput)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalLoss = list.stream()
                .map(SupplyLedgerPO::getTotalLoss)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalRevenue = list.stream()
                .map(SupplyLedgerPO::getSalesRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCost = list.stream()
                .map(SupplyLedgerPO::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal lossRate = totalMaterial.compareTo(BigDecimal.ZERO) > 0
                ? totalLoss.divide(totalMaterial, 4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Map<String, Object> result = new HashMap<>();
        result.put("totalMaterial", totalMaterial);
        result.put("totalOutput", totalOutput);
        result.put("totalLoss", totalLoss);
        result.put("totalLossRate", lossRate);
        result.put("totalCost", totalCost);
        result.put("totalRevenue", totalRevenue);
        result.put("profit", totalRevenue.subtract(totalCost));
        result.put("soakLoss", list.stream().map(SupplyLedgerPO::getSoakLoss)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        result.put("boilLoss", list.stream().map(SupplyLedgerPO::getBoilLoss)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        result.put("filterLoss", list.stream().map(SupplyLedgerPO::getFilterLoss)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        result.put("concentrateLoss", list.stream().map(SupplyLedgerPO::getConcentrateLoss)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        result.put("packageLoss", list.stream().map(SupplyLedgerPO::getPackageLoss)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        result.put("details", list.stream().map(this::convertToVO).collect(Collectors.toList()));
        return result;
    }
}
