package com.hydraulic.piston.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hydraulic.piston.common.StockStatusEnum;
import com.hydraulic.piston.dto.ProcessCompleteDTO;
import com.hydraulic.piston.dto.ProductionOrderDTO;
import com.hydraulic.piston.dto.QualityCheckDTO;
import com.hydraulic.piston.entity.MaterialStock;
import com.hydraulic.piston.entity.PistonCategory;
import com.hydraulic.piston.entity.ProductionCost;
import com.hydraulic.piston.entity.ProductionOrder;
import com.hydraulic.piston.exception.BusinessException;
import com.hydraulic.piston.mapper.MaterialStockMapper;
import com.hydraulic.piston.mapper.PistonCategoryMapper;
import com.hydraulic.piston.mapper.ProductionCostMapper;
import com.hydraulic.piston.mapper.ProductionOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionOrderService {

    private final ProductionOrderMapper orderMapper;
    private final PistonCategoryMapper categoryMapper;
    private final MaterialStockMapper materialStockMapper;
    private final ProductionCostMapper productionCostMapper;
    private final MaterialStockService materialStockService;

    public static final int PROCESS_CUTTING = 1;
    public static final int PROCESS_ROUGH_TURNING = 2;
    public static final int PROCESS_FINISH_TURNING = 3;
    public static final int PROCESS_ROLLING = 4;
    public static final int PROCESS_QUENCHING = 5;
    public static final int PROCESS_GRINDING = 6;
    public static final int PROCESS_QUALITY = 7;

    public static final int STATUS_PENDING = 0;
    public static final int STATUS_IN_PROGRESS = 1;
    public static final int STATUS_PAUSED = 2;
    public static final int STATUS_COMPLETED = 3;
    public static final int STATUS_CANCELLED = 4;

    public Page<ProductionOrder> getPage(Integer pageNum, Integer pageSize, String pistonModel,
                                          Integer status, Integer currentProcess) {
        Page<ProductionOrder> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(pistonModel)) {
            wrapper.like(ProductionOrder::getPistonModel, pistonModel);
        }
        if (status != null) {
            wrapper.eq(ProductionOrder::getStatus, status);
        }
        if (currentProcess != null) {
            wrapper.eq(ProductionOrder::getCurrentProcess, currentProcess);
        }
        wrapper.orderByDesc(ProductionOrder::getCreateTime);

        return orderMapper.selectPage(page, wrapper);
    }

    public List<ProductionOrder> getList(String pistonModel, Integer status, Integer currentProcess) {
        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(pistonModel)) {
            wrapper.like(ProductionOrder::getPistonModel, pistonModel);
        }
        if (status != null) {
            wrapper.eq(ProductionOrder::getStatus, status);
        }
        if (currentProcess != null) {
            wrapper.eq(ProductionOrder::getCurrentProcess, currentProcess);
        }
        wrapper.orderByDesc(ProductionOrder::getCreateTime);

        return orderMapper.selectList(wrapper);
    }

    public ProductionOrder getById(Long id) {
        ProductionOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        return order;
    }

    @Transactional(rollbackFor = Exception.class)
    public void create(ProductionOrderDTO dto) {
        ProductionOrder order = new ProductionOrder();
        BeanUtils.copyProperties(dto, order);

        order.setOrderNo(generateOrderNo());

        if (dto.getCategoryId() != null) {
            PistonCategory category = categoryMapper.selectById(dto.getCategoryId());
            if (category != null) {
                order.setCategoryName(category.getCategoryName());
            }
        }

        if (dto.getMaterialId() != null) {
            MaterialStock stock = materialStockMapper.selectById(dto.getMaterialId());
            if (stock != null) {
                order.setMaterialBatch(stock.getBatchNo());
                order.setMaterialName(stock.getMaterialName());
            }
        }

        order.setCurrentProcess(PROCESS_CUTTING);
        order.setStatus(STATUS_PENDING);
        order.setProcessConfirmed(0);
        order.setQualifiedQuantity(0);
        order.setScrapQuantity(0);

        orderMapper.insert(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void confirmProcess(Long orderId) {
        ProductionOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        if (order.getProcessConfirmed() != null && order.getProcessConfirmed() == 1) {
            throw new BusinessException("工艺已确认，无需重复操作");
        }

        if (order.getMaterialId() == null) {
            throw new BusinessException("请先选择原料");
        }

        BigDecimal materialUsed = order.getMaterialUsed();
        if (materialUsed == null || materialUsed.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("请设置原料使用量");
        }

        materialStockService.lockStock(order.getMaterialId(), orderId, materialUsed);

        order.setProcessConfirmed(1);
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void start(Long id) {
        ProductionOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!STATUS_PENDING.equals(order.getStatus())) {
            throw new BusinessException("工单状态不正确，无法开始");
        }
        if (order.getProcessConfirmed() == null || order.getProcessConfirmed() == 0) {
            throw new BusinessException("请先确认加工工艺");
        }

        order.setStatus(STATUS_IN_PROGRESS);
        order.setActualStartTime(LocalDateTime.now());
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void completeProcess(ProcessCompleteDTO dto) {
        ProductionOrder order = orderMapper.selectById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!STATUS_IN_PROGRESS.equals(order.getStatus())) {
            throw new BusinessException("工单状态不正确，无法完成工序");
        }
        if (!order.getCurrentProcess().equals(dto.getProcessId())) {
            throw new BusinessException("当前工序不匹配");
        }

        int nextProcess = dto.getProcessId() + 1;
        if (nextProcess > PROCESS_GRINDING) {
            order.setCurrentProcess(PROCESS_QUALITY);
        } else {
            order.setCurrentProcess(nextProcess);
        }

        if (dto.getProcessUserId() != null) {
            order.setProcessUserId(dto.getProcessUserId());
            order.setProcessUserName(dto.getProcessUserName());
        }

        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void qualityCheck(QualityCheckDTO dto) {
        ProductionOrder order = orderMapper.selectById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!STATUS_IN_PROGRESS.equals(order.getStatus())) {
            throw new BusinessException("工单状态不正确，无法质检");
        }
        if (!PROCESS_QUALITY.equals(order.getCurrentProcess())) {
            throw new BusinessException("请先完成所有加工工序");
        }

        int total = dto.getQualifiedQuantity() + (dto.getScrapQuantity() != null ? dto.getScrapQuantity() : 0);
        if (total > order.getQuantity()) {
            throw new BusinessException("质检总数不能超过生产数量");
        }

        order.setQualifiedQuantity(dto.getQualifiedQuantity());
        order.setScrapQuantity(dto.getScrapQuantity() != null ? dto.getScrapQuantity() : 0);
        order.setQualityUserId(dto.getQualityUserId());
        order.setQualityUserName(dto.getQualityUserName());
        order.setStatus(STATUS_COMPLETED);
        order.setActualEndTime(LocalDateTime.now());

        orderMapper.updateById(order);

        calculateProductionCost(order);

        if (order.getMaterialId() != null) {
            materialStockService.outbound(order.getMaterialId(), order.getMaterialUsed(), "工单完成出库");
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void calculateProductionCost(ProductionOrder order) {
        ProductionCost existCost = productionCostMapper.selectOne(
                new LambdaQueryWrapper<ProductionCost>()
                        .eq(ProductionCost::getOrderId, order.getId())
        );

        if (existCost != null) {
            return;
        }

        ProductionCost cost = new ProductionCost();
        cost.setOrderId(order.getId());
        cost.setOrderNo(order.getOrderNo());
        cost.setPistonModel(order.getPistonModel());
        cost.setQuantity(order.getQuantity());

        BigDecimal materialCost = BigDecimal.ZERO;
        if (order.getMaterialId() != null && order.getMaterialUsed() != null) {
            MaterialStock stock = materialStockMapper.selectById(order.getMaterialId());
            if (stock != null && stock.getUnitPrice() != null) {
                materialCost = order.getMaterialUsed().multiply(stock.getUnitPrice());
            }
        }
        cost.setMaterialCost(materialCost);

        BigDecimal toolCost = calculateToolCost(order);
        cost.setToolCost(toolCost);

        BigDecimal energyCost = calculateEnergyCost(order);
        cost.setEnergyCost(energyCost);

        BigDecimal laborCost = calculateLaborCost(order);
        cost.setLaborCost(laborCost);

        BigDecimal scrapCost = BigDecimal.ZERO;
        if (order.getScrapQuantity() != null && order.getScrapQuantity() > 0) {
            BigDecimal unitMaterialCost = order.getQuantity() > 0 ?
                    materialCost.divide(BigDecimal.valueOf(order.getQuantity()), 2, BigDecimal.ROUND_HALF_UP) : BigDecimal.ZERO;
            scrapCost = unitMaterialCost.multiply(BigDecimal.valueOf(order.getScrapQuantity()));
        }
        cost.setScrapCost(scrapCost);

        cost.setOtherLossCost(BigDecimal.ZERO);

        BigDecimal totalCost = materialCost.add(toolCost).add(energyCost)
                .add(laborCost).add(scrapCost).add(cost.getOtherLossCost());
        cost.setTotalCost(totalCost);

        int validQuantity = order.getQualifiedQuantity() != null && order.getQualifiedQuantity() > 0
                ? order.getQualifiedQuantity() : 1;
        BigDecimal unitCost = totalCost.divide(BigDecimal.valueOf(validQuantity), 2, BigDecimal.ROUND_HALF_UP);
        cost.setUnitCost(unitCost);

        LocalDateTime now = LocalDateTime.now();
        cost.setReportYear(now.getYear());
        cost.setReportMonth(now.getMonthValue());

        productionCostMapper.insert(cost);
    }

    private BigDecimal calculateToolCost(ProductionOrder order) {
        BigDecimal totalCost = BigDecimal.ZERO;
        int baseToolCost = 50;

        if (order.getQuantity() != null) {
            totalCost = BigDecimal.valueOf(order.getQuantity() * baseToolCost);
        }

        return totalCost;
    }

    private BigDecimal calculateEnergyCost(ProductionOrder order) {
        BigDecimal totalCost = BigDecimal.ZERO;
        int hourlyEnergyCost = 80;

        if (order.getActualStartTime() != null && order.getActualEndTime() != null) {
            long hours = java.time.Duration.between(order.getActualStartTime(), order.getActualEndTime()).toHours();
            hours = Math.max(hours, 1);
            totalCost = BigDecimal.valueOf(hours * hourlyEnergyCost);
        } else if (order.getQuantity() != null) {
            totalCost = BigDecimal.valueOf(order.getQuantity() * 20);
        }

        return totalCost;
    }

    private BigDecimal calculateLaborCost(ProductionOrder order) {
        BigDecimal totalCost = BigDecimal.ZERO;
        int hourlyLaborCost = 60;

        if (order.getActualStartTime() != null && order.getActualEndTime() != null) {
            long hours = java.time.Duration.between(order.getActualStartTime(), order.getActualEndTime()).toHours();
            hours = Math.max(hours, 1);
            totalCost = BigDecimal.valueOf(hours * hourlyLaborCost);
        } else if (order.getQuantity() != null) {
            totalCost = BigDecimal.valueOf(order.getQuantity() * 15);
        }

        return totalCost;
    }

    @Transactional(rollbackFor = Exception.class)
    public void pause(Long id) {
        ProductionOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!STATUS_IN_PROGRESS.equals(order.getStatus())) {
            throw new BusinessException("只有进行中的工单才能暂停");
        }

        order.setStatus(STATUS_PAUSED);
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void resume(Long id) {
        ProductionOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!STATUS_PAUSED.equals(order.getStatus())) {
            throw new BusinessException("只有暂停的工单才能恢复");
        }

        order.setStatus(STATUS_IN_PROGRESS);
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void cancel(Long id) {
        ProductionOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (STATUS_COMPLETED.equals(order.getStatus())) {
            throw new BusinessException("已完成的工单不能取消");
        }

        if (order.getMaterialId() != null && order.getProcessConfirmed() != null && order.getProcessConfirmed() == 1) {
            try {
                materialStockService.unlockStock(order.getMaterialId());
            } catch (Exception e) {
            }
        }

        order.setStatus(STATUS_CANCELLED);
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void checkAndPauseOverdueOrders() {
        LocalDateTime now = LocalDateTime.now();
        List<ProductionOrder> overdueOrders = orderMapper.selectList(
                new LambdaQueryWrapper<ProductionOrder>()
                        .eq(ProductionOrder::getStatus, STATUS_IN_PROGRESS)
                        .lt(ProductionOrder::getPlanEndTime, now.minusDays(7))
        );

        for (ProductionOrder order : overdueOrders) {
            order.setStatus(STATUS_PAUSED);
            orderMapper.updateById(order);
        }
    }

    private String generateOrderNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int random = (int) (Math.random() * 1000);
        return "PO" + dateStr + String.format("%03d", random);
    }
}