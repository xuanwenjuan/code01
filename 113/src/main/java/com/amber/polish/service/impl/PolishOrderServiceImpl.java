package com.amber.polish.service.impl;

import com.amber.polish.common.ResultCode;
import com.amber.polish.dto.OrderCompleteDTO;
import com.amber.polish.dto.PolishOrderDTO;
import com.amber.polish.dto.ProfitLedgerDTO;
import com.amber.polish.entity.PolishOrder;
import com.amber.polish.entity.RawStone;
import com.amber.polish.enums.OrderStatusEnum;
import com.amber.polish.enums.RawStoneStatusEnum;
import com.amber.polish.exception.BusinessException;
import com.amber.polish.mapper.PolishOrderMapper;
import com.amber.polish.mapper.RawStoneMapper;
import com.amber.polish.service.PolishOrderService;
import com.amber.polish.service.ProfitLedgerService;
import com.amber.polish.service.RawStoneService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PolishOrderServiceImpl extends ServiceImpl<PolishOrderMapper, PolishOrder> implements PolishOrderService {

    private final RawStoneMapper rawStoneMapper;
    private final RawStoneService rawStoneService;
    private final ProfitLedgerService profitLedgerService;

    @Override
    public Page<PolishOrder> getOrderPage(int pageNum, int pageSize, String status, Long polisherId) {
        Page<PolishOrder> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<PolishOrder> wrapper = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            wrapper.eq(PolishOrder::getStatus, status);
        }
        if (polisherId != null) {
            wrapper.eq(PolishOrder::getPolisherId, polisherId);
        }
        wrapper.orderByDesc(PolishOrder::getCreateTime);
        return this.page(page, wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean confirmDesign(Long orderId, Long operatorId) {
        PolishOrder order = this.getById(orderId);
        if (order == null) {
            throw new BusinessException(ResultCode.NOT_FOUND.getCode(), "工单不存在");
        }
        if (!OrderStatusEnum.PENDING.getCode().equals(order.getStatus())) {
            throw new BusinessException(ResultCode.FAIL.getCode(), "工单状态不允许确认设计方案");
        }

        rawStoneService.lockRawStone(order.getRawStoneId(), orderId, operatorId);

        order.setStatus(OrderStatusEnum.DESIGN.getCode());
        order.setDesignConfirmTime(LocalDateTime.now());
        order.setUpdateBy(operatorId);
        boolean result = this.updateById(order);

        log.info("设计方案确认成功，原石已锁定: orderId={}, rawStoneId={}, operatorId={}", 
                orderId, order.getRawStoneId(), operatorId);
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, BigDecimal> completeOrderAndCalculateCost(OrderCompleteDTO dto, Long operatorId) {
        PolishOrder order = this.getById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException(ResultCode.NOT_FOUND.getCode(), "工单不存在");
        }
        if (!OrderStatusEnum.INLAY.getCode().equals(order.getStatus())) {
            throw new BusinessException(ResultCode.FAIL.getCode(), "工单状态不允许完工");
        }

        RawStone rawStone = rawStoneMapper.selectById(order.getRawStoneId());
        if (rawStone == null) {
            throw new BusinessException(ResultCode.NOT_FOUND.getCode(), "原石不存在");
        }

        BigDecimal stoneLossRate = dto.getStoneLossRate() != null ? dto.getStoneLossRate() : BigDecimal.ZERO;
        BigDecimal materialLoss = dto.getMaterialLoss() != null ? dto.getMaterialLoss() : BigDecimal.ZERO;
        BigDecimal laborHours = dto.getLaborHours() != null ? dto.getLaborHours() : BigDecimal.ZERO;
        BigDecimal equipmentCost = dto.getEquipmentCost() != null ? dto.getEquipmentCost() : BigDecimal.ZERO;

        BigDecimal rawStoneCost = rawStone.getPurchasePrice();
        BigDecimal stoneLossAmount = rawStoneCost.multiply(stoneLossRate)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal actualStoneCost = rawStoneCost.add(stoneLossAmount);

        BigDecimal hourlyRate = new BigDecimal("150");
        BigDecimal laborCost = laborHours.multiply(hourlyRate);

        BigDecimal totalMaterialCost = materialLoss.add(order.getMaterialCost() != null ? order.getMaterialCost() : BigDecimal.ZERO);
        BigDecimal totalLaborCost = laborCost.add(order.getLaborCost() != null ? order.getLaborCost() : BigDecimal.ZERO);
        BigDecimal totalCost = actualStoneCost.add(totalMaterialCost).add(totalLaborCost).add(equipmentCost);

        order.setMaterialCost(totalMaterialCost);
        order.setLaborCost(totalLaborCost);
        order.setStatus(OrderStatusEnum.DELIVERED.getCode());
        order.setFinishTime(LocalDateTime.now());
        order.setUpdateBy(operatorId);
        this.updateById(order);

        rawStone.setStatus(RawStoneStatusEnum.FINISHED.getCode());
        rawStone.setUpdateTime(LocalDateTime.now());
        rawStone.setUpdateBy(operatorId);
        rawStoneMapper.updateById(rawStone);

        rawStoneService.unlockRawStone(order.getRawStoneId(), operatorId);

        ProfitLedgerDTO ledgerDTO = new ProfitLedgerDTO();
        ledgerDTO.setCategoryId(rawStone.getCategoryId());
        ledgerDTO.setOrderId(order.getId());
        ledgerDTO.setRawStoneCost(actualStoneCost);
        ledgerDTO.setMaterialCost(totalMaterialCost);
        ledgerDTO.setLaborCost(totalLaborCost.add(equipmentCost));
        ledgerDTO.setOrderIncome(order.getOrderAmount());
        profitLedgerService.createLedger(ledgerDTO);

        Map<String, BigDecimal> costDetail = new HashMap<>();
        costDetail.put("rawStoneCost", rawStoneCost);
        costDetail.put("stoneLossAmount", stoneLossAmount);
        costDetail.put("actualStoneCost", actualStoneCost);
        costDetail.put("materialCost", totalMaterialCost);
        costDetail.put("laborCost", totalLaborCost);
        costDetail.put("equipmentCost", equipmentCost);
        costDetail.put("totalCost", totalCost);
        costDetail.put("profit", order.getOrderAmount() != null ? 
                order.getOrderAmount().subtract(totalCost) : BigDecimal.ZERO);

        log.info("工单完工成本核算完成: orderId={}, totalCost={}, profit={}", 
                order.getId(), totalCost, costDetail.get("profit"));
        return costDetail;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean createOrder(PolishOrderDTO dto) {
        RawStone rawStone = rawStoneMapper.selectById(dto.getRawStoneId());
        if (rawStone == null) {
            throw new BusinessException(ResultCode.NOT_FOUND.getCode(), "原石不存在");
        }
        if (!RawStoneStatusEnum.PENDING.getCode().equals(rawStone.getStatus())) {
            throw new BusinessException(ResultCode.FAIL.getCode(), "该原石状态不允许创建工单");
        }

        PolishOrder polishOrder = new PolishOrder();
        org.springframework.beans.BeanUtils.copyProperties(dto, polishOrder);
        
        String orderNo = generateOrderNo();
        polishOrder.setOrderNo(orderNo);
        polishOrder.setStatus(OrderStatusEnum.PENDING.getCode());
        if (polishOrder.getMaterialCost() == null) {
            polishOrder.setMaterialCost(java.math.BigDecimal.ZERO);
        }
        if (polishOrder.getLaborCost() == null) {
            polishOrder.setLaborCost(java.math.BigDecimal.ZERO);
        }

        boolean result = this.save(polishOrder);
        if (result) {
            rawStone.setStatus(RawStoneStatusEnum.POLISHING.getCode());
            rawStoneMapper.updateById(rawStone);
        }
        return result;
    }

    @Override
    public boolean createOrder(PolishOrder polishOrder) {
        String orderNo = generateOrderNo();
        polishOrder.setOrderNo(orderNo);
        if (polishOrder.getStatus() == null) {
            polishOrder.setStatus(OrderStatusEnum.PENDING.getCode());
        }
        if (polishOrder.getMaterialCost() == null) {
            polishOrder.setMaterialCost(java.math.BigDecimal.ZERO);
        }
        if (polishOrder.getLaborCost() == null) {
            polishOrder.setLaborCost(java.math.BigDecimal.ZERO);
        }
        return this.save(polishOrder);
    }

    private String generateOrderNo() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = this.count(new LambdaQueryWrapper<PolishOrder>()
                .apply("DATE(create_time) = {0}", LocalDateTime.now().toLocalDate()));
        return String.format("ORD%s%04d", date, count + 1);
    }

    @Override
    public boolean updateOrderStatus(Long id, String status) {
        return updateOrderStatus(id, status, null);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateOrderStatus(Long id, String status, Long operatorId) {
        PolishOrder existingOrder = this.getById(id);
        if (existingOrder == null) {
            throw new BusinessException(ResultCode.NOT_FOUND.getCode(), "工单不存在");
        }

        validateStatusTransition(existingOrder.getStatus(), status);

        PolishOrder polishOrder = new PolishOrder();
        polishOrder.setId(id);
        polishOrder.setStatus(status);

        if (OrderStatusEnum.DESIGN.getCode().equals(status)) {
            polishOrder.setDesignConfirmTime(LocalDateTime.now());
        } else if (OrderStatusEnum.GRINDING.getCode().equals(status)) {
            polishOrder.setStartTime(LocalDateTime.now());
            if (operatorId != null) {
                polishOrder.setPolisherId(operatorId);
            }
        } else if (OrderStatusEnum.DELIVERED.getCode().equals(status)) {
            polishOrder.setFinishTime(LocalDateTime.now());
            RawStone rawStone = rawStoneMapper.selectById(existingOrder.getRawStoneId());
            if (rawStone != null) {
                rawStone.setStatus(RawStoneStatusEnum.FINISHED.getCode());
                rawStoneMapper.updateById(rawStone);
            }
        }

        boolean result = this.updateById(polishOrder);
        log.info("工单状态变更: 工单号={}, 从={}, 到={}, 操作人={}", 
                existingOrder.getOrderNo(), existingOrder.getStatus(), status, operatorId);
        return result;
    }

    private void validateStatusTransition(String currentStatus, String newStatus) {
        boolean validTransition = switch (currentStatus) {
            case "PENDING" -> "DESIGN".equals(newStatus) || "CANCELLED".equals(newStatus);
            case "DESIGN" -> "GRINDING".equals(newStatus) || "SHELVED".equals(newStatus);
            case "GRINDING" -> "POLISHING".equals(newStatus);
            case "POLISHING" -> "INLAY".equals(newStatus);
            case "INLAY" -> "DELIVERED".equals(newStatus);
            case "SHELVED" -> "DESIGN".equals(newStatus) || "CANCELLED".equals(newStatus);
            default -> false;
        };

        if (!validTransition) {
            throw new BusinessException(ResultCode.FAIL.getCode(), 
                    "不允许的状态变更: 从 " + currentStatus + " 到 " + newStatus);
        }
    }

    @Override
    public void shelveOverdueOrders() {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        LambdaQueryWrapper<PolishOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PolishOrder::getStatus, OrderStatusEnum.DESIGN.getCode())
                .lt(PolishOrder::getDesignConfirmTime, sevenDaysAgo);

        List<PolishOrder> overdueOrders = this.list(wrapper);
        for (PolishOrder order : overdueOrders) {
            order.setStatus(OrderStatusEnum.SHELVED.getCode());
            this.updateById(order);
        }
    }
}
