package com.radiator.management.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.radiator.management.entity.ProductionWorkOrder;
import com.radiator.management.entity.WorkOrderMaterial;
import com.radiator.management.exception.BusinessException;
import com.radiator.management.mapper.ProductionWorkOrderMapper;
import com.radiator.management.mapper.WorkOrderMaterialMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionWorkOrderService {

    private final ProductionWorkOrderMapper workOrderMapper;
    private final WorkOrderMaterialMapper workOrderMaterialMapper;

    @Transactional(rollbackFor = Exception.class)
    public void createWorkOrder(ProductionWorkOrder workOrder) {
        String orderNo = "WO-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        workOrder.setOrderNo(orderNo);
        workOrder.setStatus("PENDING");
        workOrderMapper.insert(workOrder);
    }

    public void updateWorkOrder(ProductionWorkOrder workOrder) {
        workOrderMapper.updateById(workOrder);
    }

    public void deleteWorkOrder(Long id) {
        ProductionWorkOrder order = workOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!"PENDING".equals(order.getStatus())) {
            throw new BusinessException("只有待排产的工单可以删除");
        }
        workOrderMapper.deleteById(id);
    }

    public List<ProductionWorkOrder> list(String status) {
        LambdaQueryWrapper<ProductionWorkOrder> wrapper = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            wrapper.eq(ProductionWorkOrder::getStatus, status);
        }
        wrapper.orderByDesc(ProductionWorkOrder::getCreateTime);
        return workOrderMapper.selectList(wrapper);
    }

    public ProductionWorkOrder getById(Long id) {
        return workOrderMapper.selectById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void startProduction(Long id, Long leaderId) {
        ProductionWorkOrder order = workOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!"PENDING".equals(order.getStatus())) {
            throw new BusinessException("工单状态不正确");
        }
        order.setStatus("CUTTING");
        order.setCurrentProcess("铝板裁切成型");
        order.setActualStartDate(LocalDateTime.now());
        order.setLeaderId(leaderId);
        workOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void nextProcess(Long id) {
        ProductionWorkOrder order = workOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        
        String currentStatus = order.getStatus();
        switch (currentStatus) {
            case "CUTTING":
                order.setStatus("STAMPING");
                order.setCurrentProcess("翅片冲压成型");
                break;
            case "STAMPING":
                order.setStatus("PIPING");
                order.setCurrentProcess("管路穿插对接");
                break;
            case "PIPING":
                order.setStatus("ASSEMBLING");
                order.setCurrentProcess("压合密封加固");
                break;
            case "ASSEMBLING":
                order.setStatus("LEAK_TESTING");
                order.setCurrentProcess("压力检漏测试");
                break;
            case "LEAK_TESTING":
                order.setStatus("PACKAGING");
                order.setCurrentProcess("外观整理打包");
                break;
            case "PACKAGING":
                order.setStatus("COMPLETED");
                order.setCurrentProcess("完成");
                order.setActualEndDate(LocalDateTime.now());
                break;
            default:
                throw new BusinessException("当前状态无法进入下一工序");
        }
        workOrderMapper.updateById(order);
    }

    public void pauseOrder(Long id) {
        ProductionWorkOrder order = workOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        order.setStatus("PAUSED");
        workOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void addMaterial(WorkOrderMaterial material) {
        material.setTotalPrice(material.getUnitPrice().multiply(material.getQuantity()));
        workOrderMaterialMapper.insert(material);
    }

    public List<WorkOrderMaterial> getMaterials(Long workOrderId) {
        return workOrderMaterialMapper.selectList(
            new LambdaQueryWrapper<WorkOrderMaterial>()
                .eq(WorkOrderMaterial::getWorkOrderId, workOrderId)
        );
    }
}