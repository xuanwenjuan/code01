package com.gearbox.manage.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gearbox.manage.context.UserContext;
import com.gearbox.manage.dto.WorkOrderDTO;
import com.gearbox.manage.entity.*;
import com.gearbox.manage.exception.BusinessException;
import com.gearbox.manage.mapper.WorkOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkOrderService extends ServiceImpl<WorkOrderMapper, WorkOrder> {

    private final WorkOrderMaterialService workOrderMaterialService;
    private final WorkProcessService workProcessService;
    private final QualityInspectionService qualityInspectionService;

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "workOrderList", allEntries = true)
    public WorkOrder create(WorkOrderDTO dto) {
        WorkOrder workOrder = new WorkOrder();
        workOrder.setOrderNo(generateOrderNo());
        workOrder.setCategoryId(dto.getCategoryId());
        workOrder.setProductName(dto.getProductName());
        workOrder.setQuantity(dto.getQuantity());
        workOrder.setPriority(dto.getPriority() != null ? dto.getPriority() : 0);
        workOrder.setStatus("PENDING");
        workOrder.setPlanStartDate(dto.getPlanStartDate());
        workOrder.setPlanEndDate(dto.getPlanEndDate());
        workOrder.setRemark(dto.getRemark());

        save(workOrder);

        if (dto.getMaterials() != null && !dto.getMaterials().isEmpty()) {
            for (WorkOrderDTO.MaterialItem item : dto.getMaterials()) {
                WorkOrderMaterial material = new WorkOrderMaterial();
                material.setWorkOrderId(workOrder.getId());
                material.setMaterialId(item.getMaterialId());
                material.setMaterialName(item.getMaterialName());
                material.setRequiredQuantity(item.getRequiredQuantity());
                material.setUnit(item.getUnit());
                material.setActualQuantity(BigDecimal.ZERO);
                material.setStatus("PENDING");
                workOrderMaterialService.save(material);
            }
        }

        createDefaultProcesses(workOrder.getId());

        return workOrder;
    }

    private void createDefaultProcesses(Long workOrderId) {
        String[][] processes = {
            {"ROUGH_MILLING", "粗铣成型"},
            {"FINE_MILLING", "精铣端面"},
            {"BORING", "孔系镗削"},
            {"THREADING", "螺纹加工"},
            {"GRINDING", "圆角打磨"}
        };

        for (int i = 0; i < processes.length; i++) {
            WorkProcess process = new WorkProcess();
            process.setWorkOrderId(workOrderId);
            process.setProcessCode(processes[i][0]);
            process.setProcessName(processes[i][1]);
            process.setProcessOrder(i + 1);
            process.setStatus("PENDING");
            workProcessService.save(process);
        }
    }

    private String generateOrderNo() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = count(
            new LambdaQueryWrapper<WorkOrder>()
                .likeRight(WorkOrder::getOrderNo, date)
        );
        return "WO" + date + String.format("%04d", count + 1);
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean startPreparation(Long id) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (!"PENDING".equals(workOrder.getStatus())) {
            throw new BusinessException("工单状态不正确，无法开始备料");
        }

        workOrder.setStatus("PREPARING");
        workOrder.setTeamLeaderId(UserContext.getUserId());
        return updateById(workOrder);
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean completePreparation(Long id) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (!"PREPARING".equals(workOrder.getStatus())) {
            throw new BusinessException("工单状态不正确，无法完成备料");
        }

        List<WorkOrderMaterial> materials = workOrderMaterialService.listByWorkOrderId(id);
        boolean allPicked = materials.stream()
                .allMatch(m -> "PICKED".equals(m.getStatus()));

        if (!allPicked) {
            throw new BusinessException("还有物料未完成领料，无法完成备料");
        }

        workOrder.setStatus("READY");
        return updateById(workOrder);
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean startProduction(Long id) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (!"READY".equals(workOrder.getStatus())) {
            throw new BusinessException("工单状态不正确，请先完成备料");
        }

        workOrder.setStatus("ROUGH_MILLING");
        workOrder.setActualStartDate(LocalDateTime.now());
        workOrder.setTeamLeaderId(UserContext.getUserId());
        return updateById(workOrder);
    }

    public Page<WorkOrder> listPage(int pageNum, int pageSize, String status) {
        Page<WorkOrder> page = new Page<>(pageNum, pageSize);
        return lambdaQuery()
                .eq(status != null && !status.isEmpty(), WorkOrder::getStatus, status)
                .orderByDesc(WorkOrder::getPriority)
                .orderByDesc(WorkOrder::getCreateTime)
                .page(page);
    }

    @Cacheable(value = "workOrderList", key = "#status", unless = "#result == null or #result.size() == 0")
    public List<WorkOrder> listByStatus(String status) {
        return lambdaQuery()
                .eq(WorkOrder::getStatus, status)
                .orderByDesc(WorkOrder::getPriority)
                .orderByDesc(WorkOrder::getCreateTime)
                .list();
    }

    public WorkOrder getDetail(Long id) {
        WorkOrder workOrder = getById(id);
        if (workOrder != null) {
            List<WorkOrderMaterial> materials = workOrderMaterialService.listByWorkOrderId(id);
            workOrder.setMaterials(materials);

            List<WorkProcess> processes = workProcessService.listByWorkOrderId(id);
            workOrder.setProcesses(processes);

            List<QualityInspection> inspections = qualityInspectionService.listByWorkOrderId(id);
            workOrder.setInspections(inspections);
        }
        return workOrder;
    }
}
