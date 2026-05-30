package com.incense.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.incense.context.UserContext;
import com.incense.dto.MaterialUsageDTO;
import com.incense.dto.ProductionOrderDTO;
import com.incense.entity.*;
import com.incense.exception.BusinessException;
import com.incense.mapper.ProductionOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductionOrderService extends ServiceImpl<ProductionOrderMapper, ProductionOrder> {

    private static final String ORDER_STATUS_KEY = "incense:order:status:";

    private final CategoryService categoryService;
    private final OrderProcessLogService processLogService;
    private final OrderMaterialUsageService materialUsageService;
    private final MaterialService materialService;
    private final MaterialLedgerService ledgerService;
    private final MaterialStockLockService stockLockService;
    private final ProductionCostService productionCostService;
    private final RedisTemplate<String, Object> redisTemplate;

    @Transactional(rollbackFor = Exception.class)
    public void createOrder(ProductionOrderDTO dto) {
        categoryService.checkCategoryActive(dto.getCategoryId());

        Category category = categoryService.getById(dto.getCategoryId());
        if (category == null) {
            throw new BusinessException("品类不存在");
        }

        ProductionOrder order = new ProductionOrder();
        BeanUtils.copyProperties(dto, order);
        order.setCategoryName(category.getCategoryName());
        order.setOrderNo(generateOrderNo());
        order.setStatus("PENDING");
        order.setCreateTime(LocalDateTime.now());
        save(order);

        addProcessLog(order.getId(), order.getOrderNo(), "创建工单", "工单已创建，等待启动");
        updateOrderStatusCache(order.getId(), order.getStatus());
    }

    @Transactional(rollbackFor = Exception.class)
    public void confirmFormula(Long orderId, String formulaDetail, List<MaterialUsageDTO> materialList) {
        ProductionOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!"PENDING".equals(order.getStatus())) {
            throw new BusinessException("工单已启动，无法重新确认配方");
        }

        stockLockService.releaseStockByOrderId(orderId);

        if (materialList != null && !materialList.isEmpty()) {
            Map<Long, BigDecimal> materialQuantities = materialList.stream()
                    .collect(Collectors.toMap(MaterialUsageDTO::getMaterialId, MaterialUsageDTO::getUsageQuantity));
            stockLockService.batchLockStock(orderId, order.getOrderNo(), materialQuantities, "配方确认锁定库存");
        }

        order.setFormulaDetail(formulaDetail);
        updateById(order);

        addProcessLog(orderId, order.getOrderNo(), "配方确认", "配方已确认，原料库存已锁定");
        log.info("工单{}配方确认完成，锁定{}种原料", order.getOrderNo(), materialList != null ? materialList.size() : 0);
    }

    @Transactional(rollbackFor = Exception.class)
    public void startMixing(Long orderId) {
        ProductionOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!"PENDING".equals(order.getStatus())) {
            throw new BusinessException("工单状态不正确，当前状态: " + order.getStatus());
        }
        if (order.getActualQuantity() == null || order.getActualQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("请先设置实际生产数量");
        }

        order.setStatus("MIXING");
        order.setStartTime(LocalDateTime.now());
        order.setMasterId(UserContext.getUserId());
        order.setMasterName(UserContext.getUsername());
        updateById(order);

        addProcessLog(orderId, order.getOrderNo(), "开始拌料", "粉料混合工序已开始");
        updateOrderStatusCache(orderId, order.getStatus());
    }

    @Transactional(rollbackFor = Exception.class)
    public void startKneading(Long orderId, String remark) {
        transitionStatus(orderId, "MIXING", "KNEADING", "开始揉泥挤香", remark);
    }

    @Transactional(rollbackFor = Exception.class)
    public void startDrying(Long orderId, String remark) {
        transitionStatus(orderId, "KNEADING", "DRYING", "开始晾晒阴干", remark);
    }

    @Transactional(rollbackFor = Exception.class)
    public void startCutting(Long orderId, String remark) {
        transitionStatus(orderId, "DRYING", "CUTTING", "开始裁切规整", remark);
    }

    @Transactional(rollbackFor = Exception.class)
    public void finishPackaging(Long orderId, String remark, List<MaterialUsageDTO> materialUsages) {
        ProductionOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!"CUTTING".equals(order.getStatus())) {
            throw new BusinessException("工单状态不正确，当前状态: " + order.getStatus());
        }

        order.setStatus("PACKAGED");
        order.setFinishTime(LocalDateTime.now());
        if (order.getActualQuantity() == null) {
            order.setActualQuantity(order.getTargetQuantity());
        }
        updateById(order);

        if (materialUsages != null && !materialUsages.isEmpty()) {
            for (MaterialUsageDTO usage : materialUsages) {
                materialUsageService.recordUsage(orderId, order.getOrderNo(), usage);
            }
        }

        productionCostService.calculateAndSaveCost(orderId);

        addProcessLog(orderId, order.getOrderNo(), "封装入库", remark != null ? remark : "工单生产完成");
        updateOrderStatusCache(orderId, order.getStatus());
    }

    private void transitionStatus(Long orderId, String expectedStatus, String nextStatus, String stepName, String remark) {
        ProductionOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!expectedStatus.equals(order.getStatus())) {
            throw new BusinessException("工单状态不正确，期望: " + expectedStatus + ", 当前: " + order.getStatus());
        }

        order.setStatus(nextStatus);
        updateById(order);

        addProcessLog(orderId, order.getOrderNo(), stepName, remark != null ? remark : stepName + "工序已开始");
        updateOrderStatusCache(orderId, order.getStatus());
    }

    @Transactional(rollbackFor = Exception.class)
    public void freezeOrder(Long orderId, String reason) {
        ProductionOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if ("PACKAGED".equals(order.getStatus())) {
            throw new BusinessException("已完成工单无法冻结");
        }

        order.setStatus("FROZEN");
        order.setFreezeReason(reason);
        updateById(order);

        addProcessLog(orderId, order.getOrderNo(), "工单冻结", reason);
        updateOrderStatusCache(orderId, order.getStatus());
    }

    @Transactional(rollbackFor = Exception.class)
    public void unfreezeOrder(Long orderId, String remark) {
        ProductionOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!"FROZEN".equals(order.getStatus())) {
            throw new BusinessException("只有冻结状态的工单才能解冻");
        }

        order.setStatus("PENDING");
        updateById(order);

        addProcessLog(orderId, order.getOrderNo(), "工单解冻", remark != null ? remark : "工单已解冻");
        updateOrderStatusCache(orderId, order.getStatus());
    }

    @Transactional(rollbackFor = Exception.class)
    public void cancelOrder(Long orderId, String reason) {
        ProductionOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if ("PACKAGED".equals(order.getStatus())) {
            throw new BusinessException("已完成工单无法取消");
        }

        order.setStatus("CANCELLED");
        updateById(order);

        addProcessLog(orderId, order.getOrderNo(), "工单取消", reason);
        updateOrderStatusCache(orderId, order.getStatus());
    }

    public Page<ProductionOrder> getPage(int pageNum, int pageSize, String status, Long categoryId) {
        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            wrapper.eq(ProductionOrder::getStatus, status);
        }
        if (categoryId != null) {
            wrapper.eq(ProductionOrder::getCategoryId, categoryId);
        }
        wrapper.orderByDesc(ProductionOrder::getCreateTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    public Map<String, Long> getOrderStatusStats() {
        List<ProductionOrder> orders = list();
        return orders.stream()
                .collect(Collectors.groupingBy(
                        ProductionOrder::getStatus,
                        Collectors.counting()
                ));
    }

    public String getOrderStatusFromCache(Long orderId) {
        Object status = redisTemplate.opsForValue().get(ORDER_STATUS_KEY + orderId);
        return status != null ? status.toString() : null;
    }

    private void updateOrderStatusCache(Long orderId, String status) {
        redisTemplate.opsForValue().set(ORDER_STATUS_KEY + orderId, status);
    }

    private String generateOrderNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = count(new LambdaQueryWrapper<ProductionOrder>()
                .likeRight(ProductionOrder::getOrderNo, "WO" + dateStr));
        return "WO" + dateStr + String.format("%04d", count + 1);
    }

    private void addProcessLog(Long orderId, String orderNo, String processStep, String remark) {
        OrderProcessLog log = new OrderProcessLog();
        log.setOrderId(orderId);
        log.setOrderNo(orderNo);
        log.setProcessStep(processStep);
        log.setOperatorId(UserContext.getUserId());
        log.setOperatorName(UserContext.getUsername());
        log.setOperationTime(LocalDateTime.now());
        log.setRemark(remark);
        processLogService.save(log);
    }
}
