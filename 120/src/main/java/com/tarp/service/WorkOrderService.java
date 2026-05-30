package com.tarp.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tarp.dto.WorkOrderConfirmDTO;
import com.tarp.dto.WorkOrderCreateDTO;
import com.tarp.entity.TarpCategory;
import com.tarp.entity.WorkOrder;
import com.tarp.entity.WorkOrderMaterial;
import com.tarp.entity.WorkOrderStatusLog;
import com.tarp.exception.BusinessException;
import com.tarp.mapper.TarpCategoryMapper;
import com.tarp.mapper.WorkOrderMapper;
import com.tarp.mapper.WorkOrderMaterialMapper;
import com.tarp.mapper.WorkOrderStatusLogMapper;
import com.tarp.util.RedisUtil;
import com.tarp.util.StatusUtil;
import com.tarp.vo.PageVO;
import com.tarp.vo.WorkOrderMaterialVO;
import com.tarp.vo.WorkOrderStatusLogVO;
import com.tarp.vo.WorkOrderVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkOrderService {

    private static final String WORK_ORDER_CACHE_KEY = "tarp:workorder:";
    private static final long CACHE_EXPIRE_TIME = 1;

    private final WorkOrderMapper workOrderMapper;
    private final WorkOrderMaterialMapper workOrderMaterialMapper;
    private final WorkOrderStatusLogMapper statusLogMapper;
    private final TarpCategoryMapper tarpCategoryMapper;
    private final MaterialService materialService;
    private final RedisUtil redisUtil;
    private final ObjectMapper objectMapper;

    public PageVO<WorkOrderVO> page(int pageNum, int pageSize, Integer status) {
        Page<WorkOrder> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(WorkOrder::getStatus, status);
        }
        wrapper.orderByDesc(WorkOrder::getCreateTime);
        Page<WorkOrder> orderPage = workOrderMapper.selectPage(page, wrapper);

        List<WorkOrderVO> voList = orderPage.getRecords().stream()
                .map(this::convertToSimpleVO)
                .collect(Collectors.toList());

        return new PageVO<>(orderPage.getTotal(), voList, pageNum, pageSize);
    }

    @Transactional(rollbackFor = Exception.class)
    public WorkOrderVO createWorkOrder(WorkOrderCreateDTO dto) {
        TarpCategory category = tarpCategoryMapper.selectById(dto.getCategoryId());
        if (category == null) {
            throw new BusinessException("篷布分类不存在");
        }
        if (category.getStatus() == 0) {
            throw new BusinessException("该篷布版型已下架，无法创建工单");
        }

        String orderNo = "WO" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        WorkOrder workOrder = new WorkOrder();
        BeanUtils.copyProperties(dto, workOrder);
        workOrder.setOrderNo(orderNo);
        workOrder.setStatus(0);
        workOrder.setStartTime(LocalDateTime.now());
        workOrderMapper.insert(workOrder);

        saveStatusLog(workOrder.getId(), orderNo, null, 0, null, "创建工单");
        evictWorkOrderCache(workOrder.getId());

        return getDetailById(workOrder.getId());
    }

    @Transactional(rollbackFor = Exception.class)
    public WorkOrderVO confirmWorkOrder(WorkOrderConfirmDTO dto) {
        WorkOrder workOrder = workOrderMapper.selectById(dto.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        if (workOrder.getStatus() != 0) {
            throw new BusinessException("只有待下料状态的工单才能确认规格");
        }

        String lockKey = UUID.randomUUID().toString();
        try {
            for (WorkOrderConfirmDTO.MaterialItemDTO item : dto.getMaterials()) {
                boolean locked = materialService.lockStock(item.getMaterialId(), item.getUsageQuantity(), lockKey);
                if (!locked) {
                    throw new BusinessException("材料ID " + item.getMaterialId() + " 库存不足或锁定失败");
                }
            }

            BigDecimal materialCost = BigDecimal.ZERO;
            for (WorkOrderConfirmDTO.MaterialItemDTO item : dto.getMaterials()) {
                WorkOrderMaterial orderMaterial = new WorkOrderMaterial();
                orderMaterial.setWorkOrderId(dto.getWorkOrderId());
                orderMaterial.setMaterialId(item.getMaterialId());
                orderMaterial.setMaterialName(item.getMaterialName());
                orderMaterial.setUsageQuantity(item.getUsageQuantity());
                orderMaterial.setUnitPrice(item.getUnitPrice());
                orderMaterial.setTotalPrice(item.getTotalPrice());
                orderMaterial.setCreateTime(LocalDateTime.now());
                workOrderMaterialMapper.insert(orderMaterial);
                materialCost = materialCost.add(item.getTotalPrice());
            }

            workOrder.setMaterialCost(materialCost);
            workOrderMapper.updateById(workOrder);

            materialService.confirmStockLock(lockKey);

            updateStatus(dto.getWorkOrderId(), 1, null, "确认规格，开始裁剪");
            evictWorkOrderCache(dto.getWorkOrderId());

            return getDetailById(dto.getWorkOrderId());
        } catch (Exception e) {
            materialService.unlockStock(lockKey);
            throw e;
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public WorkOrderVO completeWorkOrder(Long id, Long operatorId, String operatorName, BigDecimal lossRatio) {
        WorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        if (workOrder.getStatus() != 5) {
            throw new BusinessException("只有质检中的工单才能完成");
        }

        BigDecimal actualMaterialCost = workOrder.getMaterialCost() != null ? workOrder.getMaterialCost() : BigDecimal.ZERO;
        BigDecimal laborCost = workOrder.getLaborCost() != null ? workOrder.getLaborCost() : BigDecimal.ZERO;

        BigDecimal lossCost = actualMaterialCost.multiply(lossRatio != null ? lossRatio : new BigDecimal("0.05"))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal comprehensiveCost = actualMaterialCost.add(laborCost).add(lossCost);

        workOrder.setLossCost(lossCost);
        workOrder.setComprehensiveCost(comprehensiveCost);
        workOrder.setTotalCost(comprehensiveCost);
        workOrder.setStatus(6);
        workOrder.setFinishTime(LocalDateTime.now());
        workOrderMapper.updateById(workOrder);

        saveStatusLog(id, workOrder.getOrderNo(), 5, 6, operatorName, "工单完成，综合成本：" + comprehensiveCost);
        evictWorkOrderCache(id);

        return getDetailById(id);
    }

    public WorkOrderVO getDetailById(Long id) {
        String cacheKey = WORK_ORDER_CACHE_KEY + id;
        String cacheValue = redisUtil.get(cacheKey);
        if (cacheValue != null) {
            try {
                return objectMapper.readValue(cacheValue, WorkOrderVO.class);
            } catch (Exception e) {
            }
        }

        WorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        WorkOrderVO vo = convertToDetailVO(workOrder);

        try {
            redisUtil.set(cacheKey, objectMapper.writeValueAsString(vo), CACHE_EXPIRE_TIME, java.util.concurrent.TimeUnit.HOURS);
        } catch (Exception e) {
        }

        return vo;
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStatus(Long id, Integer status, Long operatorId, String operatorName, String remark) {
        WorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        Integer oldStatus = workOrder.getStatus();

        if (oldStatus == 6) {
            throw new BusinessException("工单已完成，无法修改状态");
        }

        if (oldStatus == 7 && status != 0) {
            throw new BusinessException("暂停的工单只能恢复为待下料状态");
        }

        if (oldStatus != 7 && status != oldStatus + 1 && status != oldStatus - 1 && status != 7) {
            throw new BusinessException("工单状态流转不合法");
        }

        workOrder.setStatus(status);
        if (status == 6) {
            workOrder.setFinishTime(LocalDateTime.now());
        }

        workOrderMapper.updateById(workOrder);
        saveStatusLog(id, workOrder.getOrderNo(), oldStatus, status, operatorName, remark);
        evictWorkOrderCache(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void resumeOrder(Long id, Long operatorId, String operatorName) {
        WorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        if (workOrder.getStatus() != 7) {
            throw new BusinessException("工单不是暂停状态，无法恢复");
        }

        Integer oldStatus = workOrder.getStatus();
        workOrder.setStatus(0);
        workOrderMapper.updateById(workOrder);
        saveStatusLog(id, workOrder.getOrderNo(), oldStatus, 0, operatorName, "恢复工单");
        evictWorkOrderCache(id);
    }

    public List<WorkOrderMaterialVO> getOrderMaterials(Long orderId) {
        List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectList(
                new LambdaQueryWrapper<WorkOrderMaterial>().eq(WorkOrderMaterial::getWorkOrderId, orderId)
        );
        return materials.stream().map(this::convertMaterialToVO).collect(Collectors.toList());
    }

    public List<WorkOrderStatusLogVO> getStatusLogs(Long orderId) {
        List<WorkOrderStatusLog> logs = statusLogMapper.selectList(
                new LambdaQueryWrapper<WorkOrderStatusLog>()
                        .eq(WorkOrderStatusLog::getWorkOrderId, orderId)
                        .orderByDesc(WorkOrderStatusLog::getCreateTime)
        );
        return logs.stream().map(this::convertLogToVO).collect(Collectors.toList());
    }

    public void pauseTimeoutOrders() {
        LocalDateTime timeoutTime = LocalDateTime.now().minusDays(7);
        List<WorkOrder> timeoutOrders = workOrderMapper.selectList(
                new LambdaQueryWrapper<WorkOrder>()
                        .eq(WorkOrder::getStatus, 0)
                        .lt(WorkOrder::getCreateTime, timeoutTime)
        );

        for (WorkOrder order : timeoutOrders) {
            order.setStatus(7);
            workOrderMapper.updateById(order);
            saveStatusLog(order.getId(), order.getOrderNo(), 0, 7, "系统", "超时未下料自动暂停");
            evictWorkOrderCache(order.getId());
        }
    }

    private void saveStatusLog(Long workOrderId, String orderNo, Integer oldStatus, Integer newStatus, String operatorName, String remark) {
        WorkOrderStatusLog log = new WorkOrderStatusLog();
        log.setWorkOrderId(workOrderId);
        log.setOrderNo(orderNo);
        log.setOldStatus(oldStatus);
        log.setNewStatus(newStatus);
        log.setOperatorName(operatorName);
        log.setRemark(remark);
        log.setCreateTime(LocalDateTime.now());
        statusLogMapper.insert(log);
    }

    private void evictWorkOrderCache(Long id) {
        redisUtil.delete(WORK_ORDER_CACHE_KEY + id);
    }

    private WorkOrderVO convertToSimpleVO(WorkOrder workOrder) {
        WorkOrderVO vo = new WorkOrderVO();
        BeanUtils.copyProperties(workOrder, vo);
        vo.setStatusName(StatusUtil.getWorkOrderStatusName(workOrder.getStatus()));

        TarpCategory category = tarpCategoryMapper.selectById(workOrder.getCategoryId());
        if (category != null) {
            vo.setCategoryName(category.getCategoryName());
        }

        return vo;
    }

    private WorkOrderVO convertToDetailVO(WorkOrder workOrder) {
        WorkOrderVO vo = convertToSimpleVO(workOrder);
        vo.setMaterials(getOrderMaterials(workOrder.getId()));
        vo.setStatusLogs(getStatusLogs(workOrder.getId()));
        return vo;
    }

    private WorkOrderMaterialVO convertMaterialToVO(WorkOrderMaterial material) {
        WorkOrderMaterialVO vo = new WorkOrderMaterialVO();
        BeanUtils.copyProperties(material, vo);
        return vo;
    }

    private WorkOrderStatusLogVO convertLogToVO(WorkOrderStatusLog log) {
        WorkOrderStatusLogVO vo = new WorkOrderStatusLogVO();
        BeanUtils.copyProperties(log, vo);
        vo.setOldStatusName(StatusUtil.getWorkOrderStatusName(log.getOldStatus()));
        vo.setNewStatusName(StatusUtil.getWorkOrderStatusName(log.getNewStatus()));
        return vo;
    }
}
