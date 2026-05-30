package com.radiator.management.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.radiator.management.entity.FinishedStock;
import com.radiator.management.entity.QualityInspection;
import com.radiator.management.entity.QualityInspectionDetail;
import com.radiator.management.exception.BusinessException;
import com.radiator.management.mapper.FinishedStockMapper;
import com.radiator.management.mapper.QualityInspectionDetailMapper;
import com.radiator.management.mapper.QualityInspectionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QualityInspectionService {

    private final QualityInspectionMapper inspectionMapper;
    private final QualityInspectionDetailMapper detailMapper;
    private final FinishedStockMapper finishedStockMapper;

    @Transactional(rollbackFor = Exception.class)
    public void createInspection(QualityInspection inspection) {
        String inspectionNo = "QI" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        inspection.setInspectionNo(inspectionNo);
        inspection.setStatus("PENDING");
        inspectionMapper.insert(inspection);

        if (inspection.getDetails() != null) {
            for (QualityInspectionDetail detail : inspection.getDetails()) {
                detail.setInspectionId(inspection.getId());
                detailMapper.insert(detail);
            }
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void approveInspection(Long id, Long inspectorId, String inspectorName, String result) {
        QualityInspection inspection = inspectionMapper.selectById(id);
        if (inspection == null) {
            throw new BusinessException("质检单不存在");
        }
        if (!"PENDING".equals(inspection.getStatus())) {
            throw new BusinessException("只有待检验的质检单可以审核");
        }

        inspection.setInspectorId(inspectorId);
        inspection.setInspectorName(inspectorName);
        inspection.setInspectionTime(LocalDateTime.now());
        inspection.setInspectionResult(result);
        inspection.setStatus("COMPLETED");
        inspectionMapper.updateById(inspection);

        if ("PASS".equals(result)) {
            createFinishedStock(inspection);
        }
    }

    private void createFinishedStock(QualityInspection inspection) {
        String batchNo = "FS" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        FinishedStock stock = new FinishedStock();
        stock.setWorkOrderId(inspection.getWorkOrderId());
        stock.setWorkOrderNo(inspection.getWorkOrderNo());
        stock.setCategoryId(inspection.getCategoryId());
        stock.setCategoryName(inspection.getCategoryName());
        stock.setProductCode(inspection.getCategoryId() + "-" + batchNo);
        stock.setProductName(inspection.getCategoryName());
        stock.setQuantity(inspection.getQualifiedQuantity());
        stock.setBatchNo(batchNo);
        stock.setQualityLevel("A");
        stock.setInspectorId(inspection.getInspectorId());
        stock.setStorageTime(LocalDateTime.now());
        finishedStockMapper.insert(stock);
    }

    @Transactional(rollbackFor = Exception.class)
    public void rejectInspection(Long id, String remark) {
        QualityInspection inspection = inspectionMapper.selectById(id);
        if (inspection == null) {
            throw new BusinessException("质检单不存在");
        }
        inspection.setStatus("REJECTED");
        inspection.setRemark(remark);
        inspectionMapper.updateById(inspection);
    }

    public Page<QualityInspection> listInspections(int page, int size, String status, String type) {
        LambdaQueryWrapper<QualityInspection> wrapper = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            wrapper.eq(QualityInspection::getStatus, status);
        }
        if (type != null && !type.isEmpty()) {
            wrapper.eq(QualityInspection::getInspectionType, type);
        }
        wrapper.orderByDesc(QualityInspection::getCreateTime);
        return inspectionMapper.selectPage(new Page<>(page, size), wrapper);
    }

    public QualityInspection getInspectionById(Long id) {
        QualityInspection inspection = inspectionMapper.selectById(id);
        if (inspection != null) {
            List<QualityInspectionDetail> details = detailMapper.selectList(
                    new LambdaQueryWrapper<QualityInspectionDetail>().eq(QualityInspectionDetail::getInspectionId, id)
            );
            inspection.setDetails(details);
        }
        return inspection;
    }

    public List<QualityInspectionDetail> getInspectionDetails(Long inspectionId) {
        return detailMapper.selectList(
                new LambdaQueryWrapper<QualityInspectionDetail>().eq(QualityInspectionDetail::getInspectionId, inspectionId)
        );
    }
}
