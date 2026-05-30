package com.stationery.manufacture.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.stationery.manufacture.common.BusinessException;
import com.stationery.manufacture.common.ErrorCode;
import com.stationery.manufacture.common.UserContext;
import com.stationery.manufacture.entity.*;
import com.stationery.manufacture.mapper.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProductionBusinessService {

    private final ProductionOrderMapper orderMapper;
    private final OrderProcessMapper processMapper;
    private final OrderMaterialMapper materialMapper;
    private final MaterialStockMapper stockMapper;
    private final StockBusinessService stockBusinessService;

    public ProductionBusinessService(ProductionOrderMapper orderMapper,
                                     OrderProcessMapper processMapper,
                                     OrderMaterialMapper materialMapper,
                                     MaterialStockMapper stockMapper,
                                     StockBusinessService stockBusinessService) {
        this.orderMapper = orderMapper;
        this.processMapper = processMapper;
        this.materialMapper = materialMapper;
        this.stockMapper = stockMapper;
        this.stockBusinessService = stockBusinessService;
    }

    @Transactional(rollbackFor = Exception.class)
    public void scheduleOrder(Long orderId, LocalDateTime planStartTime, LocalDateTime planEndTime,
                              Long productionUserId, String productionUserName,
                              Long designUserId, String designUserName) {
        ProductionOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }
        if (order.getOrderStatus() != 0 && order.getOrderStatus() != 9) {
            throw new BusinessException("工单状态不允许排产");
        }

        order.setPlanStartTime(planStartTime);
        order.setPlanEndTime(planEndTime);
        order.setProductionUserId(productionUserId);
        order.setProductionUserName(productionUserName);
        if (designUserId != null) {
            order.setDesignUserId(designUserId);
            order.setDesignUserName(designUserName);
        }
        order.setOrderStatus(1);
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void allocateMaterials(Long orderId) {
        ProductionOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }
        if (order.getOrderStatus() < 1) {
            throw new BusinessException("请先排产再领料");
        }

        List<OrderMaterial> materials = materialMapper.selectList(
                new LambdaQueryWrapper<OrderMaterial>().eq(OrderMaterial::getOrderId, orderId));

        for (OrderMaterial material : materials) {
            stockBusinessService.allocateMaterial(orderId, material.getMaterialId(),
                    material.getPlannedQuantity(), material.getBatchNo());

            material.setActualQuantity(material.getPlannedQuantity());
            material.setUpdateTime(LocalDateTime.now());
            materialMapper.updateById(material);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void returnMaterial(Long orderId, Long materialId, BigDecimal quantity) {
        OrderMaterial material = materialMapper.selectOne(new LambdaQueryWrapper<OrderMaterial>()
                .eq(OrderMaterial::getOrderId, orderId)
                .eq(OrderMaterial::getMaterialId, materialId));
        if (material == null) {
            throw new BusinessException("工单用料不存在");
        }

        BigDecimal newActual = material.getActualQuantity().subtract(quantity);
        if (newActual.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("退料数量不能超过已领数量");
        }

        material.setActualQuantity(newActual);
        material.setUpdateTime(LocalDateTime.now());
        materialMapper.updateById(material);

        StockInbound inbound = new StockInbound();
        inbound.setMaterialId(materialId);
        inbound.setQuantity(quantity);
        inbound.setUnitPrice(material.getUnitPrice());
        inbound.setRemark("生产退料 - 工单:" + orderId);
        stockBusinessService.createInbound(inbound);
    }

    @Transactional(rollbackFor = Exception.class)
    public void startProcess(Long orderId, Long processId) {
        OrderProcess process = processMapper.selectById(processId);
        if (process == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }
        if (!process.getOrderId().equals(orderId)) {
            throw new BusinessException("工序不属于该工单");
        }
        if (process.getProcessStatus() != 0) {
            throw new BusinessException("工序状态不允许开始");
        }

        List<OrderProcess> processes = processMapper.selectList(new LambdaQueryWrapper<OrderProcess>()
                .eq(OrderProcess::getOrderId, orderId)
                .orderByAsc(OrderProcess::getProcessSort));

        for (OrderProcess p : processes) {
            if (p.getProcessSort() < process.getProcessSort() && p.getProcessStatus() != 2) {
                throw new BusinessException("请先完成前序工序：" + p.getProcessName());
            }
            if (p.getProcessSort().equals(process.getProcessSort())) {
                break;
            }
        }

        process.setProcessStatus(1);
        process.setStartTime(LocalDateTime.now());
        process.setOperatorId(UserContext.getCurrentUserId());
        process.setOperatorName(UserContext.getCurrentUsername());
        process.setUpdateTime(LocalDateTime.now());
        processMapper.updateById(process);

        updateOrderStatus(orderId);
    }

    @Transactional(rollbackFor = Exception.class)
    public void reportProcess(Long orderId, Long processId, BigDecimal workingHours,
                              Integer outputQty, Integer defectiveQty, String remark) {
        OrderProcess process = processMapper.selectById(processId);
        if (process == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }
        if (process.getProcessStatus() != 1) {
            throw new BusinessException("工序未开始或已完成");
        }

        process.setProcessStatus(2);
        process.setEndTime(LocalDateTime.now());
        process.setWorkingHours(workingHours);
        process.setProcessRemark(remark);
        process.setUpdateTime(LocalDateTime.now());
        processMapper.updateById(process);

        boolean hasNext = startNextProcess(orderId);
        updateOrderStatus(orderId);

        if (!hasNext) {
            ProductionOrder order = orderMapper.selectById(orderId);
            order.setOrderStatus(4);
            order.setActualEndTime(LocalDateTime.now());
            order.setUpdateTime(LocalDateTime.now());
            orderMapper.updateById(order);
        }
    }

    private boolean startNextProcess(Long orderId) {
        List<OrderProcess> processes = processMapper.selectList(new LambdaQueryWrapper<OrderProcess>()
                .eq(OrderProcess::getOrderId, orderId)
                .orderByAsc(OrderProcess::getProcessSort));

        for (OrderProcess process : processes) {
            if (process.getProcessStatus() == 0) {
                process.setProcessStatus(1);
                process.setStartTime(LocalDateTime.now());
                process.setUpdateTime(LocalDateTime.now());
                processMapper.updateById(process);
                return true;
            }
        }
        return false;
    }

    private void updateOrderStatus(Long orderId) {
        List<OrderProcess> processes = processMapper.selectList(new LambdaQueryWrapper<OrderProcess>()
                .eq(OrderProcess::getOrderId, orderId));

        long completed = processes.stream().filter(p -> p.getProcessStatus() == 2).count();
        long inProgress = processes.stream().filter(p -> p.getProcessStatus() == 1).count();
        long total = processes.size();

        int newStatus;
        if (completed == total) {
            newStatus = 3;
        } else if (completed > 0 || inProgress > 0) {
            newStatus = 2;
        } else {
            newStatus = 1;
        }

        orderMapper.update(null, new LambdaUpdateWrapper<ProductionOrder>()
                .eq(ProductionOrder::getId, orderId)
                .set(ProductionOrder::getOrderStatus, newStatus)
                .set(ProductionOrder::getUpdateTime, LocalDateTime.now()));
    }

    @Transactional(rollbackFor = Exception.class)
    public void qualityInspection(Long orderId, Integer qualified, Integer defective, String remark) {
        ProductionOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }
        if (order.getOrderStatus() != 4) {
            throw new BusinessException("工单未完成生产，无法质检");
        }

        if (qualified + defective > order.getQuantity()) {
            throw new BusinessException("质检数量不能超过生产数量");
        }

        order.setQualifiedQuantity(qualified);
        order.setDefectiveQuantity(defective);
        order.setInspectionUserId(UserContext.getCurrentUserId());
        order.setInspectionUserName(UserContext.getCurrentUsername());
        order.setOrderStatus(5);
        order.setUpdateTime(LocalDateTime.now());
        order.setRemark(StringUtils.hasText(order.getRemark())
                ? order.getRemark() + "; 质检备注:" + remark
                : "质检备注:" + remark);
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void finishOrder(Long id) {
        ProductionOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }
        if (order.getOrderStatus() != 5) {
            throw new BusinessException("请先完成质检再完结工单");
        }

        order.setOrderStatus(6);
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void suspendOrder(Long id, String reason) {
        ProductionOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }
        if (order.getOrderStatus() >= 4) {
            throw new BusinessException("生产已完成，无法暂停");
        }

        order.setOrderStatus(9);
        order.setRemark(StringUtils.hasText(order.getRemark())
                ? order.getRemark() + "; 暂停原因:" + reason
                : "暂停原因:" + reason);
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void resumeOrder(Long id) {
        ProductionOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }
        if (order.getOrderStatus() != 9) {
            throw new BusinessException("工单未暂停");
        }

        List<OrderProcess> processes = processMapper.selectList(new LambdaQueryWrapper<OrderProcess>()
                .eq(OrderProcess::getOrderId, id)
                .orderByAsc(OrderProcess::getProcessSort));

        boolean hasIncomplete = processes.stream().anyMatch(p -> p.getProcessStatus() != 2);
        order.setOrderStatus(hasIncomplete ? 2 : 1);
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.updateById(order);
    }

    public Page<ProductionOrder> getOrderPageByRole(Integer pageNum, Integer pageSize,
                                                     Integer orderStatus, String productName,
                                                     Long categoryId, Integer priority) {
        String userRole = UserContext.getCurrentRole();
        Long userId = UserContext.getCurrentUserId();

        Page<ProductionOrder> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();

        if (!"ADMIN".equals(userRole)) {
            if ("DESIGNER".equals(userRole)) {
                wrapper.eq(ProductionOrder::getDesignUserId, userId);
            } else if ("PRODUCTION_LEADER".equals(userRole)) {
                wrapper.eq(ProductionOrder::getProductionUserId, userId);
            } else if ("INSPECTOR".equals(userRole)) {
                wrapper.eq(ProductionOrder::getInspectionUserId, userId)
                        .or()
                        .eq(ProductionOrder::getOrderStatus, 4);
            }
        }

        if (orderStatus != null) {
            wrapper.eq(ProductionOrder::getOrderStatus, orderStatus);
        }
        if (StringUtils.hasText(productName)) {
            wrapper.like(ProductionOrder::getProductName, productName);
        }
        if (categoryId != null) {
            wrapper.eq(ProductionOrder::getCategoryId, categoryId);
        }
        if (priority != null) {
            wrapper.eq(ProductionOrder::getPriority, priority);
        }

        wrapper.orderByDesc(ProductionOrder::getPriority)
                .orderByDesc(ProductionOrder::getCreateTime);
        return orderMapper.selectPage(page, wrapper);
    }

    public Map<String, Object> getOrderProgress(Long orderId) {
        ProductionOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }

        List<OrderProcess> processes = processMapper.selectList(new LambdaQueryWrapper<OrderProcess>()
                .eq(OrderProcess::getOrderId, orderId)
                .orderByAsc(OrderProcess::getProcessSort));

        long completed = processes.stream().filter(p -> p.getProcessStatus() == 2).count();
        long inProgress = processes.stream().filter(p -> p.getProcessStatus() == 1).count();
        long total = processes.size();
        BigDecimal progress = total > 0
                ? new BigDecimal(completed).multiply(new BigDecimal(100))
                .divide(new BigDecimal(total), 2, BigDecimal.ROUND_HALF_UP)
                : BigDecimal.ZERO;

        Map<String, Object> result = new HashMap<>();
        result.put("orderId", orderId);
        result.put("orderNo", order.getOrderNo());
        result.put("productName", order.getProductName());
        result.put("orderStatus", order.getOrderStatus());
        result.put("quantity", order.getQuantity());
        result.put("totalProcess", total);
        result.put("completedProcess", completed);
        result.put("inProgressProcess", inProgress);
        result.put("progress", progress);
        result.put("processes", processes);
        return result;
    }

    public List<Map<String, Object>> getWorkshopDashboard() {
        List<Map<String, Object>> result = new ArrayList<>();

        String[] statuses = {"待排产", "已排产", "生产中", "生产完成", "待质检", "质检完成", "已完结", "", "", "已暂停"};
        int[] statusCodes = {0, 1, 2, 3, 4, 5, 6, -1, -1, 9};

        for (int i = 0; i < statusCodes.length; i++) {
            if (statusCodes[i] < 0) continue;
            long count = orderMapper.selectCount(new LambdaQueryWrapper<ProductionOrder>()
                    .eq(ProductionOrder::getOrderStatus, statusCodes[i]));
            Map<String, Object> item = new HashMap<>();
            item.put("status", statusCodes[i]);
            item.put("statusName", statuses[i]);
            item.put("count", count);
            result.add(item);
        }

        return result;
    }
}
