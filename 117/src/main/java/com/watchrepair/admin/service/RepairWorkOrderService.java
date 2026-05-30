package com.watchrepair.admin.service;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.watchrepair.admin.common.PageQuery;
import com.watchrepair.admin.dto.RepairWorkOrderDTO;
import com.watchrepair.admin.dto.WorkOrderCompleteDTO;
import com.watchrepair.admin.dto.WorkOrderPlanDTO;
import com.watchrepair.admin.entity.RepairWorkOrder;
import com.watchrepair.admin.entity.WorkOrderPart;
import com.watchrepair.admin.enums.WorkOrderStatusEnum;
import com.watchrepair.admin.exception.BusinessException;
import com.watchrepair.admin.mapper.RepairWorkOrderMapper;
import com.watchrepair.admin.mapper.WorkOrderPartMapper;
import com.watchrepair.admin.vo.RepairWorkOrderVO;
import com.watchrepair.admin.vo.WorkOrderPartVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RepairWorkOrderService {

    private final RepairWorkOrderMapper workOrderMapper;
    private final WorkOrderPartMapper workOrderPartMapper;
    private final RepairPartService partService;
    private final WatchCategoryService categoryService;

    private RepairWorkOrderVO convertToVO(RepairWorkOrder order) {
        RepairWorkOrderVO vo = new RepairWorkOrderVO();
        BeanUtils.copyProperties(order, vo);
        WorkOrderStatusEnum statusEnum = WorkOrderStatusEnum.getByCode(order.getStatus());
        if (statusEnum != null) {
            vo.setStatusDesc(statusEnum.getDesc());
        }
        return vo;
    }

    private WorkOrderPartVO convertPartToVO(WorkOrderPart part) {
        WorkOrderPartVO vo = new WorkOrderPartVO();
        BeanUtils.copyProperties(part, vo);
        return vo;
    }

    public Page<RepairWorkOrderVO> getWorkOrderPage(PageQuery pageQuery, Integer status, String keyword) {
        Page<RepairWorkOrder> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());

        LambdaQueryWrapper<RepairWorkOrder> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(RepairWorkOrder::getStatus, status);
        }
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(RepairWorkOrder::getOrderNo, keyword)
                    .or().like(RepairWorkOrder::getCustomerName, keyword)
                    .or().like(RepairWorkOrder::getWatchModel, keyword));
        }
        wrapper.orderByDesc(RepairWorkOrder::getCreateTime);

        Page<RepairWorkOrder> result = workOrderMapper.selectPage(page, wrapper);
        Page<RepairWorkOrderVO> voPage = new Page<>(result.getCurrent(), result.getSize(), result.getTotal());
        voPage.setRecords(result.getRecords().stream().map(this::convertToVO).collect(Collectors.toList()));
        return voPage;
    }

    public RepairWorkOrderVO getWorkOrderById(Long id) {
        RepairWorkOrder order = workOrderMapper.selectById(id);
        if (order == null) {
            return null;
        }
        RepairWorkOrderVO vo = convertToVO(order);
        List<WorkOrderPart> parts = workOrderPartMapper.selectList(
                new LambdaQueryWrapper<WorkOrderPart>().eq(WorkOrderPart::getWorkOrderId, id)
        );
        vo.setWorkOrderParts(parts.stream().map(this::convertPartToVO).collect(Collectors.toList()));
        return vo;
    }

    @Transactional(rollbackFor = Exception.class)
    public void createWorkOrder(RepairWorkOrderDTO dto) {
        categoryService.validateCategoryStatus(dto.getCategoryId());

        RepairWorkOrder order = new RepairWorkOrder();
        BeanUtils.copyProperties(dto, order);
        order.setOrderNo("WO" + IdUtil.getSnowflakeNextIdStr());
        order.setStatus(WorkOrderStatusEnum.RECEIVED.getCode());
        order.setReceivedTime(LocalDateTime.now());
        order.setPartsCost(BigDecimal.ZERO);
        order.setLaborCost(BigDecimal.ZERO);
        order.setAppearanceCost(BigDecimal.ZERO);
        order.setLossCost(BigDecimal.ZERO);
        order.setTotalAmount(BigDecimal.ZERO);
        workOrderMapper.insert(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void startDisassemble(Long id, Long technicianId) {
        RepairWorkOrder order = checkWorkOrderStatus(id, WorkOrderStatusEnum.RECEIVED);
        order.setTechnicianId(technicianId);
        order.setStatus(WorkOrderStatusEnum.DISASSEMBLING.getCode());
        order.setDisassembleTime(LocalDateTime.now());
        workOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void confirmPlan(WorkOrderPlanDTO dto) {
        RepairWorkOrder order = checkWorkOrderStatus(dto.getWorkOrderId(), WorkOrderStatusEnum.DISASSEMBLING);
        
        order.setPartsSelectorId(dto.getPartsSelectorId());
        order.setStatus(WorkOrderStatusEnum.PARTS_REPLACING.getCode());
        
        workOrderPartMapper.delete(
                new LambdaQueryWrapper<WorkOrderPart>().eq(WorkOrderPart::getWorkOrderId, dto.getWorkOrderId())
        );

        BigDecimal partsCost = BigDecimal.ZERO;
        for (WorkOrderPart part : dto.getParts()) {
            var repairPart = partService.getPartById(part.getPartId());
            
            part.setWorkOrderId(dto.getWorkOrderId());
            part.setPartCode(repairPart.getPartCode());
            part.setPartName(repairPart.getPartName());
            part.setUnitPrice(repairPart.getUnitPrice());
            part.setTotalPrice(repairPart.getUnitPrice().multiply(BigDecimal.valueOf(part.getQuantity())));
            part.setLocked(1);
            partsCost = partsCost.add(part.getTotalPrice());

            workOrderPartMapper.insert(part);
            partService.lockStock(part.getPartId(), part.getQuantity(), dto.getWorkOrderId());
        }

        order.setPartsCost(partsCost);
        if (dto.getLaborCost() != null) {
            order.setLaborCost(dto.getLaborCost());
        }
        if (dto.getAppearanceCost() != null) {
            order.setAppearanceCost(dto.getAppearanceCost());
        }
        order.setTotalAmount(partsCost.add(order.getLaborCost()).add(order.getAppearanceCost()));
        order.setPartsReplaceTime(LocalDateTime.now());
        workOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void startAdjust(Long id, BigDecimal laborCost) {
        RepairWorkOrder order = checkWorkOrderStatus(id, WorkOrderStatusEnum.PARTS_REPLACING);
        order.setStatus(WorkOrderStatusEnum.ADJUSTING.getCode());
        order.setLaborCost(laborCost);
        order.setTotalAmount(order.getPartsCost().add(laborCost).add(order.getAppearanceCost()));
        order.setAdjustTime(LocalDateTime.now());
        workOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void startPolish(Long id, BigDecimal appearanceCost) {
        RepairWorkOrder order = checkWorkOrderStatus(id, WorkOrderStatusEnum.ADJUSTING);
        order.setStatus(WorkOrderStatusEnum.POLISHING.getCode());
        order.setAppearanceCost(appearanceCost);
        order.setTotalAmount(order.getPartsCost().add(order.getLaborCost()).add(appearanceCost));
        order.setPolishTime(LocalDateTime.now());
        workOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void completeWorkOrder(WorkOrderCompleteDTO dto) {
        RepairWorkOrder order = checkWorkOrderStatus(dto.getWorkOrderId(), WorkOrderStatusEnum.POLISHING);
        
        if (dto.getActualLaborCost() != null) {
            order.setLaborCost(dto.getActualLaborCost());
        }
        if (dto.getActualAppearanceCost() != null) {
            order.setAppearanceCost(dto.getActualAppearanceCost());
        }
        if (dto.getLossCost() != null) {
            order.setLossCost(dto.getLossCost());
        }
        
        order.setTotalAmount(order.getPartsCost()
                .add(order.getLaborCost())
                .add(order.getAppearanceCost())
                .add(order.getLossCost()));
        
        order.setStatus(WorkOrderStatusEnum.COMPLETED.getCode());
        order.setInspectionReport(dto.getInspectionReport());
        order.setCompletedTime(LocalDateTime.now());
        workOrderMapper.updateById(order);

        List<WorkOrderPart> parts = workOrderPartMapper.selectList(
                new LambdaQueryWrapper<WorkOrderPart>().eq(WorkOrderPart::getWorkOrderId, dto.getWorkOrderId())
        );
        for (WorkOrderPart part : parts) {
            part.setLocked(0);
            workOrderPartMapper.updateById(part);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void cancelWorkOrder(Long id) {
        RepairWorkOrder order = workOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (order.getStatus() >= WorkOrderStatusEnum.COMPLETED.getCode()) {
            throw new BusinessException("已完成的工单不能取消");
        }

        List<WorkOrderPart> parts = workOrderPartMapper.selectList(
                new LambdaQueryWrapper<WorkOrderPart>().eq(WorkOrderPart::getWorkOrderId, id)
        );
        for (WorkOrderPart part : parts) {
            if (part.getLocked() != null && part.getLocked() == 1) {
                partService.unlockStock(part.getPartId(), part.getQuantity(), id);
            }
        }

        order.setStatus(WorkOrderStatusEnum.CANCELLED.getCode());
        workOrderMapper.updateById(order);
    }

    private RepairWorkOrder checkWorkOrderStatus(Long id, WorkOrderStatusEnum expectedStatus) {
        RepairWorkOrder order = workOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!order.getStatus().equals(expectedStatus.getCode())) {
            throw new BusinessException("工单状态不正确，当前状态: " + 
                    WorkOrderStatusEnum.getByCode(order.getStatus()).getDesc());
        }
        return order;
    }

    public List<RepairWorkOrderVO> getTimeoutWorkOrders() {
        LocalDateTime timeoutTime = LocalDateTime.now().minusHours(24);
        List<RepairWorkOrder> orders = workOrderMapper.selectList(
                new LambdaQueryWrapper<RepairWorkOrder>()
                        .eq(RepairWorkOrder::getStatus, WorkOrderStatusEnum.RECEIVED.getCode())
                        .lt(RepairWorkOrder::getReceivedTime, timeoutTime)
        );
        return orders.stream().map(this::convertToVO).collect(Collectors.toList());
    }
}