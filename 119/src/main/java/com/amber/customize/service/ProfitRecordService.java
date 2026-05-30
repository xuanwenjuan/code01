package com.amber.customize.service;

import com.amber.customize.dto.ProfitReportDTO;
import com.amber.customize.entity.Category;
import com.amber.customize.entity.CustomOrder;
import com.amber.customize.entity.ProfitRecord;
import com.amber.customize.exception.BusinessException;
import com.amber.customize.mapper.ProfitRecordMapper;
import com.amber.customize.util.BeanConvertUtil;
import com.amber.customize.vo.ProfitRecordVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfitRecordService extends ServiceImpl<ProfitRecordMapper, ProfitRecord> {

    private final CustomOrderService customOrderService;
    private final CategoryService categoryService;

    public Page<ProfitRecordVO> page(int page, int size, Long categoryId) {
        LambdaQueryWrapper<ProfitRecord> wrapper = new LambdaQueryWrapper<>();
        if (categoryId != null) {
            wrapper.eq(ProfitRecord::getCategoryId, categoryId);
        }
        wrapper.orderByDesc(ProfitRecord::getCreateTime);
        Page<ProfitRecord> recordPage = page(new Page<>(page, size), wrapper);
        Page<ProfitRecordVO> voPage = new Page<>(recordPage.getCurrent(), recordPage.getSize(), recordPage.getTotal());
        voPage.setRecords(recordPage.getRecords().stream().map(this::convertToVO).toList());
        return voPage;
    }

    public ProfitRecordVO getDetail(Long id) {
        ProfitRecord record = getById(id);
        if (record == null) {
            throw new BusinessException("收益记录不存在");
        }
        return convertToVO(record);
    }

    @Transactional(rollbackFor = Exception.class)
    public void generateFromOrder(Long orderId) {
        CustomOrder order = customOrderService.getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }

        ProfitRecord exist = getOne(new LambdaQueryWrapper<ProfitRecord>()
                .eq(ProfitRecord::getOrderId, orderId));
        if (exist != null) {
            throw new BusinessException("该订单收益记录已存在");
        }

        String categoryName = "";
        if (order.getCategoryId() != null) {
            Category category = categoryService.getById(order.getCategoryId());
            if (category != null) {
                categoryName = category.getName();
            }
        }

        BigDecimal totalCost = BigDecimal.ZERO;
        if (order.getRawCost() != null) {
            totalCost = totalCost.add(order.getRawCost());
        }
        if (order.getMaterialCost() != null) {
            totalCost = totalCost.add(order.getMaterialCost());
        }
        if (order.getLaborCost() != null) {
            totalCost = totalCost.add(order.getLaborCost());
        }
        BigDecimal orderPrice = order.getTotalPrice() != null ? order.getTotalPrice() : BigDecimal.ZERO;
        BigDecimal profit = orderPrice.subtract(totalCost);
        BigDecimal profitRate = totalCost.compareTo(BigDecimal.ZERO) > 0
                ? profit.divide(totalCost, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
                : BigDecimal.ZERO;

        ProfitRecord record = new ProfitRecord();
        record.setOrderId(orderId);
        record.setOrderNo(order.getOrderNo());
        record.setCategoryId(order.getCategoryId());
        record.setCategoryName(categoryName);
        record.setRawCost(order.getRawCost());
        record.setMaterialCost(order.getMaterialCost());
        record.setLaborCost(order.getLaborCost());
        record.setTotalCost(totalCost);
        record.setOrderPrice(orderPrice);
        record.setProfit(profit);
        record.setProfitRate(profitRate);
        save(record);
    }

    public List<ProfitReportDTO> getCategoryReport() {
        List<ProfitRecord> allRecords = list();
        Map<Long, List<ProfitRecord>> groupByCategory = allRecords.stream()
                .collect(Collectors.groupingBy(r -> r.getCategoryId() != null ? r.getCategoryId() : 0L));

        List<ProfitReportDTO> report = new ArrayList<>();
        for (Map.Entry<Long, List<ProfitRecord>> entry : groupByCategory.entrySet()) {
            List<ProfitRecord> records = entry.getValue();
            ProfitReportDTO dto = new ProfitReportDTO();
            dto.setCategoryId(entry.getKey());
            dto.setCategoryName(records.get(0).getCategoryName() != null ? records.get(0).getCategoryName() : "未分类");
            dto.setOrderCount((long) records.size());
            dto.setTotalRawCost(records.stream().map(r -> r.getRawCost() != null ? r.getRawCost() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add));
            dto.setTotalMaterialCost(records.stream().map(r -> r.getMaterialCost() != null ? r.getMaterialCost() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add));
            dto.setTotalLaborCost(records.stream().map(r -> r.getLaborCost() != null ? r.getLaborCost() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add));
            dto.setTotalCost(records.stream().map(r -> r.getTotalCost() != null ? r.getTotalCost() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add));
            dto.setTotalRevenue(records.stream().map(r -> r.getOrderPrice() != null ? r.getOrderPrice() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add));
            dto.setTotalProfit(records.stream().map(r -> r.getProfit() != null ? r.getProfit() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add));
            BigDecimal avgRate = records.stream().map(r -> r.getProfitRate() != null ? r.getProfitRate() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(new BigDecimal(records.size()), 2, RoundingMode.HALF_UP);
            dto.setAvgProfitRate(avgRate);
            report.add(dto);
        }
        return report;
    }

    private ProfitRecordVO convertToVO(ProfitRecord record) {
        return BeanConvertUtil.convert(record, ProfitRecordVO::new);
    }

}
