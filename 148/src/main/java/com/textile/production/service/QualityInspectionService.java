package com.textile.production.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.textile.production.common.Result;
import com.textile.production.common.ResultCode;
import com.textile.production.entity.QualityInspection;
import com.textile.production.exception.BusinessException;
import com.textile.production.mapper.QualityInspectionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QualityInspectionService extends ServiceImpl<QualityInspectionMapper, QualityInspection> {

    private final ProductionLogService logService;

    @Transactional(rollbackFor = Exception.class)
    public Result<QualityInspection> addInspection(QualityInspection inspection) {
        if (inspection.getInspectQuantity() != null && inspection.getInspectQuantity().compareTo(BigDecimal.ZERO) > 0) {
            if (inspection.getQualifiedQuantity() == null) {
                inspection.setQualifiedQuantity(BigDecimal.ZERO);
            }
            if (inspection.getDefectiveQuantity() == null) {
                inspection.setDefectiveQuantity(BigDecimal.ZERO);
            }

            BigDecimal passRate = inspection.getQualifiedQuantity()
                    .multiply(new BigDecimal("100"))
                    .divide(inspection.getInspectQuantity(), 2, RoundingMode.HALF_UP);
            inspection.setPassRate(passRate);

            if (inspection.getInspectResult() == null) {
                inspection.setInspectResult(passRate.compareTo(new BigDecimal("95")) >= 0 ? 1 : 0);
            }
        }

        save(inspection);

        logService.log(inspection.getOrderId(), inspection.getProcessId(),
                "质检", "完成" + inspection.getInspectType() + "，合格率: " + inspection.getPassRate() + "%",
                null, inspection.getInspectResult() == 1 ? "合格" : "不合格");

        return Result.success("质检记录添加成功", inspection);
    }

    public Result<IPage<QualityInspection>> getPage(Integer pageNum, Integer pageSize,
                                                     Long orderId, String inspectType,
                                                     Integer inspectResult) {
        LambdaQueryWrapper<QualityInspection> wrapper = new LambdaQueryWrapper<>();
        if (orderId != null) {
            wrapper.eq(QualityInspection::getOrderId, orderId);
        }
        if (inspectType != null && !inspectType.isEmpty()) {
            wrapper.eq(QualityInspection::getInspectType, inspectType);
        }
        if (inspectResult != null) {
            wrapper.eq(QualityInspection::getInspectResult, inspectResult);
        }
        wrapper.orderByDesc(QualityInspection::getCreateTime);

        Page<QualityInspection> page = new Page<>(pageNum, pageSize);
        return Result.success(page(page, wrapper));
    }

    public Result<List<QualityInspection>> getInspectionsByOrderId(Long orderId) {
        LambdaQueryWrapper<QualityInspection> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(QualityInspection::getOrderId, orderId)
                .orderByDesc(QualityInspection::getCreateTime);
        return Result.success(list(wrapper));
    }

    public Result<QualityInspection> getInspectionById(Long id) {
        QualityInspection inspection = getById(id);
        if (inspection == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        return Result.success(inspection);
    }
}
