package com.snacktrace.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.snacktrace.annotation.RequireRole;
import com.snacktrace.dto.QcInspectionDTO;
import com.snacktrace.entity.QcInspection;
import com.snacktrace.entity.User;
import com.snacktrace.enums.RoleEnum;
import com.snacktrace.mapper.QcInspectionMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class QcInspectionService extends ServiceImpl<QcInspectionMapper, QcInspection> {

    @Autowired
    private UserService userService;

    @Transactional
    @RequireRole({RoleEnum.ADMIN, RoleEnum.QC_INSPECTOR})
    public boolean addInspection(QcInspectionDTO dto) {
        QcInspection inspection = new QcInspection();
        inspection.setWorkOrderId(dto.getWorkOrderId());
        inspection.setInspectionStage(dto.getInspectionStage());
        inspection.setCheckQuantity(dto.getCheckQuantity());
        inspection.setQualifiedQuantity(dto.getQualifiedQuantity());
        inspection.setDefectQuantity(dto.getDefectQuantity() != null ?
                dto.getDefectQuantity() :
                dto.getCheckQuantity().subtract(dto.getQualifiedQuantity()));
        inspection.setDefectReason(dto.getDefectReason());
        inspection.setRemark(dto.getRemark());
        inspection.setInspectionTime(LocalDateTime.now());
        inspection.setInspectionResult(
                inspection.getQualifiedQuantity().compareTo(BigDecimal.ZERO) > 0 &&
                inspection.getDefectQuantity().compareTo(dto.getCheckQuantity().multiply(new BigDecimal("0.1"))) <= 0 ? 1 : 2);

        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                Long userId = (Long) request.getAttribute("userId");
                String username = (String) request.getAttribute("username");
                inspection.setInspectorId(userId);
                inspection.setInspectorName(username);
            }
        } catch (Exception e) {
        }

        return save(inspection);
    }

    public List<QcInspection> getInspectionList(Long workOrderId, Integer stage) {
        LambdaQueryWrapper<QcInspection> wrapper = new LambdaQueryWrapper<>();
        if (workOrderId != null) {
            wrapper.eq(QcInspection::getWorkOrderId, workOrderId);
        }
        if (stage != null) {
            wrapper.eq(QcInspection::getInspectionStage, stage);
        }
        wrapper.orderByDesc(QcInspection::getInspectionTime);
        return list(wrapper);
    }
}
