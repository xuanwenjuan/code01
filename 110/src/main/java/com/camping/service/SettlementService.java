package com.camping.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.camping.annotation.RequiresRole;
import com.camping.context.UserContext;
import com.camping.entity.*;
import com.camping.enums.OrderStatusEnum;
import com.camping.enums.RoleEnum;
import com.camping.exception.BusinessException;
import com.camping.mapper.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettlementService extends ServiceImpl<SettlementMapper, Settlement> {

    private final GroupOrderMapper groupOrderMapper;
    private final OrderMaterialMapper orderMaterialMapper;
    private final SysUserMapper sysUserMapper;

    public Page<Settlement> page(Integer pageNum, Integer pageSize, Long leaderId, String month) {
        LambdaQueryWrapper<Settlement> wrapper = new LambdaQueryWrapper<>();
        if (RoleEnum.LEADER.getCode().equals(UserContext.getRole())) {
            wrapper.eq(Settlement::getLeaderId, UserContext.getUserId());
        } else if (leaderId != null) {
            wrapper.eq(Settlement::getLeaderId, leaderId);
        }
        if (month != null && !month.isEmpty()) {
            wrapper.eq(Settlement::getSettlementMonth, month);
        }
        wrapper.orderByDesc(Settlement::getSettlementMonth);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    @RequiresRole({RoleEnum.ADMIN})
    public void generateMonthlySettlement(String month) {
        YearMonth settlementMonth = YearMonth.parse(month);
        LocalDate startDate = settlementMonth.atDay(1);
        LocalDate endDate = settlementMonth.atEndOfMonth();

        List<GroupOrder> completedOrders = groupOrderMapper.selectList(new LambdaQueryWrapper<GroupOrder>()
                .eq(GroupOrder::getStatus, OrderStatusEnum.COMPLETED.getCode())
                .ge(GroupOrder::getCreateTime, startDate.atStartOfDay())
                .le(GroupOrder::getCreateTime, endDate.atTime(23, 59, 59)));

        if (completedOrders.isEmpty()) {
            throw new BusinessException("该月份没有已完成的订单");
        }

        Map<Long, List<GroupOrder>> leaderOrdersMap = completedOrders.stream()
                .collect(Collectors.groupingBy(GroupOrder::getLeaderId));

        baseMapper.delete(new LambdaQueryWrapper<Settlement>()
                .eq(Settlement::getSettlementMonth, settlementMonth.toString()));

        for (Map.Entry<Long, List<GroupOrder>> entry : leaderOrdersMap.entrySet()) {
            Long leaderId = entry.getKey();
            List<GroupOrder> orders = entry.getValue();

            SysUser leader = sysUserMapper.selectById(leaderId);

            BigDecimal totalSales = orders.stream()
                    .map(GroupOrder::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            List<Long> orderIds = orders.stream().map(GroupOrder::getId).collect(Collectors.toList());
            List<OrderMaterial> allMaterials = orderMaterialMapper.selectList(new LambdaQueryWrapper<OrderMaterial>()
                    .in(OrderMaterial::getOrderId, orderIds));

            BigDecimal materialCost = allMaterials.stream()
                    .map(OrderMaterial::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal processingCost = totalSales.multiply(new BigDecimal("0.1"));
            BigDecimal shippingCost = new BigDecimal(orders.size()).multiply(new BigDecimal("50"));
            BigDecimal commissionRate = new BigDecimal("0.15");
            BigDecimal commissionAmount = totalSales.multiply(commissionRate);

            BigDecimal profit = totalSales.subtract(materialCost)
                    .subtract(processingCost)
                    .subtract(shippingCost)
                    .subtract(commissionAmount);

            Settlement settlement = new Settlement();
            settlement.setLeaderId(leaderId);
            settlement.setLeaderName(leader != null ? leader.getRealName() : "未知");
            settlement.setSettlementMonth(settlementMonth.toString());
            settlement.setOrderCount(orders.size());
            settlement.setTotalSales(totalSales);
            settlement.setMaterialCost(materialCost);
            settlement.setProcessingCost(processingCost);
            settlement.setShippingCost(shippingCost);
            settlement.setCommissionAmount(commissionAmount);
            settlement.setProfit(profit);
            settlement.setStatus(1);
            save(settlement);

            log.info("生成月度结算：团长={}, 月份={}, 销售额={}, 利润={}",
                    settlement.getLeaderName(), month, totalSales, profit);
        }
    }

    public Map<String, Object> getOrderDetailForSettlement(Long orderId) {
        GroupOrder order = groupOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }

        List<OrderMaterial> materials = orderMaterialMapper.selectList(new LambdaQueryWrapper<OrderMaterial>()
                .eq(OrderMaterial::getOrderId, orderId));

        BigDecimal materialTotal = materials.stream()
                .map(OrderMaterial::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal processingCost = order.getTotalAmount().multiply(new BigDecimal("0.1"));
        BigDecimal shippingCost = new BigDecimal("50");
        BigDecimal commissionAmount = order.getTotalAmount().multiply(new BigDecimal("0.15"));
        BigDecimal profit = order.getTotalAmount()
                .subtract(materialTotal)
                .subtract(processingCost)
                .subtract(shippingCost)
                .subtract(commissionAmount);

        return Map.of(
                "order", order,
                "materials", materials,
                "materialTotal", materialTotal,
                "processingCost", processingCost,
                "shippingCost", shippingCost,
                "commissionAmount", commissionAmount,
                "profit", profit
        );
    }

    public Map<String, Object> getSettlementSummary(String month) {
        LambdaQueryWrapper<Settlement> wrapper = new LambdaQueryWrapper<>();
        if (month != null && !month.isEmpty()) {
            wrapper.eq(Settlement::getSettlementMonth, month);
        }
        if (RoleEnum.LEADER.getCode().equals(UserContext.getRole())) {
            wrapper.eq(Settlement::getLeaderId, UserContext.getUserId());
        }
        List<Settlement> settlements = list(wrapper);

        BigDecimal totalSales = settlements.stream()
                .map(Settlement::getTotalSales)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal materialCost = settlements.stream()
                .map(Settlement::getMaterialCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalProfit = settlements.stream()
                .map(Settlement::getProfit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCommission = settlements.stream()
                .map(Settlement::getCommissionAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
                "totalSales", totalSales,
                "materialCost", materialCost,
                "totalProfit", totalProfit,
                "totalCommission", totalCommission,
                "settlementCount", settlements.size()
        );
    }
}
