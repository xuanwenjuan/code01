package com.valve.manufacture.service;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.valve.manufacture.entity.QualityInspection;
import com.valve.manufacture.exception.BusinessException;
import com.valve.manufacture.mapper.QualityInspectionMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class QualityInspectionService extends ServiceImpl<QualityInspectionMapper, QualityInspection> {

    public QualityInspection create(QualityInspection inspection) {
        String inspectionNo = generateInspectionNo();
        inspection.setInspectionNo(inspectionNo);
        inspection.setInspectionTime(LocalDateTime.now());

        if (inspection.getQualifiedQuantity() == null) {
            inspection.setQualifiedQuantity(0);
        }
        if (inspection.getUnqualifiedQuantity() == null) {
            inspection.setUnqualifiedQuantity(0);
        }
        if (inspection.getScrapQuantity() == null) {
            inspection.setScrapQuantity(0);
        }

        save(inspection);
        return inspection;
    }

    private String generateInspectionNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = IdUtil.randomUUID().substring(0, 8).toUpperCase();
        return "QI-" + dateStr + "-" + random;
    }

    public List<QualityInspection> getByWorkOrderId(Long workOrderId) {
        return list(new LambdaQueryWrapper<QualityInspection>()
                .eq(QualityInspection::getWorkOrderId, workOrderId)
                .eq(QualityInspection::getDeleted, 0)
                .orderByDesc(QualityInspection::getCreateTime));
    }
}
