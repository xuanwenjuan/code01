package com.sheetmetal.compressor.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sheetmetal.compressor.common.PageQuery;
import com.sheetmetal.compressor.common.PageResult;
import com.sheetmetal.compressor.dto.OrderScheduleDTO;
import com.sheetmetal.compressor.dto.ProductionOrderDTO;
import com.sheetmetal.compressor.entity.ProductionOrder;
import com.sheetmetal.compressor.entity.ShellCategory;
import com.sheetmetal.compressor.entity.SysUser;
import com.sheetmetal.compressor.enums.OrderStatusEnum;
import com.sheetmetal.compressor.enums.UserRole;
import com.sheetmetal.compressor.exception.BusinessException;
import com.sheetmetal.compressor.mapper.ProductionOrderMapper;
import com.sheetmetal.compressor.mapper.ShellCategoryMapper;
import com.sheetmetal.compressor.mapper.SysUserMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class ProductionOrderService {

    @Autowired
    private ProductionOrderMapper orderMapper;

    @Autowired
    private ShellCategoryMapper categoryMapper;

    @Autowired
    private SysUserMapper userMapper;

    @Autowired
    private ShellCategoryService shellCategoryService;

    @Autowired
    private ProductionLossService productionLossService;

    @Autowired
    private MaterialLockService materialLockService;

    public PageResult<ProductionOrder> queryPage(PageQuery query, Integer status, Long categoryId) {
        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(ProductionOrder::getStatus, status);
        }
        if (categoryId != null) {
            wrapper.eq(ProductionOrder::getCategoryId, categoryId);
        }
        wrapper.orderByDesc(ProductionOrder::getPriority)
               .orderByDesc(ProductionOrder::getCreatedTime);

        IPage<ProductionOrder> page = new Page<>(query.getCurrent(), query.getSize());
        IPage<ProductionOrder> result = orderMapper.selectPage(page, wrapper);

        return PageResult.of(result.getRecords(), result.getTotal(), result.getSize(), result.getCurrent());
    }

    public ProductionOrder getById(Long id) {
        return orderMapper.selectById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void create(ProductionOrderDTO dto) {
        shellCategoryService.checkCategoryAvailable(dto.getCategoryId());

        ShellCategory category = categoryMapper.selectById(dto.getCategoryId());

        String orderNo = "WO" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        ProductionOrder order = new ProductionOrder();
        BeanUtils.copyProperties(dto, order);
        order.setOrderNo(orderNo);
        order.setCategoryName(category.getCategoryName());
        order.setStatus(OrderStatusEnum.PENDING_SCHEDULE.getCode());
        order.setPriority(category.getPriority());
        order.setActualQuantity(0);
        order.setDefectiveQuantity(0);
        order.setProcessConfirmed(0);

        orderMapper.insert(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void schedule(OrderScheduleDTO dto) {
        ProductionOrder order = orderMapper.selectById(dto.getId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        if (!order.getStatus().equals(OrderStatusEnum.PENDING_SCHEDULE.getCode())) {
            throw new BusinessException("当前工单状态不允许排产");
        }

        SysUser engineer = userMapper.selectById(dto.getEngineerId());
        if (engineer == null || !engineer.getRole().equals(UserRole.PROCESS_ENGINEER.getCode())) {
            throw new BusinessException("工艺员不存在或角色错误");
        }

        SysUser leader = userMapper.selectById(dto.getLeaderId());
        if (leader == null || !leader.getRole().equals(UserRole.PRODUCTION_LEADER.getCode())) {
            throw new BusinessException("产线组长不存在或角色错误");
        }

        order.setProcessEngineerId(dto.getEngineerId());
        order.setProcessEngineerName(engineer.getRealName());
        order.setProductionLeaderId(dto.getLeaderId());
        order.setProductionLeaderName(leader.getRealName());
        order.setPlanStartDate(dto.getStartDate());
        order.setPlanEndDate(dto.getEndDate());
        order.setStatus(OrderStatusEnum.SCHEDULED.getCode());

        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStatus(Long id, Integer targetStatus, Integer operatorRole) {
        ProductionOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        if (order.getProcessConfirmed() == null || order.getProcessConfirmed() == 0) {
            if (targetStatus >= OrderStatusEnum.CUTTING.getCode()) {
                throw new BusinessException("请先确认工艺并锁定原料后再开始生产");
            }
        }

        OrderStatusEnum currentStatus = OrderStatusEnum.fromCode(order.getStatus());
        OrderStatusEnum target = OrderStatusEnum.fromCode(targetStatus);
        if (target == null) {
            throw new BusinessException("目标状态无效");
        }

        validateStatusTransition(currentStatus, target, operatorRole);

        if (targetStatus.equals(OrderStatusEnum.CUTTING.getCode()) &&
            (currentStatus.equals(OrderStatusEnum.PENDING_SCHEDULE) || currentStatus.equals(OrderStatusEnum.SCHEDULED))) {
            order.setActualStartDate(LocalDateTime.now());
        }

        if (targetStatus.equals(OrderStatusEnum.COMPLETED.getCode())) {
            order.setActualEndDate(LocalDateTime.now());
            if (order.getActualQuantity() == null || order.getActualQuantity() == 0) {
                order.setActualQuantity(order.getPlanQuantity());
            }

            materialLockService.consumeMaterial(id);
            productionLossService.aggregateLossOnComplete(id);
        }

        order.setStatus(targetStatus);
        orderMapper.updateById(order);
    }

    private void validateStatusTransition(OrderStatusEnum current, OrderStatusEnum target, Integer operatorRole) {
        if (current == OrderStatusEnum.CANCELLED || current == OrderStatusEnum.COMPLETED) {
            throw new BusinessException("当前工单状态不允许变更");
        }

        if (target == OrderStatusEnum.PAUSED && operatorRole.equals(UserRole.PRODUCTION_LEADER.getCode())) {
            return;
        }

        if (target == OrderStatusEnum.CANCELLED && operatorRole.equals(UserRole.ADMIN.getCode())) {
            return;
        }

        int currentOrdinal = current.ordinal();
        int targetOrdinal = target.ordinal();
        if (targetOrdinal < currentOrdinal || targetOrdinal > currentOrdinal + 1) {
            throw new BusinessException("不允许跨状态流转，当前状态: " + current.getDesc() + "，目标状态: " + target.getDesc());
        }

        if (target == OrderStatusEnum.INSPECTING && !operatorRole.equals(UserRole.PRODUCTION_LEADER.getCode()) && !operatorRole.equals(UserRole.ADMIN.getCode())) {
            throw new BusinessException("只有产线组长或管理员可以提交质检");
        }

        if (target == OrderStatusEnum.COMPLETED && !operatorRole.equals(UserRole.QUALITY_INSPECTOR.getCode()) && !operatorRole.equals(UserRole.ADMIN.getCode())) {
            throw new BusinessException("只有质检员或管理员可以完成工单");
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void setInspector(Long id, Long inspectorId) {
        ProductionOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        SysUser inspector = userMapper.selectById(inspectorId);
        if (inspector == null || !inspector.getRole().equals(UserRole.QUALITY_INSPECTOR.getCode())) {
            throw new BusinessException("质检员不存在或角色错误");
        }

        order.setInspectorId(inspectorId);
        order.setInspectorName(inspector.getRealName());
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void pause(Long id, String reason) {
        ProductionOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        if (order.getStatus().equals(OrderStatusEnum.COMPLETED.getCode()) ||
            order.getStatus().equals(OrderStatusEnum.CANCELLED.getCode())) {
            throw new BusinessException("当前工单状态不允许暂停");
        }

        order.setStatus(OrderStatusEnum.PAUSED.getCode());
        if (reason != null && !reason.isEmpty()) {
            order.setRemark(order.getRemark() == null ? reason : order.getRemark() + "; " + reason);
        }
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void cancel(Long id, String reason) {
        ProductionOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        if (order.getStatus().equals(OrderStatusEnum.COMPLETED.getCode())) {
            throw new BusinessException("已完成工单不允许取消");
        }

        if (order.getProcessConfirmed() != null && order.getProcessConfirmed() == 1) {
            materialLockService.unlockMaterial(id, reason);
        }

        order.setStatus(OrderStatusEnum.CANCELLED.getCode());
        if (reason != null && !reason.isEmpty()) {
            order.setRemark(order.getRemark() == null ? reason : order.getRemark() + "; " + reason);
        }
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void resume(Long id) {
        ProductionOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        if (!order.getStatus().equals(OrderStatusEnum.PAUSED.getCode())) {
            throw new BusinessException("只有暂停状态的工单可以恢复");
        }

        order.setStatus(OrderStatusEnum.SCHEDULED.getCode());
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateProductionQuantity(Long id, Integer actualQuantity, Integer defectiveQuantity) {
        ProductionOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        if (actualQuantity != null) {
            order.setActualQuantity(actualQuantity);
        }
        if (defectiveQuantity != null) {
            order.setDefectiveQuantity(defectiveQuantity);
        }

        orderMapper.updateById(order);
    }
}
