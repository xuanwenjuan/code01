package com.gearbox.manage.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gearbox.manage.context.UserContext;
import com.gearbox.manage.dto.InspectionDTO;
import com.gearbox.manage.entity.QualityInspection;
import com.gearbox.manage.entity.SysUser;
import com.gearbox.manage.entity.WorkOrder;
import com.gearbox.manage.exception.BusinessException;
import com.gearbox.manage.mapper.QualityInspectionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QualityInspectionService extends ServiceImpl<QualityInspectionMapper, QualityInspection> {

    private final WorkOrderService workOrderService;
    private final SysUserService sysUserService;
    private final CostAccountingService costAccountingService;

    public List<QualityInspection> listByWorkOrderId(Long workOrderId) {
        return lambdaQuery()
                .eq(QualityInspection::getWorkOrderId, workOrderId)
                .orderByDesc(QualityInspection::getCreateTime)
                .list();
    }

    @Transactional(rollbackFor = Exception.class)
    public QualityInspection createInspection(InspectionDTO dto) {
        WorkOrder workOrder = workOrderService.getById(dto.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        Long userId = UserContext.getUserId();
        SysUser user = sysUserService.getById(userId);

        QualityInspection inspection = new QualityInspection();
        inspection.setInspectionNo(generateInspectionNo());
        inspection.setWorkOrderId(dto.getWorkOrderId());
        inspection.setProcessId(dto.getProcessId());
        inspection.setInspectorId(userId);
        inspection.setInspectorName(user != null ? user.getRealName() : "");
        inspection.setInspectTime(LocalDateTime.now());
        inspection.setInspectQuantity(dto.getInspectQuantity());
        inspection.setQualifiedQuantity(dto.getQualifiedQuantity() != null ? dto.getQualifiedQuantity() : 0);
        inspection.setScrapQuantity(dto.getScrapQuantity() != null ? dto.getScrapQuantity() : 0);
        inspection.setReworkQuantity(dto.getReworkQuantity() != null ? dto.getReworkQuantity() : 0);
        inspection.setScrapReason(dto.getScrapReason());
        inspection.setInspectionItems(dto.getInspectionItems());
        inspection.setStatus(dto.getStatus() != null ? dto.getStatus() : "PENDING");
        inspection.setRemark(dto.getRemark());

        save(inspection);

        if ("PASSED".equals(dto.getStatus())) {
            workOrder.setStatus("RUSTPROOF");
            workOrderService.updateById(workOrder);
        }

        return inspection;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean confirmInspection(Long id, String status, String remark) {
        QualityInspection inspection = getById(id);
        if (inspection == null) {
            throw new BusinessException("检验记录不存在");
        }

        inspection.setStatus(status);
        if (remark != null) {
            inspection.setRemark(remark);
        }
        updateById(inspection);

        if ("PASSED".equals(status)) {
            WorkOrder workOrder = workOrderService.getById(inspection.getWorkOrderId());
            if (workOrder != null) {
                workOrder.setStatus("FINISHED");
                workOrder.setActualEndDate(LocalDateTime.now());
                workOrderService.updateById(workOrder);

                costAccountingService.autoCalculate(inspection.getWorkOrderId());
            }
        }

        return true;
    }

    private String generateInspectionNo() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = count();
        return "QI" + date + String.format("%04d", count + 1);
    }
}
