package com.gear.mfg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.gear.mfg.annotation.OperationLog;
import com.gear.mfg.dto.ProductionOrderCreateDTO;
import com.gear.mfg.dto.ProductionReportSubmitDTO;
import com.gear.mfg.entity.*;
import com.gear.mfg.exception.BusinessException;
import com.gear.mfg.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionFlowService {

    private final ProductionOrderMapper productionOrderMapper;
    private final OrderProcessMapper orderProcessMapper;
    private final ProductionReportMapper productionReportMapper;
    private final QualityCheckMapper qualityCheckMapper;
    private final StockOutMapper stockOutMapper;
    private final StockInMapper stockInMapper;
    private final BomDetailMapper bomDetailMapper;
    private final ProcessRouteDetailMapper processRouteDetailMapper;
    private final MaterialStockService materialStockService;
    private final ProductionCostService productionCostService;

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "生产工单", operation = "创建工单", description = "创建生产工单并锁定库存")
    @CacheEvict(value = {"order", "stock"}, allEntries = true)
    public ProductionOrder createProductionOrder(ProductionOrderCreateDTO dto) {
        LambdaQueryWrapper<ProductionOrder> existWrapper = new LambdaQueryWrapper<>();
        existWrapper.eq(ProductionOrder::getOrderNo, dto.getOrderNo());
        if (productionOrderMapper.selectCount(existWrapper) > 0) {
            throw new BusinessException("工单编号已存在");
        }

        List<BomDetail> bomDetails = bomDetailMapper.selectList(
                new LambdaQueryWrapper<BomDetail>().eq(BomDetail::getBomId, dto.getBomId())
        );

        for (BomDetail detail : bomDetails) {
            BigDecimal requiredQuantity = detail.getQuantity().multiply(dto.getQuantity());
            List<MaterialStock> availableStock = materialStockService.getAvailableStock(
                    detail.getMaterialType(), requiredQuantity
            );

            if (availableStock.isEmpty()) {
                throw new BusinessException("物料 " + detail.getMaterialName() + " 库存不足，需要 " + requiredQuantity);
            }

            BigDecimal remainingNeed = requiredQuantity;
            for (MaterialStock stock : availableStock) {
                if (remainingNeed.compareTo(BigDecimal.ZERO) <= 0) break;

                BigDecimal toLock = stock.getQuantity().min(remainingNeed);
                if (!materialStockService.lockStock(stock.getId(), toLock)) {
                    throw new BusinessException("锁定库存失败：" + detail.getMaterialName());
                }
                remainingNeed = remainingNeed.subtract(toLock);
            }

            if (remainingNeed.compareTo(BigDecimal.ZERO) > 0) {
                throw new BusinessException("物料 " + detail.getMaterialName() + " 库存不足，还差 " + remainingNeed);
            }
        }

        ProductionOrder order = new ProductionOrder();
        order.setOrderNo(dto.getOrderNo());
        order.setCategoryId(dto.getCategoryId());
        order.setGearModel(dto.getGearModel());
        order.setQuantity(dto.getQuantity());
        order.setStatus(1);
        order.setBomId(dto.getBomId());
        order.setRouteId(dto.getRouteId());
        order.setRemark(dto.getRemark());
        order.setCreateTime(LocalDateTime.now());
        productionOrderMapper.insert(order);

        List<ProcessRouteDetail> routeDetails = processRouteDetailMapper.selectList(
                new LambdaQueryWrapper<ProcessRouteDetail>().eq(ProcessRouteDetail::getRouteId, dto.getRouteId())
                        .orderByAsc(ProcessRouteDetail::getProcessNo)
        );

        for (ProcessRouteDetail routeDetail : routeDetails) {
            OrderProcess process = new OrderProcess();
            process.setOrderId(order.getId());
            process.setProcessNo(routeDetail.getProcessNo());
            process.setProcessName(routeDetail.getProcessName());
            process.setStandardHours(routeDetail.getStandardHours());
            process.setStatus(0);
            orderProcessMapper.insert(process);
        }

        return order;
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "生产工单", operation = "开始工序", description = "开始指定工序生产")
    @CacheEvict(value = "order", key = "#orderId")
    public OrderProcess startProcess(Long orderId, Integer processNo) {
        OrderProcess process = getOrderProcess(orderId, processNo);
        if (process.getStatus() != 0) {
            throw new BusinessException("工序状态不正确，无法开始");
        }

        process.setStatus(1);
        process.setStartTime(LocalDateTime.now());
        orderProcessMapper.updateById(process);

        ProductionOrder order = productionOrderMapper.selectById(orderId);
        if (order.getStatus() == 1) {
            order.setStatus(2);
            productionOrderMapper.updateById(order);
        }

        return process;
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "生产报工", operation = "提交报工", description = "提交生产报工数据")
    @CacheEvict(value = {"order", "report"}, allEntries = true)
    public ProductionReport submitProductionReport(ProductionReportSubmitDTO dto) {
        OrderProcess process = getOrderProcess(dto.getOrderId(), dto.getProcessNo());
        if (process.getStatus() != 1) {
            throw new BusinessException("工序未开始，无法报工");
        }

        if (dto.getReportQuantity().compareTo(dto.getGoodQuantity().add(dto.getBadQuantity())) != 0) {
            throw new BusinessException("报工数量应等于良品数量加不良品数量");
        }

        ProductionReport report = new ProductionReport();
        report.setOrderId(dto.getOrderId());
        report.setProcessNo(dto.getProcessNo());
        report.setReportQuantity(dto.getReportQuantity());
        report.setGoodQuantity(dto.getGoodQuantity());
        report.setBadQuantity(dto.getBadQuantity());
        report.setBadReason(dto.getBadReason());
        report.setActualHours(dto.getActualHours());
        report.setOperator(dto.getOperator());
        report.setRemark(dto.getRemark());
        report.setReportTime(LocalDateTime.now());
        report.setStatus(1);
        productionReportMapper.insert(report);

        return report;
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "质量检验", operation = "提交质检", description = "提交质量检验结果")
    @CacheEvict(value = {"order", "quality"}, allEntries = true)
    public QualityCheck submitQualityCheck(Long orderId, Integer processNo, String checkResult,
                                           BigDecimal checkQuantity, BigDecimal badQuantity,
                                           String badReason, String inspector) {
        OrderProcess process = getOrderProcess(orderId, processNo);
        if (process.getStatus() != 1) {
            throw new BusinessException("工序未开始，无法质检");
        }

        QualityCheck check = new QualityCheck();
        check.setOrderId(orderId);
        check.setProcessNo(processNo);
        check.setCheckType("FINAL");
        check.setCheckResult(checkResult);
        check.setCheckQuantity(checkQuantity);
        check.setBadQuantity(badQuantity);
        check.setBadReason(badReason);
        check.setInspector(inspector);
        check.setCheckTime(LocalDateTime.now());
        qualityCheckMapper.insert(check);

        return check;
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "生产工单", operation = "完成工序", description = "完成工序并流转到下一工序")
    @CacheEvict(value = "order", key = "#orderId")
    public void completeProcess(Long orderId, Integer processNo) {
        OrderProcess currentProcess = getOrderProcess(orderId, processNo);
        if (currentProcess.getStatus() != 1) {
            throw new BusinessException("工序未开始，无法完成");
        }

        currentProcess.setStatus(2);
        currentProcess.setEndTime(LocalDateTime.now());
        orderProcessMapper.updateById(currentProcess);

        LambdaQueryWrapper<OrderProcess> nextWrapper = new LambdaQueryWrapper<>();
        nextWrapper.eq(OrderProcess::getOrderId, orderId)
                .gt(OrderProcess::getProcessNo, processNo)
                .orderByAsc(OrderProcess::getProcessNo)
                .last("LIMIT 1");
        OrderProcess nextProcess = orderProcessMapper.selectOne(nextWrapper);

        if (nextProcess != null) {
            ProductionOrder order = productionOrderMapper.selectById(orderId);
            order.setStatus(3);
            productionOrderMapper.updateById(order);
        } else {
            completeProductionOrder(orderId);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "生产工单", operation = "完成工单", description = "完成工单并自动入库、核算成本")
    @CacheEvict(value = {"order", "stock", "cost"}, allEntries = true)
    public void completeProductionOrder(Long orderId) {
        ProductionOrder order = productionOrderMapper.selectById(orderId);
        if (order.getStatus() == 4) {
            throw new BusinessException("工单已完成");
        }

        order.setStatus(4);
        order.setCompleteTime(LocalDateTime.now());
        productionOrderMapper.updateById(order);

        LambdaQueryWrapper<BomDetail> bomWrapper = new LambdaQueryWrapper<>();
        bomWrapper.eq(BomDetail::getBomId, order.getBomId());
        List<BomDetail> bomDetails = bomDetailMapper.selectList(bomWrapper);

        for (BomDetail detail : bomDetails) {
            BigDecimal requiredQuantity = detail.getQuantity().multiply(order.getQuantity());
            List<MaterialStock> availableStock = materialStockService.getAvailableStock(
                    detail.getMaterialType(), BigDecimal.ZERO
            );

            BigDecimal remainingDeduct = requiredQuantity;
            for (MaterialStock stock : availableStock) {
                if (remainingDeduct.compareTo(BigDecimal.ZERO) <= 0) break;
                if (stock.getLockedQuantity() == null || stock.getLockedQuantity().compareTo(BigDecimal.ZERO) <= 0) continue;

                BigDecimal toDeduct = stock.getLockedQuantity().min(remainingDeduct);
                materialStockService.deductLockedStock(stock.getId(), toDeduct);
                remainingDeduct = remainingDeduct.subtract(toDeduct);
            }
        }

        StockIn stockIn = new StockIn();
        stockIn.setInNo("IN" + System.currentTimeMillis());
        stockIn.setInType("PRODUCTION");
        stockIn.setMaterialName(order.getGearModel());
        stockIn.setMaterialType("FINISHED_GOOD");
        stockIn.setQuantity(order.getQuantity());
        stockIn.setWarehouseId(1L);
        stockIn.setStatus(2);
        stockIn.setRemark("生产工单入库：" + order.getOrderNo());
        stockIn.setCreateTime(LocalDateTime.now());
        stockInMapper.insert(stockIn);

        productionCostService.calculateProductionCost(orderId, order.getGearModel(), order.getQuantity());
    }

    @Cacheable(value = "order", key = "#orderId", unless = "#result == null")
    public ProductionOrder getOrderById(Long orderId) {
        return productionOrderMapper.selectById(orderId);
    }

    @Cacheable(value = "process", key = "#orderId + '_' + #processNo", unless = "#result == null")
    public OrderProcess getOrderProcess(Long orderId, Integer processNo) {
        LambdaQueryWrapper<OrderProcess> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderProcess::getOrderId, orderId)
                .eq(OrderProcess::getProcessNo, processNo);
        OrderProcess process = orderProcessMapper.selectOne(wrapper);
        if (process == null) {
            throw new BusinessException("工序不存在");
        }
        return process;
    }

    @Cacheable(value = "process", key = "#orderId")
    public List<OrderProcess> getOrderProcesses(Long orderId) {
        LambdaQueryWrapper<OrderProcess> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderProcess::getOrderId, orderId)
                .orderByAsc(OrderProcess::getProcessNo);
        return orderProcessMapper.selectList(wrapper);
    }
}
