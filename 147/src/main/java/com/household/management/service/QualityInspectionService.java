package com.household.management.service;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.household.management.common.entity.PageQuery;
import com.household.management.common.exception.BusinessException;
import com.household.management.common.result.ResultCode;
import com.household.management.entity.QualityInspection;
import com.household.management.mapper.QualityInspectionMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class QualityInspectionService {

    private final QualityInspectionMapper inspectionMapper;

    public QualityInspectionService(QualityInspectionMapper inspectionMapper) {
        this.inspectionMapper = inspectionMapper;
    }

    public IPage<QualityInspection> page(PageQuery pageQuery, String inspectionType, Integer status, Integer result) {
        LambdaQueryWrapper<QualityInspection> wrapper = new LambdaQueryWrapper<>();
        if (inspectionType != null && !inspectionType.isEmpty()) {
            wrapper.eq(QualityInspection::getInspectionType, inspectionType);
        }
        if (status != null) {
            wrapper.eq(QualityInspection::getStatus, status);
        }
        if (result != null) {
            wrapper.eq(QualityInspection::getInspectionResult, result);
        }
        wrapper.orderByDesc(QualityInspection::getCreateTime);
        return inspectionMapper.selectPage(new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()), wrapper);
    }

    public List<QualityInspection> list() {
        return inspectionMapper.selectInspectionList();
    }

    public QualityInspection getById(Long id) {
        QualityInspection inspection = inspectionMapper.selectInspectionDetail(id);
        if (inspection == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        return inspection;
    }

    @Transactional(rollbackFor = Exception.class)
    public void createInspection(QualityInspection inspection) {
        String inspectionNo = generateInspectionNo();
        inspection.setInspectionNo(inspectionNo);
        inspection.setStatus(1);
        inspectionMapper.insert(inspection);
        log.info("创建品质巡检单：{} - {}", inspectionNo, inspection.getInspectionType());
    }

    @Transactional(rollbackFor = Exception.class)
    public void submitInspection(Long id, Long inspectorId, Integer result, String items,
                                 String defectiveDesc, String handlingSuggestion) {
        QualityInspection inspection = inspectionMapper.selectById(id);
        if (inspection == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (inspection.getStatus() != 1) {
            throw new BusinessException("该巡检单已处理");
        }

        inspection.setInspectorId(inspectorId);
        inspection.setInspectionTime(LocalDateTime.now());
        inspection.setInspectionResult(result);
        inspection.setInspectionItems(items);
        inspection.setDefectiveDescription(defectiveDesc);
        inspection.setHandlingSuggestion(handlingSuggestion);
        inspection.setStatus(2);
        inspectionMapper.updateById(inspection);

        log.info("提交品质巡检结果：{}，结果：{}", inspection.getInspectionNo(), result == 1 ? "合格" : "不合格");
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateInspection(QualityInspection inspection) {
        QualityInspection existing = inspectionMapper.selectById(inspection.getId());
        if (existing == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (existing.getStatus() != 1) {
            throw new BusinessException("已处理的巡检单无法修改");
        }
        inspectionMapper.updateById(inspection);
        log.info("更新品质巡检单：{}", existing.getInspectionNo());
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteInspection(Long id) {
        QualityInspection inspection = inspectionMapper.selectById(id);
        if (inspection == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (inspection.getStatus() == 2) {
            throw new BusinessException("已处理的巡检单无法删除");
        }
        inspectionMapper.deleteById(id);
        log.info("删除品质巡检单：{}", inspection.getInspectionNo());
    }

    private String generateInspectionNo() {
        String dateStr = DateUtil.format(DateUtil.date(), "yyyyMMdd");
        String uuid = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "QI" + dateStr + uuid;
    }
}
