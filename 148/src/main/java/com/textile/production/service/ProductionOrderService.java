package com.textile.production.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.textile.production.common.ProcessConstants;
import com.textile.production.common.Result;
import com.textile.production.common.ResultCode;
import com.textile.production.dto.OrderConfirmDTO;
import com.textile.production.dto.OrderMaterialDTO;
import com.textile.production.dto.ProcessCompleteDTO;
import com.textile.production.dto.ProductionOrderDTO;
import com.textile.production.entity.*;
import com.textile.production.exception.BusinessException;
import com.textile.production.mapper.ProductionOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductionOrderService extends ServiceImpl<ProductionOrderMapper, ProductionOrder> {

    private final ProductionProcessService processService;
    private final OrderMaterialService orderMaterialService;
    private final ProductionLogService logService;
    private final ProductionCostService costService;
    private final MaterialLockService materialLockService;

    @Transactional(rollbackFor = Exception.class)
    public Result<ProductionOrder> createOrder(ProductionOrderDTO dto) {
        String orderNo = generateOrderNo();

        ProductionOrder order = new ProductionOrder();
        order.setOrderNo(orderNo);
        order.setCategoryId(dto.getCategoryId());
        order.setFabricName(dto.getFabricName());
        order.setPlanQuantity(dto.getPlanQuantity());
        order.setActualQuantity(BigDecimal.ZERO);
        order.setUnit(dto.getUnit());
        order.setPriority(dto.getPriority());
        order.setStatus(ProcessConstants.ORDER_STATUS_PENDING);
        order.setCurrentProcess(ProcessConstants.PROCESSES.get(0));
        order.setProcessIndex(0);
        order.setPlanStartDate(dto.getPlanStartDate());
        order.setPlanEndDate(dto.getPlanEndDate());
        order.setTimeout(0);
        order.setOperatorId(dto.getOperatorId());
        order.setRemark(dto.getRemark());
        save(order);

        createProcesses(order.getId(), dto.getPlanQuantity());

        if (dto.getMaterials() != null && !dto.getMaterials().isEmpty()) {
            for (OrderMaterialDTO materialDTO : dto.getMaterials()) {
                orderMaterialService.addOrderMaterial(order.getId(), materialDTO);
            }
        }

        costService.initCost(order.getId());

        logService.log(order.getId(), null, "创建工单", "创建生产工单: " + orderNo,
                null, ProcessConstants.ORDER_STATUS_PENDING);

        return Result.success("工单创建成功", order);
    }

    private void createProcesses(Long orderId, BigDecimal planQuantity) {
        List<ProductionProcess> processes = new ArrayList<>();
        for (int i = 0; i < ProcessConstants.PROCESSES.size(); i++) {
            ProductionProcess process = new ProductionProcess();
            process.setOrderId(orderId);
            process.setProcessName(ProcessConstants.PROCESSES.get(i));
            process.setProcessIndex(i);
            process.setStatus(ProcessConstants.PROCESS_STATUS_PENDING);
            process.setOutputQuantity(i == 0 ? planQuantity : BigDecimal.ZERO);
            process.setDefectiveQuantity(BigDecimal.ZERO);
            processes.add(process);
        }
        processService.saveBatch(processes);
    }

    @Transactional(rollbackFor = Exception.class)
    public Result<Void> startOrder(Long orderId) {
        ProductionOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (!ProcessConstants.ORDER_STATUS_PENDING.equals(order.getStatus())) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR.getCode(), "只有待开工的工单才能开始生产");
        }

        String beforeStatus = order.getStatus();
        order.setStatus(ProcessConstants.ORDER_STATUS_IN_PROGRESS);
        order.setActualStartDate(LocalDateTime.now());
        updateById(order);

        LambdaQueryWrapper<ProductionProcess> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionProcess::getOrderId, orderId)
                .eq(ProductionProcess::getProcessIndex, 0);
        ProductionProcess firstProcess = processService.getOne(wrapper);
        if (firstProcess != null) {
            firstProcess.setStatus(ProcessConstants.PROCESS_STATUS_IN_PROGRESS);
            firstProcess.setStartTime(LocalDateTime.now());
            processService.updateById(firstProcess);
        }

        logService.log(orderId, firstProcess != null ? firstProcess.getId() : null,
                "开始生产", "开始工单生产", beforeStatus, order.getStatus());

        return Result.success("工单已开始生产");
    }

    @Transactional(rollbackFor = Exception.class)
    public Result<Void> completeProcess(ProcessCompleteDTO dto) {
        ProductionProcess process = processService.getById(dto.getProcessId());
        if (process == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (!ProcessConstants.PROCESS_STATUS_IN_PROGRESS.equals(process.getStatus())) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR.getCode(), "只有进行中的工序才能完成");
        }

        ProductionOrder order = getById(process.getOrderId());
        if (!ProcessConstants.ORDER_STATUS_IN_PROGRESS.equals(order.getStatus())) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR.getCode(), "工单状态异常，无法完成工序");
        }

        String processBeforeStatus = process.getStatus();
        process.setStatus(ProcessConstants.PROCESS_STATUS_COMPLETED);
        process.setEndTime(LocalDateTime.now());
        process.setOutputQuantity(dto.getOutputQuantity());
        process.setDefectiveQuantity(dto.getDefectiveQuantity());
        process.setEquipment(dto.getEquipment());
        process.setRemark(dto.getRemark());
        processService.updateById(process);

        int nextIndex = process.getProcessIndex() + 1;

        if (nextIndex >= ProcessConstants.PROCESSES.size()) {
            String orderBeforeStatus = order.getStatus();
            order.setStatus(ProcessConstants.ORDER_STATUS_COMPLETED);
            order.setActualEndDate(LocalDateTime.now());
            order.setActualQuantity(dto.getOutputQuantity());
            updateById(order);

            costService.calculateCost(order.getId());

            logService.log(order.getId(), process.getId(), "完成工单", "所有工序完成，工单已完成",
                    orderBeforeStatus, order.getStatus());
        } else {
            LambdaQueryWrapper<ProductionProcess> nextWrapper = new LambdaQueryWrapper<>();
            nextWrapper.eq(ProductionProcess::getOrderId, order.getId())
                    .eq(ProductionProcess::getProcessIndex, nextIndex);
            ProductionProcess nextProcess = processService.getOne(nextWrapper);
            if (nextProcess != null) {
                nextProcess.setStatus(ProcessConstants.PROCESS_STATUS_IN_PROGRESS);
                nextProcess.setStartTime(LocalDateTime.now());
                nextProcess.setOutputQuantity(dto.getOutputQuantity());
                processService.updateById(nextProcess);
            }

            order.setCurrentProcess(ProcessConstants.PROCESSES.get(nextIndex));
            order.setProcessIndex(nextIndex);
            updateById(order);

            logService.log(order.getId(), process.getId(), "完成工序",
                    "完成工序: " + process.getProcessName() + ", 进入下一道工序: " + nextProcess.getProcessName(),
                    processBeforeStatus, process.getStatus());
        }

        return Result.success("工序完成");
    }

    @Transactional(rollbackFor = Exception.class)
    public Result<Void> suspendOrder(Long orderId, String reason) {
        ProductionOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (!ProcessConstants.ORDER_STATUS_IN_PROGRESS.equals(order.getStatus())) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR.getCode(), "只有进行中的工单才能暂停");
        }

        String beforeStatus = order.getStatus();
        order.setStatus(ProcessConstants.ORDER_STATUS_SUSPENDED);
        updateById(order);

        LambdaQueryWrapper<ProductionProcess> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionProcess::getOrderId, orderId)
                .eq(ProductionProcess::getStatus, ProcessConstants.PROCESS_STATUS_IN_PROGRESS);
        ProductionProcess currentProcess = processService.getOne(wrapper);
        if (currentProcess != null) {
            currentProcess.setStatus(ProcessConstants.PROCESS_STATUS_PENDING);
            currentProcess.setEndTime(LocalDateTime.now());
            processService.updateById(currentProcess);
        }

        logService.log(orderId, currentProcess != null ? currentProcess.getId() : null,
                "暂停工单", "暂停原因: " + reason, beforeStatus, order.getStatus());

        return Result.success("工单已暂停");
    }

    @Transactional(rollbackFor = Exception.class)
    public Result<Void> resumeOrder(Long orderId) {
        ProductionOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (!ProcessConstants.ORDER_STATUS_SUSPENDED.equals(order.getStatus())) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR.getCode(), "只有已暂停的工单才能恢复");
        }

        String beforeStatus = order.getStatus();
        order.setStatus(ProcessConstants.ORDER_STATUS_IN_PROGRESS);
        updateById(order);

        LambdaQueryWrapper<ProductionProcess> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionProcess::getOrderId, orderId)
                .eq(ProductionProcess::getProcessIndex, order.getProcessIndex());
        ProductionProcess currentProcess = processService.getOne(wrapper);
        if (currentProcess != null) {
            currentProcess.setStatus(ProcessConstants.PROCESS_STATUS_IN_PROGRESS);
            currentProcess.setStartTime(LocalDateTime.now());
            processService.updateById(currentProcess);
        }

        logService.log(orderId, currentProcess != null ? currentProcess.getId() : null,
                "恢复工单", "恢复工单生产", beforeStatus, order.getStatus());

        return Result.success("工单已恢复生产");
    }

    @Transactional(rollbackFor = Exception.class)
    public Result<Void> cancelOrder(Long orderId, String reason) {
        ProductionOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (ProcessConstants.ORDER_STATUS_COMPLETED.equals(order.getStatus())) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR.getCode(), "已完成的工单无法取消");
        }

        String beforeStatus = order.getStatus();
        order.setStatus(ProcessConstants.ORDER_STATUS_CANCELLED);
        updateById(order);

        logService.log(orderId, null, "取消工单", "取消原因: " + reason, beforeStatus, order.getStatus());

        return Result.success("工单已取消");
    }

    public Result<IPage<ProductionOrder>> getPage(Integer pageNum, Integer pageSize, String status, String keyword) {
        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            wrapper.eq(ProductionOrder::getStatus, status);
        }
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(ProductionOrder::getOrderNo, keyword)
                    .or()
                    .like(ProductionOrder::getFabricName, keyword);
        }
        wrapper.orderByDesc(ProductionOrder::getPriority)
                .orderByDesc(ProductionOrder::getCreateTime);

        Page<ProductionOrder> page = new Page<>(pageNum, pageSize);
        return Result.success(page(page, wrapper));
    }

    public Result<ProductionOrder> getDetail(Long orderId) {
        ProductionOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        return Result.success(order);
    }

    public Result<List<ProductionProcess>> getProcesses(Long orderId) {
        return processService.getProcessesByOrderId(orderId);
    }

    private String generateOrderNo() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "PO";

        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.likeRight(ProductionOrder::getOrderNo, prefix + dateStr);
        Long count = count(wrapper);

        String sequence = String.format("%06d", count + 1);
        return prefix + dateStr + sequence;
    }

    public Result<List<ProductionOrder>> getOrderWithProcesses(Long id, String status) {
        return Result.success(baseMapper.getOrderWithProcesses(id, status));
    }

    public Result<List<Map<String, Object>>> getOrderProgressStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        return Result.success(baseMapper.getOrderProgressStatistics(startDate, endDate));
    }

    public Result<List<Map<String, Object>>> getOrderEfficiencyReport(LocalDateTime startDate, LocalDateTime endDate) {
        return Result.success(baseMapper.getOrderEfficiencyReport(startDate, endDate));
    }

    public Result<List<Map<String, Object>>> getDefectiveStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        return Result.success(baseMapper.getDefectiveStatistics(startDate, endDate));
    }

    @Transactional(rollbackFor = Exception.class)
    public Result<Void> confirmProcess(OrderConfirmDTO dto) {
        ProductionOrder order = getById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (!ProcessConstants.ORDER_STATUS_PENDING.equals(order.getStatus())) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR.getCode(), "只有待开工的工单才能确认工艺");
        }

        materialLockService.releaseLockByOrder(dto.getOrderId());

        for (OrderMaterialDTO materialDTO : dto.getMaterials()) {
            if (materialDTO.getPlanQuantity() == null || materialDTO.getPlanQuantity().compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            materialLockService.lockMaterial(
                    dto.getOrderId(),
                    materialDTO.getMaterialId(),
                    materialDTO.getBatchId(),
                    materialDTO.getPlanQuantity(),
                    dto.getProcessRemark()
            );

            LambdaQueryWrapper<OrderMaterial> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(OrderMaterial::getOrderId, dto.getOrderId())
                    .eq(OrderMaterial::getMaterialId, materialDTO.getMaterialId());
            OrderMaterial orderMaterial = orderMaterialService.getOne(wrapper);

            if (orderMaterial == null) {
                orderMaterialService.addOrderMaterial(dto.getOrderId(), materialDTO);
            } else {
                orderMaterial.setPlanQuantity(materialDTO.getPlanQuantity());
                orderMaterial.setBatchId(materialDTO.getBatchId());
                orderMaterial.setUnitPrice(materialDTO.getUnitPrice());
                if (materialDTO.getUnitPrice() != null) {
                    orderMaterial.setTotalPrice(materialDTO.getPlanQuantity().multiply(materialDTO.getUnitPrice()));
                }
                orderMaterialService.updateById(orderMaterial);
            }
        }

        costService.calculateCost(dto.getOrderId());

        logService.log(dto.getOrderId(), null, "确认工艺",
                "工艺确认完成，已锁定原料库存。" + (dto.getProcessRemark() != null ? "备注：" + dto.getProcessRemark() : ""),
                order.getStatus(), order.getStatus());

        return Result.success("工艺确认成功，原料库存已锁定");
    }
}
