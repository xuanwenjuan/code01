package com.snacktrace.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.snacktrace.entity.WorkOrderMaterialLoss;
import com.snacktrace.mapper.WorkOrderMaterialLossMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class WorkOrderMaterialLossService extends ServiceImpl<WorkOrderMaterialLossMapper, WorkOrderMaterialLoss> {

    @Transactional(rollbackFor = Exception.class)
    public boolean recordLoss(Long workOrderId, Long materialId, Long batchId,
                               BigDecimal planQuantity, BigDecimal actualUsedQuantity,
                               String lossReason, Integer lossType,
                               Long operatorId, String operatorName) {
        BigDecimal lossQuantity = actualUsedQuantity.subtract(planQuantity);
        if (lossQuantity.compareTo(BigDecimal.ZERO) <= 0) {
            lossQuantity = BigDecimal.ZERO;
        }

        BigDecimal lossRate = planQuantity.compareTo(BigDecimal.ZERO) > 0
                ? lossQuantity.divide(planQuantity, 4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        WorkOrderMaterialLoss loss = new WorkOrderMaterialLoss();
        loss.setWorkOrderId(workOrderId);
        loss.setMaterialId(materialId);
        loss.setBatchId(batchId);
        loss.setPlanQuantity(planQuantity);
        loss.setActualUsedQuantity(actualUsedQuantity);
        loss.setLossQuantity(lossQuantity);
        loss.setLossRate(lossRate);
        loss.setLossReason(lossReason);
        loss.setLossType(lossType);
        loss.setOperatorId(operatorId);
        loss.setOperatorName(operatorName);
        loss.setCreateTime(LocalDateTime.now());
        loss.setUpdateTime(LocalDateTime.now());

        return save(loss);
    }

    public BigDecimal getTotalLossByWorkOrderId(Long workOrderId) {
        return baseMapper.sumLossQuantityByWorkOrderId(workOrderId);
    }

    public Map<Long, BigDecimal> getLossStatisticsByDate(LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = baseMapper.sumLossByMaterialAndDate(startDate, endDate);
        Map<Long, BigDecimal> lossMap = new HashMap<>();
        for (Object[] row : results) {
            Long materialId = ((Number) row[0]).longValue();
            BigDecimal totalLoss = (BigDecimal) row[1];
            lossMap.put(materialId, totalLoss);
        }
        return lossMap;
    }

    public List<WorkOrderMaterialLoss> getLossListByWorkOrderId(Long workOrderId) {
        LambdaQueryWrapper<WorkOrderMaterialLoss> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrderMaterialLoss::getWorkOrderId, workOrderId)
               .orderByDesc(WorkOrderMaterialLoss::getCreateTime);
        return list(wrapper);
    }
}
