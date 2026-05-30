package com.construction.embedded.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.construction.embedded.dto.CostAccountingDTO;
import com.construction.embedded.entity.CostAccounting;
import com.construction.embedded.entity.OrderMaterialDetail;
import com.construction.embedded.entity.ProductionOrder;
import com.construction.embedded.exception.BusinessException;
import com.construction.embedded.mapper.CostAccountingMapper;
import com.construction.embedded.mapper.OrderMaterialDetailMapper;
import com.construction.embedded.mapper.ProductionOrderMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class CostAccountingService {

    @Autowired
    private CostAccountingMapper costAccountingMapper;

    @Autowired
    private ProductionOrderMapper productionOrderMapper;

    @Autowired
    private OrderMaterialDetailMapper orderMaterialDetailMapper;

    @Autowired
    private ProductionLossService productionLossService;

    @Autowired
    private ProductionLogService productionLogService;

    public IPage<CostAccounting> list(String accountingMonth, Long categoryId, 
                                       Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<CostAccounting> wrapper = new LambdaQueryWrapper<>();
        if (accountingMonth != null && !accountingMonth.isEmpty()) {
            wrapper.eq(CostAccounting::getAccountingMonth, accountingMonth);
        }
        if (categoryId != null) {
            wrapper.eq(CostAccounting::getCategoryId, categoryId);
        }
        wrapper.orderByDesc(CostAccounting::getAccountingMonth);
        return costAccountingMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    public CostAccounting getById(Long id) {
        return costAccountingMapper.selectById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void generateMonthlyReport(String accountingMonth) {
        LambdaQueryWrapper<ProductionOrder> orderWrapper = new LambdaQueryWrapper<>();
        orderWrapper.apply("DATE_FORMAT(create_time, '%Y-%m') = {0}", accountingMonth)
                .eq(ProductionOrder::getStatus, "FINISHED");
        List<ProductionOrder> finishedOrders = productionOrderMapper.selectList(orderWrapper);

        BigDecimal totalMaterialCost = BigDecimal.ZERO;
        BigDecimal totalLossCost = BigDecimal.ZERO;
        int totalQuantity = 0;

        for (ProductionOrder order : finishedOrders) {
            LambdaQueryWrapper<OrderMaterialDetail> detailWrapper = new LambdaQueryWrapper<>();
            detailWrapper.eq(OrderMaterialDetail::getOrderId, order.getId());
            List<OrderMaterialDetail> details = orderMaterialDetailMapper.selectList(detailWrapper);

            for (OrderMaterialDetail detail : details) {
                if (detail.getTotalPrice() != null) {
                    totalMaterialCost = totalMaterialCost.add(detail.getTotalPrice());
                }
            }

            BigDecimal lossCost = productionLossService.getOrderTotalLossCost(order.getId());
            totalLossCost = totalLossCost.add(lossCost);

            totalQuantity += order.getActualQuantity() != null ? order.getActualQuantity() : 0;
        }

        CostAccounting accounting = new CostAccounting();
        accounting.setAccountingNo(generateAccountingNo());
        accounting.setAccountingMonth(accountingMonth);
        accounting.setMaterialCost(totalMaterialCost);
        accounting.setScrapLoss(totalLossCost);
        accounting.setEquipmentLoss(BigDecimal.ZERO);
        accounting.setCoatingCost(BigDecimal.ZERO);
        accounting.setLaborCost(BigDecimal.ZERO);
        
        BigDecimal totalCost = totalMaterialCost.add(totalLossCost);
        accounting.setTotalCost(totalCost);
        accounting.setProductionQuantity(totalQuantity);
        accounting.setUnitCost(totalQuantity > 0 ? 
                totalCost.divide(BigDecimal.valueOf(totalQuantity), 2, BigDecimal.ROUND_HALF_UP) : 
                BigDecimal.ZERO);
        accounting.setStatus("DRAFT");

        costAccountingMapper.insert(accounting);

        productionLogService.saveLog(null, "COST_REPORT_GENERATE",
            "生成月度成本报表：" + accountingMonth + "，总成本：" + totalCost,
            null, null);
    }

    private String generateAccountingNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuid = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "CA-" + dateStr + "-" + uuid;
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateCost(CostAccountingDTO dto) {
        CostAccounting existing = costAccountingMapper.selectById(dto.getId());
        if (existing == null) {
            throw new BusinessException("成本核算记录不存在");
        }
        if ("CONFIRMED".equals(existing.getStatus())) {
            throw new BusinessException("已确认的成本核算无法修改");
        }

        BigDecimal totalCost = BigDecimal.ZERO;
        if (dto.getMaterialCost() != null) {
            totalCost = totalCost.add(dto.getMaterialCost());
        }
        if (dto.getEquipmentLoss() != null) {
            totalCost = totalCost.add(dto.getEquipmentLoss());
        }
        if (dto.getCoatingCost() != null) {
            totalCost = totalCost.add(dto.getCoatingCost());
        }
        if (dto.getLaborCost() != null) {
            totalCost = totalCost.add(dto.getLaborCost());
        }
        if (dto.getScrapLoss() != null) {
            totalCost = totalCost.add(dto.getScrapLoss());
        }

        CostAccounting accounting = new CostAccounting();
        BeanUtils.copyProperties(dto, accounting);
        accounting.setTotalCost(totalCost);

        if (dto.getProductionQuantity() != null && dto.getProductionQuantity() > 0) {
            accounting.setUnitCost(totalCost.divide(BigDecimal.valueOf(dto.getProductionQuantity()), 
                    2, BigDecimal.ROUND_HALF_UP));
        }

        costAccountingMapper.updateById(accounting);

        productionLogService.saveLog(null, "COST_REPORT_UPDATE",
            "更新成本报表：" + existing.getAccountingMonth() + "，新总成本：" + totalCost,
            null, null);
    }

    @Transactional(rollbackFor = Exception.class)
    public void confirmCost(Long id) {
        CostAccounting accounting = costAccountingMapper.selectById(id);
        if (accounting == null) {
            throw new BusinessException("成本核算记录不存在");
        }
        if ("CONFIRMED".equals(accounting.getStatus())) {
            throw new BusinessException("该成本核算已确认");
        }
        accounting.setStatus("CONFIRMED");
        costAccountingMapper.updateById(accounting);

        productionLogService.saveLog(null, "COST_REPORT_CONFIRM",
            "确认成本报表：" + accounting.getAccountingMonth() + "，总成本：" + accounting.getTotalCost(),
            null, null);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteCost(Long id) {
        CostAccounting accounting = costAccountingMapper.selectById(id);
        if (accounting == null) {
            throw new BusinessException("成本核算记录不存在");
        }
        if ("CONFIRMED".equals(accounting.getStatus())) {
            throw new BusinessException("已确认的成本核算无法删除");
        }
        costAccountingMapper.deleteById(id);
    }

    public CostAccounting getByMonth(String accountingMonth) {
        LambdaQueryWrapper<CostAccounting> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CostAccounting::getAccountingMonth, accountingMonth);
        return costAccountingMapper.selectOne(wrapper);
    }

    public List<CostAccounting> getYearlyReport(String year) {
        LambdaQueryWrapper<CostAccounting> wrapper = new LambdaQueryWrapper<>();
        wrapper.apply("accounting_month LIKE {0}", year + "%")
                .eq(CostAccounting::getStatus, "CONFIRMED")
                .orderByAsc(CostAccounting::getAccountingMonth);
        return costAccountingMapper.selectList(wrapper);
    }

    public BigDecimal calculateOrderCost(Long orderId) {
        LambdaQueryWrapper<OrderMaterialDetail> detailWrapper = new LambdaQueryWrapper<>();
        detailWrapper.eq(OrderMaterialDetail::getOrderId, orderId);
        List<OrderMaterialDetail> details = orderMaterialDetailMapper.selectList(detailWrapper);

        BigDecimal materialCost = details.stream()
                .map(d -> d.getTotalPrice() != null ? d.getTotalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal lossCost = productionLossService.getOrderTotalLossCost(orderId);

        return materialCost.add(lossCost);
    }
}
