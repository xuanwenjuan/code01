package com.fan.impeller.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fan.impeller.common.PageQuery;
import com.fan.impeller.context.UserContext;
import com.fan.impeller.dto.QualityInspectionDTO;
import com.fan.impeller.entity.ProductionCost;
import com.fan.impeller.entity.QualityInspection;
import com.fan.impeller.entity.WorkOrder;
import com.fan.impeller.exception.BusinessException;
import com.fan.impeller.mapper.QualityInspectionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class QualityInspectionService extends ServiceImpl<QualityInspectionMapper, QualityInspection> {

    private final WorkOrderService workOrderService;
    private final ProductionCostService productionCostService;

    @Cacheable(value = "inspectionPage", key = "#query.pageNum + '-' + #query.pageSize + '-' + #workOrderId + '-' + #result", unless = "#result == null")
    public Page<QualityInspection> page(PageQuery query, Long workOrderId, Integer result) {
        return lambdaQuery()
                .eq(workOrderId != null, QualityInspection::getWorkOrderId, workOrderId)
                .eq(result != null, QualityInspection::getResult, result)
                .orderByDesc(QualityInspection::getCreateTime)
                .page(new Page<>(query.getPageNum(), query.getPageSize()));
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = {"inspectionPage", "inspectionDetail", "costReport", "costAnalysis"}, allEntries = true)
    public void createInspection(QualityInspectionDTO dto) {
        WorkOrder workOrder = workOrderService.getById(dto.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        QualityInspection inspection = new QualityInspection();
        inspection.setWorkOrderId(dto.getWorkOrderId());
        inspection.setStep(dto.getStep());
        inspection.setStepName(dto.getStepName());
        inspection.setTotalQuantity(dto.getTotalQuantity());
        inspection.setQualifiedQuantity(dto.getQualifiedQuantity());
        inspection.setUnqualifiedReason(dto.getUnqualifiedReason());
        inspection.setScrapQuantity(dto.getScrapQuantity());
        inspection.setReworkQuantity(dto.getReworkQuantity());
        inspection.setResult(dto.getResult());
        inspection.setRemark(dto.getRemark());

        inspection.setWorkOrderNo(workOrder.getOrderNo());
        inspection.setInspectorId(UserContext.getUserId());
        inspection.setInspectorName(UserContext.getUsername());
        inspection.setInspectionTime(LocalDateTime.now());

        if (inspection.getTotalQuantity() != null && inspection.getQualifiedQuantity() != null) {
            inspection.setUnqualifiedQuantity(
                    inspection.getTotalQuantity().subtract(inspection.getQualifiedQuantity())
            );
        }

        save(inspection);

        if (inspection.getResult() == 1) {
            workOrderService.nextStep(workOrder.getId(), workOrder.getCurrentStep() + 1, "质检通过");

            if (workOrder.getCurrentStep() + 1 >= 7) {
                try {
                    productionCostService.generateCostReport(workOrder.getId(), null);
                } catch (Exception e) {
                    throw new BusinessException("成本计算失败：" + e.getMessage());
                }
            }
        }
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = {"inspectionPage", "inspectionDetail", "costReport", "costAnalysis"}, allEntries = true)
    public void createInspection(QualityInspection inspection) {
        WorkOrder workOrder = workOrderService.getById(inspection.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        inspection.setWorkOrderNo(workOrder.getOrderNo());
        inspection.setInspectorId(UserContext.getUserId());
        inspection.setInspectorName(UserContext.getUsername());
        inspection.setInspectionTime(LocalDateTime.now());

        if (inspection.getTotalQuantity() != null && inspection.getQualifiedQuantity() != null) {
            inspection.setUnqualifiedQuantity(
                    inspection.getTotalQuantity().subtract(inspection.getQualifiedQuantity())
            );
        }

        save(inspection);

        if (inspection.getResult() == 1) {
            workOrderService.nextStep(workOrder.getId(), workOrder.getCurrentStep() + 1, "质检通过");
        }
    }

    @Cacheable(value = "qualityStatistics", unless = "#result == null")
    public Map<String, Object> getQualityStatistics() {
        Map<String, Object> stats = new HashMap<>();
        long total = count();
        long qualified = count(new LambdaQueryWrapper<QualityInspection>().eq(QualityInspection::getResult, 1));
        long unqualified = count(new LambdaQueryWrapper<QualityInspection>().eq(QualityInspection::getResult, 2));
        long rework = count(new LambdaQueryWrapper<QualityInspection>().eq(QualityInspection::getResult, 3));

        stats.put("totalCount", total);
        stats.put("qualifiedCount", qualified);
        stats.put("unqualifiedCount", unqualified);
        stats.put("reworkCount", rework);
        stats.put("passRate", total > 0 ? new BigDecimal(qualified).divide(new BigDecimal(total), 4, BigDecimal.ROUND_HALF_UP).multiply(new BigDecimal(100)) + "%" : "0%");

        return stats;
    }

    @Cacheable(value = "inspectionDetail", key = "#id", unless = "#result == null")
    public QualityInspection getDetailById(Long id) {
        return getById(id);
    }
}
