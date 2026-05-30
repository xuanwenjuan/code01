package com.fitness.manufacture.service.impl;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.metadata.OrderItem;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fitness.manufacture.common.BusinessException;
import com.fitness.manufacture.common.PageQuery;
import com.fitness.manufacture.common.ResultCode;
import com.fitness.manufacture.dto.WorkOrderDTO;
import com.fitness.manufacture.dto.WorkOrderQueryDTO;
import com.fitness.manufacture.entity.Product;
import com.fitness.manufacture.entity.ProductBom;
import com.fitness.manufacture.entity.SysUser;
import com.fitness.manufacture.entity.WorkOrder;
import com.fitness.manufacture.mapper.ProductBomMapper;
import com.fitness.manufacture.mapper.ProductMapper;
import com.fitness.manufacture.mapper.SysUserMapper;
import com.fitness.manufacture.mapper.WorkOrderMapper;
import com.fitness.manufacture.service.WorkOrderMaterialLockService;
import com.fitness.manufacture.service.WorkOrderProcessService;
import com.fitness.manufacture.service.WorkOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkOrderServiceImpl extends ServiceImpl<WorkOrderMapper, WorkOrder> implements WorkOrderService {

    private final WorkOrderMapper workOrderMapper;
    private final ProductMapper productMapper;
    private final ProductBomMapper productBomMapper;
    private final SysUserMapper sysUserMapper;
    private final WorkOrderProcessService workOrderProcessService;
    private final WorkOrderMaterialLockService workOrderMaterialLockService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveWorkOrder(WorkOrderDTO dto) {
        Product product = productMapper.selectById(dto.getProductId());
        if (product == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "产品不存在");
        }
        if (product.getStatus() == 0) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "该产品已停止量产");
        }

        WorkOrder workOrder = new WorkOrder();
        BeanUtils.copyProperties(dto, workOrder);
        workOrder.setWorkOrderNo(generateWorkOrderNo());
        workOrder.setProductName(product.getProductName());
        workOrder.setStatus(0);
        workOrder.setProcessProgress(0);
        workOrder.setActualQuantity(0);
        workOrder.setTotalHours(BigDecimal.ZERO);
        workOrder.setIsFrozen(0);
        if (workOrder.getPriority() == null) {
            workOrder.setPriority(product.getPriority());
        }
        workOrderMapper.insert(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateWorkOrder(WorkOrderDTO dto) {
        WorkOrder workOrder = workOrderMapper.selectById(dto.getId());
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (workOrder.getStatus() > 1) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "工单已启动，无法修改");
        }

        if (!workOrder.getProductId().equals(dto.getProductId())) {
            Product product = productMapper.selectById(dto.getProductId());
            if (product == null) {
                throw new BusinessException(ResultCode.DATA_NOT_EXIST, "产品不存在");
            }
            workOrder.setProductName(product.getProductName());
        }

        BeanUtils.copyProperties(dto, workOrder);
        workOrderMapper.updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteWorkOrder(Long id) {
        WorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (workOrder.getStatus() > 0) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "工单已分配，无法删除");
        }
        workOrderMapper.deleteById(id);
    }

    @Override
    public IPage<WorkOrder> getWorkOrderPage(PageQuery query, Long productId, Integer status, Long lineLeaderId) {
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        if (productId != null) {
            wrapper.eq(WorkOrder::getProductId, productId);
        }
        if (status != null) {
            wrapper.eq(WorkOrder::getStatus, status);
        }
        if (lineLeaderId != null) {
            wrapper.eq(WorkOrder::getLineLeaderId, lineLeaderId);
        }
        wrapper.orderByDesc(WorkOrder::getPriority);
        wrapper.orderByDesc(WorkOrder::getCreateTime);

        Page<WorkOrder> page = new Page<>(query.getPageNum(), query.getPageSize());
        return workOrderMapper.selectPage(page, wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateWorkOrderStatus(Long id, Integer status, String remark) {
        WorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        workOrder.setStatus(status);
        workOrder.setRemark(remark);
        workOrderMapper.updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void startWorkOrder(Long id) {
        WorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (workOrder.getStatus() != 1) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "工单状态不正确");
        }
        if (workOrder.getIsFrozen() == 1) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "工单已冻结，请先解冻");
        }

        List<ProductBom> boms = productBomMapper.selectList(new LambdaQueryWrapper<ProductBom>()
                .eq(ProductBom::getProductId, workOrder.getProductId()));

        for (ProductBom bom : boms) {
            BigDecimal totalNeeded = bom.getQuantity().multiply(new BigDecimal(workOrder.getPlanQuantity()));
            workOrderMaterialLockService.lockMaterial(id, bom.getMaterialId(), totalNeeded);
        }

        workOrder.setStatus(2);
        workOrder.setActualStartTime(LocalDateTime.now());
        workOrderProcessService.initWorkOrderProcesses(id);
        workOrderMapper.updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void pauseWorkOrder(Long id, String reason) {
        WorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (workOrder.getStatus() != 2) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "工单未在进行中");
        }

        workOrder.setStatus(3);
        workOrder.setRemark(reason);
        workOrderMapper.updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void resumeWorkOrder(Long id) {
        WorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (workOrder.getStatus() != 3) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "工单未暂停");
        }
        if (workOrder.getIsFrozen() == 1) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "工单已冻结，请先解冻");
        }

        workOrder.setStatus(2);
        workOrderMapper.updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void completeWorkOrder(Long id) {
        WorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (workOrder.getStatus() != 4) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "工单未在质检中");
        }

        workOrder.setStatus(5);
        workOrder.setActualEndTime(LocalDateTime.now());
        workOrder.setProcessProgress(100);
        workOrderMapper.updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancelWorkOrder(Long id, String reason) {
        WorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (workOrder.getStatus() >= 5) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "工单已完成，无法取消");
        }

        workOrder.setStatus(6);
        workOrder.setRemark(reason);
        workOrderMapper.updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void assignWorkOrder(Long id, Long lineLeaderId) {
        WorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (workOrder.getStatus() != 0) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "工单已分配");
        }

        SysUser user = sysUserMapper.selectById(lineLeaderId);
        if (user == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "用户不存在");
        }

        workOrder.setLineLeaderId(lineLeaderId);
        workOrder.setLineLeaderName(user.getRealName());
        workOrder.setStatus(1);
        workOrderMapper.updateById(workOrder);
    }

    @Override
    public String generateWorkOrderNo() {
        String prefix = "WO" + DateUtil.format(LocalDateTime.now(), "yyyyMMdd");
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.likeRight(WorkOrder::getWorkOrderNo, prefix);
        wrapper.orderByDesc(WorkOrder::getWorkOrderNo);
        wrapper.last("limit 1");
        WorkOrder last = workOrderMapper.selectOne(wrapper);

        int sequence = 1;
        if (last != null) {
            String lastNo = last.getWorkOrderNo();
            sequence = Integer.parseInt(lastNo.substring(lastNo.length() - 4)) + 1;
        }
        return prefix + String.format("%04d", sequence);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void autoFreezeWorkOrders() {
        LocalDateTime freezeTime = LocalDateTime.now().minusDays(7);
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrder::getStatus, 1);
        wrapper.eq(WorkOrder::getIsFrozen, 0);
        wrapper.lt(WorkOrder::getCreateTime, freezeTime);
        var orders = workOrderMapper.selectList(wrapper);

        for (WorkOrder order : orders) {
            order.setIsFrozen(1);
            order.setFrozenReason("工单超过7天未启动，系统自动冻结");
            order.setFrozenTime(LocalDateTime.now());
            workOrderMapper.updateById(order);
        }
    }

    @Override
    public List<WorkOrder> getWorkOrderList(Long productId, Integer status) {
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        if (productId != null) {
            wrapper.eq(WorkOrder::getProductId, productId);
        }
        if (status != null) {
            wrapper.eq(WorkOrder::getStatus, status);
        }
        wrapper.orderByDesc(WorkOrder::getPriority);
        wrapper.orderByDesc(WorkOrder::getCreateTime);
        return workOrderMapper.selectList(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void auditWorkOrder(Long id, Integer auditResult, String remark) {
        WorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (workOrder.getStatus() != 0) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "工单已处理，无法重复审核");
        }

        if (auditResult == 1) {
            workOrder.setStatus(1);
            workOrder.setAuditRemark(remark);
            workOrder.setAuditTime(LocalDateTime.now());
        } else if (auditResult == 2) {
            workOrder.setStatus(7);
            workOrder.setAuditRemark(remark);
            workOrder.setAuditTime(LocalDateTime.now());
        } else {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "审核结果不合法");
        }

        workOrderMapper.updateById(workOrder);
    }

    @Override
    public IPage<WorkOrder> getWorkOrderPageByConditions(WorkOrderQueryDTO queryDTO) {
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(WorkOrder::getProductName, queryDTO.getKeyword())
                    .or().like(WorkOrder::getWorkOrderNo, queryDTO.getKeyword()));
        }
        if (StringUtils.hasText(queryDTO.getWorkOrderNo())) {
            wrapper.like(WorkOrder::getWorkOrderNo, queryDTO.getWorkOrderNo());
        }
        if (queryDTO.getProductId() != null) {
            wrapper.eq(WorkOrder::getProductId, queryDTO.getProductId());
        }
        if (queryDTO.getCategoryId() != null) {
            wrapper.eq(WorkOrder::getCategoryId, queryDTO.getCategoryId());
        }
        if (queryDTO.getStatus() != null) {
            wrapper.eq(WorkOrder::getStatus, queryDTO.getStatus());
        }
        if (queryDTO.getLineLeaderId() != null) {
            wrapper.eq(WorkOrder::getLineLeaderId, queryDTO.getLineLeaderId());
        }
        if (queryDTO.getPriority() != null) {
            wrapper.eq(WorkOrder::getPriority, queryDTO.getPriority());
        }
        if (queryDTO.getIsFrozen() != null) {
            wrapper.eq(WorkOrder::getIsFrozen, queryDTO.getIsFrozen());
        }
        if (queryDTO.getPlanStartTimeStart() != null) {
            wrapper.ge(WorkOrder::getPlanStartTime, queryDTO.getPlanStartTimeStart());
        }
        if (queryDTO.getPlanStartTimeEnd() != null) {
            wrapper.le(WorkOrder::getPlanStartTime, queryDTO.getPlanStartTimeEnd());
        }
        if (queryDTO.getPlanEndTimeStart() != null) {
            wrapper.ge(WorkOrder::getPlanEndTime, queryDTO.getPlanEndTimeStart());
        }
        if (queryDTO.getPlanEndTimeEnd() != null) {
            wrapper.le(WorkOrder::getPlanEndTime, queryDTO.getPlanEndTimeEnd());
        }
        if (queryDTO.getActualStartTimeStart() != null) {
            wrapper.ge(WorkOrder::getActualStartTime, queryDTO.getActualStartTimeStart());
        }
        if (queryDTO.getActualStartTimeEnd() != null) {
            wrapper.le(WorkOrder::getActualStartTime, queryDTO.getActualStartTimeEnd());
        }
        if (queryDTO.getCreateTimeStart() != null) {
            wrapper.ge(WorkOrder::getCreateTime, queryDTO.getCreateTimeStart());
        }
        if (queryDTO.getCreateTimeEnd() != null) {
            wrapper.le(WorkOrder::getCreateTime, queryDTO.getCreateTimeEnd());
        }
        if (queryDTO.getMinProgress() != null) {
            wrapper.ge(WorkOrder::getProcessProgress, queryDTO.getMinProgress());
        }
        if (queryDTO.getMaxProgress() != null) {
            wrapper.le(WorkOrder::getProcessProgress, queryDTO.getMaxProgress());
        }

        Page<WorkOrder> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());

        if (StringUtils.hasText(queryDTO.getOrderBy())) {
            boolean isAsc = "asc".equalsIgnoreCase(queryDTO.getOrderDirection());
            switch (queryDTO.getOrderBy()) {
                case "priority" ->
                        page.addOrder(isAsc ? OrderItem.asc("priority") : OrderItem.desc("priority"));
                case "planQuantity" ->
                        page.addOrder(isAsc ? OrderItem.asc("plan_quantity") : OrderItem.desc("plan_quantity"));
                case "processProgress" ->
                        page.addOrder(isAsc ? OrderItem.asc("process_progress") : OrderItem.desc("process_progress"));
                case "createTime" ->
                        page.addOrder(isAsc ? OrderItem.asc("create_time") : OrderItem.desc("create_time"));
                default -> page.addOrder(OrderItem.desc("priority"), OrderItem.desc("create_time"));
            }
        } else {
            page.addOrder(OrderItem.desc("priority"), OrderItem.desc("create_time"));
        }

        return workOrderMapper.selectPage(page, wrapper);
    }
}
