package com.snack.processing.service;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.snack.processing.annotation.OperationLog;
import com.snack.processing.common.Result;
import com.snack.processing.common.ResultCode;
import com.snack.processing.dto.quality.QualityInspectionAddDTO;
import com.snack.processing.dto.quality.QualityInspectionQueryDTO;
import com.snack.processing.entity.QualityInspection;
import com.snack.processing.exception.BusinessException;
import com.snack.processing.mapper.QualityInspectionMapper;
import com.snack.processing.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class QualityInspectionService extends ServiceImpl<QualityInspectionMapper, QualityInspection> {

    private final QualityInspectionMapper inspectionMapper;

    @OperationLog(module = "质量管理", operation = "新增质检记录", description = "新增质量检验记录")
    @Transactional(rollbackFor = Exception.class)
    public Result<QualityInspection> addInspection(QualityInspectionAddDTO dto) {
        String inspectionNo = generateInspectionNo();

        QualityInspection inspection = new QualityInspection();
        inspection.setInspectionNo(inspectionNo);
        inspection.setWorkOrderId(dto.getWorkOrderId());
        inspection.setWorkOrderNo(dto.getWorkOrderNo());
        inspection.setProcessCode(dto.getProcessCode());
        inspection.setProcessName(dto.getProcessName());
        inspection.setInspectionType(dto.getInspectionType());
        inspection.setInspectionResult(dto.getInspectionResult());
        inspection.setSampleQuantity(dto.getSampleQuantity());
        inspection.setQualifiedQuantity(dto.getQualifiedQuantity());
        inspection.setUnqualifiedQuantity(dto.getUnqualifiedQuantity());
        inspection.setUnqualifiedReason(dto.getUnqualifiedReason());
        inspection.setInspectorId(dto.getInspectorId() != null ? dto.getInspectorId() : SecurityUtil.getCurrentUserId());
        inspection.setInspectorName(dto.getInspectorName());
        inspection.setInspectionTime(dto.getInspectionTime() != null ? dto.getInspectionTime() : LocalDateTime.now());
        inspection.setRemark(dto.getRemark());

        inspectionMapper.insert(inspection);
        return Result.success(inspection);
    }

    public Result<QualityInspection> getInspectionById(Long id) {
        QualityInspection inspection = inspectionMapper.selectById(id);
        if (inspection == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }
        return Result.success(inspection);
    }

    public Result<IPage<QualityInspection>> getInspectionPage(QualityInspectionQueryDTO dto) {
        LambdaQueryWrapper<QualityInspection> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(dto.getInspectionNo() != null, QualityInspection::getInspectionNo, dto.getInspectionNo())
                .eq(dto.getWorkOrderId() != null, QualityInspection::getWorkOrderId, dto.getWorkOrderId())
                .like(dto.getWorkOrderNo() != null, QualityInspection::getWorkOrderNo, dto.getWorkOrderNo())
                .eq(dto.getInspectionType() != null, QualityInspection::getInspectionType, dto.getInspectionType())
                .eq(dto.getInspectionResult() != null, QualityInspection::getInspectionResult, dto.getInspectionResult())
                .ge(dto.getInspectionTimeStart() != null, QualityInspection::getInspectionTime, dto.getInspectionTimeStart())
                .le(dto.getInspectionTimeEnd() != null, QualityInspection::getInspectionTime, dto.getInspectionTimeEnd())
                .orderByDesc(QualityInspection::getInspectionTime);

        IPage<QualityInspection> page = inspectionMapper.selectPage(dto.buildPage(), wrapper);
        return Result.success(page);
    }

    private String generateInspectionNo() {
        String datePart = DateUtil.format(DateUtil.date(), "yyyyMMdd");
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "QI" + datePart + uuid;
    }
}
