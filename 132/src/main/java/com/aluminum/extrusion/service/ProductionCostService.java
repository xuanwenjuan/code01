package com.aluminum.extrusion.service;

import com.alibaba.fastjson2.JSON;
import com.aluminum.extrusion.dto.CostReportQueryDTO;
import com.aluminum.extrusion.entity.ProductionCost;
import com.aluminum.extrusion.entity.WorkOrder;
import com.aluminum.extrusion.enums.WorkOrderStatusEnum;
import com.aluminum.extrusion.exception.BusinessException;
import com.aluminum.extrusion.mapper.ProductionCostMapper;
import com.aluminum.extrusion.vo.MonthlyReportVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductionCostService extends ServiceImpl<ProductionCostMapper, ProductionCost> {

    private final WorkOrderService workOrderService;
    private final OperationLogService operationLogService;
    private final StringRedisTemplate redisTemplate;

    private static final String REPORT_CACHE_KEY = "extrusion:cost:report:";
    private static final long CACHE_EXPIRE_HOURS = 6;

    @Transactional(rollbackFor = Exception.class)
    public void calculateCost(Long workOrderId, ProductionCost cost) {
        WorkOrder workOrder = workOrderService.getById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        if (!workOrder.getStatus().equals(WorkOrderStatusEnum.COMPLETED.getCode())) {
            throw new BusinessException("工单未完成，无法核算成本");
        }

        LambdaQueryWrapper<ProductionCost> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionCost::getWorkOrderId, workOrderId);
        if (count(wrapper) > 0) {
            throw new BusinessException("该工单已核算过成本");
        }

        cost.setWorkOrderId(workOrderId);
        cost.setOrderNo(workOrder.getOrderNo());
        cost.setCategoryId(workOrder.getCategoryId());
        cost.setCategoryName(workOrder.getCategoryName());

        BigDecimal totalCost = cost.getMaterialCost()
                .add(cost.getMoldCost())
                .add(cost.getEnergyCost())
                .add(cost.getLaborCost())
                .add(cost.getScrapCost());
        cost.setTotalCost(totalCost);

        BigDecimal profit = cost.getOutputValue().subtract(totalCost);
        cost.setProfit(profit);

        save(cost);

        clearReportCache();
        operationLogService.log("成本核算", "核算工单号: " + workOrder.getOrderNo());
    }

    public List<MonthlyReportVO> getMonthlyReport(CostReportQueryDTO queryDTO) {
        String cacheKey = REPORT_CACHE_KEY + queryDTO.getYear() + ":" + queryDTO.getMonth();
        String cache = redisTemplate.opsForValue().get(cacheKey);
        if (cache != null) {
            return JSON.parseArray(cache, MonthlyReportVO.class);
        }

        YearMonth yearMonth = YearMonth.of(queryDTO.getYear(), queryDTO.getMonth());
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        LambdaQueryWrapper<ProductionCost> wrapper = new LambdaQueryWrapper<>();
        wrapper.between(ProductionCost::getCreateTime, startDate.atStartOfDay(), endDate.atTime(23, 59, 59));

        if (queryDTO.getCategoryId() != null) {
            wrapper.eq(ProductionCost::getCategoryId, queryDTO.getCategoryId());
        }

        List<ProductionCost> costList = list(wrapper);

        Map<String, List<ProductionCost>> groupByCategory = costList.stream()
                .collect(Collectors.groupingBy(ProductionCost::getCategoryName));

        List<MonthlyReportVO> result = new ArrayList<>();
        for (Map.Entry<String, List<ProductionCost>> entry : groupByCategory.entrySet()) {
            MonthlyReportVO vo = new MonthlyReportVO();
            vo.setCategoryName(entry.getKey());

            List<ProductionCost> costs = entry.getValue();
            vo.setOrderCount(costs.size());

            vo.setTotalMaterialCost(sumBigDecimal(costs, ProductionCost::getMaterialCost));
            vo.setTotalMoldCost(sumBigDecimal(costs, ProductionCost::getMoldCost));
            vo.setTotalEnergyCost(sumBigDecimal(costs, ProductionCost::getEnergyCost));
            vo.setTotalLaborCost(sumBigDecimal(costs, ProductionCost::getLaborCost));
            vo.setTotalScrapCost(sumBigDecimal(costs, ProductionCost::getScrapCost));
            vo.setTotalCost(sumBigDecimal(costs, ProductionCost::getTotalCost));
            vo.setTotalOutputValue(sumBigDecimal(costs, ProductionCost::getOutputValue));
            vo.setTotalProfit(sumBigDecimal(costs, ProductionCost::getProfit));

            if (vo.getTotalOutputValue().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal margin = vo.getTotalProfit()
                        .divide(vo.getTotalOutputValue(), 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"));
                vo.setProfitMargin(margin);
            } else {
                vo.setProfitMargin(BigDecimal.ZERO);
            }

            result.add(vo);
        }

        redisTemplate.opsForValue().set(cacheKey, JSON.toJSONString(result),
                CACHE_EXPIRE_HOURS, TimeUnit.HOURS);
        return result;
    }

    public IPage<ProductionCost> getCostPage(CostReportQueryDTO queryDTO) {
        LambdaQueryWrapper<ProductionCost> wrapper = new LambdaQueryWrapper<>();

        if (queryDTO.getCategoryId() != null) {
            wrapper.eq(ProductionCost::getCategoryId, queryDTO.getCategoryId());
        }
        if (queryDTO.getOrderNo() != null && !queryDTO.getOrderNo().isEmpty()) {
            wrapper.like(ProductionCost::getOrderNo, queryDTO.getOrderNo());
        }

        wrapper.orderByDesc(ProductionCost::getCreateTime);
        return page(new Page<>(queryDTO.getCurrent(), queryDTO.getSize()), wrapper);
    }

    private BigDecimal sumBigDecimal(List<ProductionCost> list, java.util.function.Function<ProductionCost, BigDecimal> mapper) {
        return list.stream()
                .map(mapper)
                .filter(bd -> bd != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private void clearReportCache() {
        Set<String> keys = redisTemplate.keys(REPORT_CACHE_KEY + "*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }
}
