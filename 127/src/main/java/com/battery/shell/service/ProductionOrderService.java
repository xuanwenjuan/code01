package com.battery.shell.service;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.battery.shell.annotation.Log;
import com.battery.shell.common.UserContext;
import com.battery.shell.constant.OrderStatus;
import com.battery.shell.dto.ProcessDTO;
import com.battery.shell.dto.ProductionOrderDTO;
import com.battery.shell.entity.Material;
import com.battery.shell.entity.ProductionLog;
import com.battery.shell.entity.ProductionOrder;
import com.battery.shell.entity.ShellCategory;
import com.battery.shell.exception.BusinessException;
import com.battery.shell.mapper.MaterialMapper;
import com.battery.shell.mapper.ProductionLogMapper;
import com.battery.shell.mapper.ProductionOrderMapper;
import com.battery.shell.mapper.ShellCategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductionOrderService {

    private final ProductionOrderMapper productionOrderMapper;
    private final ProductionLogMapper productionLogMapper;
    private final MaterialMapper materialMapper;
    private final ShellCategoryMapper shellCategoryMapper;

    private static final BigDecimal MOLD_COST_PER_UNIT = new BigDecimal("2.5");
    private static final BigDecimal ENERGY_COST_PER_UNIT = new BigDecimal("1.2");
    private static final BigDecimal LABOR_COST_PER_UNIT = new BigDecimal("3.0");
    private static final BigDecimal DEFECTIVE_COST_RATE = new BigDecimal("0.8");

    @Transactional(rollbackFor = Exception.class)
    @Log(value = "创建生产工单", module = "生产工单")
    public void createOrder(ProductionOrderDTO dto) {
        Material material = materialMapper.selectById(dto.getMaterialId());
        if (material == null) {
            throw new BusinessException("物料不存在");
        }

        ShellCategory category = shellCategoryMapper.selectById(dto.getCategoryId());
        if (category == null) {
            throw new BusinessException("壳体分类不存在");
        }

        if (category.getStatus() == 0) {
            throw new BusinessException("该壳体型号已下线，无法创建生产工单");
        }

        ProductionOrder order = new ProductionOrder();
        BeanUtils.copyProperties(dto, order);
        order.setOrderNo(generateOrderNo());
        order.setStatus(OrderStatus.PENDING);
        order.setActualQuantity(0);
        order.setDefectiveQuantity(0);
        if (dto.getMaterialUsage() == null) {
            order.setMaterialUsage(BigDecimal.ZERO);
        }
        productionOrderMapper.insert(order);
    }

    @Transactional(rollbackFor = Exception.class)
    @Log(value = "更新生产工单", module = "生产工单")
    public void updateOrder(ProductionOrderDTO dto) {
        ProductionOrder order = productionOrderMapper.selectById(dto.getId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatus.PENDING.equals(order.getStatus())) {
            throw new BusinessException("工单已开始生产，无法修改");
        }

        if (dto.getCategoryId() != null && !dto.getCategoryId().equals(order.getCategoryId())) {
            ShellCategory category = shellCategoryMapper.selectById(dto.getCategoryId());
            if (category == null) {
                throw new BusinessException("壳体分类不存在");
            }
            if (category.getStatus() == 0) {
                throw new BusinessException("该壳体型号已下线，无法修改为此分类");
            }
        }

        BeanUtils.copyProperties(dto, order);
        productionOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    @Log(value = "删除生产工单", module = "生产工单")
    public void deleteOrder(Long id) {
        ProductionOrder order = productionOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatus.PENDING.equals(order.getStatus())) {
            throw new BusinessException("工单已开始生产，无法删除");
        }
        productionOrderMapper.deleteById(id);
    }

    public ProductionOrder getOrderById(Long id) {
        return productionOrderMapper.selectById(id);
    }

    public List<ProductionOrder> getOrderList(String status, Long categoryId) {
        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            wrapper.eq(ProductionOrder::getStatus, status);
        }
        if (categoryId != null) {
            wrapper.eq(ProductionOrder::getCategoryId, categoryId);
        }
        wrapper.orderByDesc(ProductionOrder::getCreateTime);
        return productionOrderMapper.selectList(wrapper);
    }

    public List<ProductionLog> getOrderLogs(Long orderId) {
        return productionLogMapper.selectList(
                new LambdaQueryWrapper<ProductionLog>()
                        .eq(ProductionLog::getOrderId, orderId)
                        .orderByAsc(ProductionLog::getOperationTime)
        );
    }

    @Transactional(rollbackFor = Exception.class)
    @Log(value = "确认加工工艺并锁定库存", module = "生产工单")
    public void confirmProcessAndLockStock(Long orderId, BigDecimal materialUsage) {
        ProductionOrder order = productionOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        if (!OrderStatus.PENDING.equals(order.getStatus())) {
            throw new BusinessException("只有待排产工单可以确认工艺");
        }

        Material material = materialMapper.selectById(order.getMaterialId());
        if (material == null) {
            throw new BusinessException("物料不存在");
        }

        if (material.getStockQuantity().compareTo(materialUsage) < 0) {
            throw new BusinessException("物料库存不足，无法锁定");
        }

        material.setStockQuantity(material.getStockQuantity().subtract(materialUsage));
        if (material.getStockQuantity().compareTo(material.getWarningQuantity()) <= 0) {
            material.setStatus("WARNING");
        }
        materialMapper.updateById(material);

        order.setMaterialUsage(materialUsage);
        order.setStatus(OrderStatus.CUTTING);
        order.setActualStartTime(LocalDateTime.now());
        productionOrderMapper.updateById(order);

        Long userId = UserContext.getUserId();
        String username = UserContext.getUsername();
        saveProductionLog(order, "PROCESS_CONFIRM", order.getPlanQuantity(), "确认加工工艺并锁定库存", userId, username);
    }

    @Transactional(rollbackFor = Exception.class)
    @Log(value = "开始工序", module = "生产工单")
    public void startProcess(ProcessDTO dto) {
        ProductionOrder order = productionOrderMapper.selectById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        validateProcessStart(order.getStatus(), dto.getProcessStep());

        Long userId = UserContext.getUserId();
        String username = UserContext.getUsername();

        order.setStatus(dto.getProcessStep());
        productionOrderMapper.updateById(order);

        saveProductionLog(order, dto.getProcessStep() + "_START", dto.getQuantity(), dto.getRemark(), userId, username);
    }

    @Transactional(rollbackFor = Exception.class)
    @Log(value = "完成工序", module = "生产工单")
    public void completeProcess(ProcessDTO dto) {
        ProductionOrder order = productionOrderMapper.selectById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        if (!dto.getProcessStep().equals(order.getStatus())) {
            throw new BusinessException("当前工序不匹配，请先开始当前工序");
        }

        int currentIndex = OrderStatus.getProcessIndex(dto.getProcessStep());
        String nextStatus;
        boolean isFinished = false;

        if (currentIndex == OrderStatus.PROCESS_FLOW.length - 1) {
            nextStatus = OrderStatus.FINISHED;
            order.setActualEndTime(LocalDateTime.now());
            isFinished = true;
        } else {
            nextStatus = OrderStatus.PROCESS_FLOW[currentIndex + 1];
        }

        order.setStatus(nextStatus);
        order.setActualQuantity(order.getActualQuantity() + dto.getQuantity());
        if (dto.getDefectiveQuantity() != null) {
            order.setDefectiveQuantity(order.getDefectiveQuantity() + dto.getDefectiveQuantity());
        }
        productionOrderMapper.updateById(order);

        Long userId = UserContext.getUserId();
        String username = UserContext.getUsername();

        saveProductionLog(order, dto.getProcessStep() + "_COMPLETE", dto.getQuantity(), dto.getRemark(), userId, username);

        if (isFinished) {
            calculateOrderCost(order);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    private void calculateOrderCost(ProductionOrder order) {
        int quantity = order.getActualQuantity();
        int defective = order.getDefectiveQuantity();

        BigDecimal materialCost = order.getMaterialUsage() != null ? order.getMaterialUsage() : BigDecimal.ZERO;
        BigDecimal moldCost = BigDecimal.valueOf(quantity).multiply(MOLD_COST_PER_UNIT);
        BigDecimal energyCost = BigDecimal.valueOf(quantity).multiply(ENERGY_COST_PER_UNIT);
        BigDecimal laborCost = BigDecimal.valueOf(quantity).multiply(LABOR_COST_PER_UNIT);
        BigDecimal defectiveCost = BigDecimal.valueOf(defective)
                .multiply(DEFECTIVE_COST_RATE)
                .multiply(MOLD_COST_PER_UNIT.add(ENERGY_COST_PER_UNIT).add(LABOR_COST_PER_UNIT));

        BigDecimal totalCost = materialCost.add(moldCost).add(energyCost).add(laborCost).add(defectiveCost);
        BigDecimal unitCost = quantity > 0 ? totalCost.divide(BigDecimal.valueOf(quantity), 4, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        Map<String, Object> costDetail = new HashMap<>();
        costDetail.put("orderId", order.getId());
        costDetail.put("orderNo", order.getOrderNo());
        costDetail.put("materialCost", materialCost);
        costDetail.put("moldCost", moldCost);
        costDetail.put("energyCost", energyCost);
        costDetail.put("laborCost", laborCost);
        costDetail.put("defectiveCost", defectiveCost);
        costDetail.put("totalCost", totalCost);
        costDetail.put("unitCost", unitCost);
        costDetail.put("quantity", quantity);
        costDetail.put("defectiveQuantity", defective);

        ProductionLog costLog = new ProductionLog();
        costLog.setOrderId(order.getId());
        costLog.setOrderNo(order.getOrderNo());
        costLog.setProcessStep("COST_CALCULATION");
        costLog.setOperatorId(UserContext.getUserId());
        costLog.setOperatorName(UserContext.getUsername());
        costLog.setOperationTime(LocalDateTime.now());
        costLog.setQuantity(quantity);
        costLog.setRemark("成本核算完成，总成本：" + totalCost + "，单位成本：" + unitCost);
        productionLogMapper.insert(costLog);
    }

    public Map<String, Object> getOrderCostDetail(Long orderId) {
        ProductionOrder order = productionOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        int quantity = order.getActualQuantity();
        int defective = order.getDefectiveQuantity();

        BigDecimal materialCost = order.getMaterialUsage() != null ? order.getMaterialUsage() : BigDecimal.ZERO;
        BigDecimal moldCost = BigDecimal.valueOf(quantity).multiply(MOLD_COST_PER_UNIT);
        BigDecimal energyCost = BigDecimal.valueOf(quantity).multiply(ENERGY_COST_PER_UNIT);
        BigDecimal laborCost = BigDecimal.valueOf(quantity).multiply(LABOR_COST_PER_UNIT);
        BigDecimal defectiveCost = BigDecimal.valueOf(defective)
                .multiply(DEFECTIVE_COST_RATE)
                .multiply(MOLD_COST_PER_UNIT.add(ENERGY_COST_PER_UNIT).add(LABOR_COST_PER_UNIT));

        BigDecimal totalCost = materialCost.add(moldCost).add(energyCost).add(laborCost).add(defectiveCost);
        BigDecimal unitCost = quantity > 0 ? totalCost.divide(BigDecimal.valueOf(quantity), 4, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        Map<String, Object> result = new HashMap<>();
        result.put("orderId", order.getId());
        result.put("orderNo", order.getOrderNo());
        result.put("quantity", quantity);
        result.put("defectiveQuantity", defective);
        result.put("materialCost", materialCost);
        result.put("moldCost", moldCost);
        result.put("energyCost", energyCost);
        result.put("laborCost", laborCost);
        result.put("defectiveCost", defectiveCost);
        result.put("totalCost", totalCost);
        result.put("unitCost", unitCost);
        result.put("materialUsage", order.getMaterialUsage());

        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    @Log(value = "暂停工单", module = "生产工单")
    public void pauseOrder(Long id) {
        ProductionOrder order = productionOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (OrderStatus.PAUSED.equals(order.getStatus()) ||
            OrderStatus.FINISHED.equals(order.getStatus()) ||
            OrderStatus.CANCELLED.equals(order.getStatus())) {
            throw new BusinessException("工单当前状态不能暂停");
        }
        order.setStatus(OrderStatus.PAUSED);
        productionOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    @Log(value = "恢复工单", module = "生产工单")
    public void resumeOrder(Long id) {
        ProductionOrder order = productionOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatus.PAUSED.equals(order.getStatus())) {
            throw new BusinessException("工单未暂停，无法恢复");
        }
        order.setStatus(OrderStatus.PENDING);
        productionOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    @Log(value = "取消工单", module = "生产工单")
    public void cancelOrder(Long id) {
        ProductionOrder order = productionOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (OrderStatus.FINISHED.equals(order.getStatus())) {
            throw new BusinessException("工单已完成，无法取消");
        }

        if (order.getMaterialUsage() != null && order.getMaterialUsage().compareTo(BigDecimal.ZERO) > 0) {
            Material material = materialMapper.selectById(order.getMaterialId());
            if (material != null) {
                material.setStockQuantity(material.getStockQuantity().add(order.getMaterialUsage()));
                if (material.getStockQuantity().compareTo(material.getWarningQuantity()) > 0) {
                    material.setStatus("ENOUGH");
                }
                materialMapper.updateById(material);
            }
        }

        order.setStatus(OrderStatus.CANCELLED);
        productionOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void autoPauseOverdueOrders() {
        LocalDateTime overdueTime = LocalDateTime.now().minusDays(1);
        List<ProductionOrder> orders = productionOrderMapper.selectList(
                new LambdaQueryWrapper<ProductionOrder>()
                        .eq(ProductionOrder::getStatus, OrderStatus.PENDING)
                        .le(ProductionOrder::getPlanStartTime, overdueTime)
        );
        for (ProductionOrder order : orders) {
            order.setStatus(OrderStatus.PAUSED);
            productionOrderMapper.updateById(order);
        }
    }

    private void validateProcessStart(String currentStatus, String nextStep) {
        if (!OrderStatus.isInProcess(nextStep)) {
            throw new BusinessException("无效的工序步骤");
        }

        if (OrderStatus.PENDING.equals(currentStatus) || OrderStatus.PAUSED.equals(currentStatus)) {
            if (!OrderStatus.CUTTING.equals(nextStep)) {
                throw new BusinessException("首工序必须是裁切下料");
            }
        } else if (OrderStatus.isInProcess(currentStatus)) {
            int currentIndex = OrderStatus.getProcessIndex(currentStatus);
            int nextIndex = OrderStatus.getProcessIndex(nextStep);
            if (nextIndex != currentIndex) {
                throw new BusinessException("工序顺序错误，请按顺序执行");
            }
        } else {
            throw new BusinessException("工单当前状态不允许开始工序");
        }
    }

    private void saveProductionLog(ProductionOrder order, String processStep, Integer quantity,
                                   String remark, Long userId, String username) {
        ProductionLog log = new ProductionLog();
        log.setOrderId(order.getId());
        log.setOrderNo(order.getOrderNo());
        log.setProcessStep(processStep);
        log.setOperatorId(userId);
        log.setOperatorName(username);
        log.setOperationTime(LocalDateTime.now());
        log.setQuantity(quantity);
        log.setRemark(remark);
        productionLogMapper.insert(log);
    }

    private String generateOrderNo() {
        return "PO" + IdUtil.getSnowflakeNextIdStr();
    }
}
