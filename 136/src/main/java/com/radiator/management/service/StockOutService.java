package com.radiator.management.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.radiator.management.entity.MaterialInventory;
import com.radiator.management.entity.StockOutDetail;
import com.radiator.management.entity.StockOutOrder;
import com.radiator.management.exception.BusinessException;
import com.radiator.management.mapper.MaterialInventoryMapper;
import com.radiator.management.mapper.StockOutDetailMapper;
import com.radiator.management.mapper.StockOutOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockOutService {

    private final StockOutOrderMapper stockOutOrderMapper;
    private final StockOutDetailMapper stockOutDetailMapper;
    private final MaterialInventoryMapper materialInventoryMapper;

    @Transactional(rollbackFor = Exception.class)
    public void createStockOutOrder(StockOutOrder order, Long userId) {
        String orderNo = "OUT" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        order.setOrderNo(orderNo);
        order.setStatus("DRAFT");
        order.setCreateBy(userId);

        BigDecimal totalAmount = BigDecimal.ZERO;
        int totalQuantity = 0;
        if (order.getDetails() != null) {
            for (StockOutDetail detail : order.getDetails()) {
                MaterialInventory inventory = materialInventoryMapper.selectById(detail.getMaterialId());
                if (inventory != null) {
                    detail.setUnitPrice(inventory.getUnitPrice());
                    detail.setTotalPrice(inventory.getUnitPrice().multiply(detail.getQuantity()));
                    detail.setBatchNo(inventory.getBatchNo());
                    totalAmount = totalAmount.add(detail.getTotalPrice());
                    totalQuantity += detail.getQuantity().intValue();
                }
            }
        }
        order.setTotalAmount(totalAmount);
        order.setTotalQuantity(totalQuantity);

        stockOutOrderMapper.insert(order);

        if (order.getDetails() != null) {
            for (StockOutDetail detail : order.getDetails()) {
                detail.setOrderId(order.getId());
                stockOutDetailMapper.insert(detail);
            }
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStockOutOrder(StockOutOrder order) {
        StockOutOrder existing = stockOutOrderMapper.selectById(order.getId());
        if (existing == null) {
            throw new BusinessException("出库单不存在");
        }
        if (!"DRAFT".equals(existing.getStatus())) {
            throw new BusinessException("只有草稿状态的出库单可以修改");
        }

        stockOutDetailMapper.delete(
                new LambdaQueryWrapper<StockOutDetail>().eq(StockOutDetail::getOrderId, order.getId())
        );

        BigDecimal totalAmount = BigDecimal.ZERO;
        int totalQuantity = 0;
        if (order.getDetails() != null) {
            for (StockOutDetail detail : order.getDetails()) {
                detail.setOrderId(order.getId());
                MaterialInventory inventory = materialInventoryMapper.selectById(detail.getMaterialId());
                if (inventory != null) {
                    detail.setUnitPrice(inventory.getUnitPrice());
                    detail.setTotalPrice(inventory.getUnitPrice().multiply(detail.getQuantity()));
                    detail.setBatchNo(inventory.getBatchNo());
                    totalAmount = totalAmount.add(detail.getTotalPrice());
                    totalQuantity += detail.getQuantity().intValue();
                }
                stockOutDetailMapper.insert(detail);
            }
        }
        order.setTotalAmount(totalAmount);
        order.setTotalQuantity(totalQuantity);
        stockOutOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void submitStockOutOrder(Long id) {
        StockOutOrder order = stockOutOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("出库单不存在");
        }
        if (!"DRAFT".equals(order.getStatus())) {
            throw new BusinessException("只有草稿状态的出库单可以提交");
        }

        List<StockOutDetail> details = stockOutDetailMapper.selectList(
                new LambdaQueryWrapper<StockOutDetail>().eq(StockOutDetail::getOrderId, id)
        );

        for (StockOutDetail detail : details) {
            MaterialInventory inventory = materialInventoryMapper.selectById(detail.getMaterialId());
            if (inventory == null || inventory.getQuantity().compareTo(detail.getQuantity()) < 0) {
                throw new BusinessException("物料 " + detail.getMaterialName() + " 库存不足");
            }
        }

        order.setStatus("PENDING");
        stockOutOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void approveStockOutOrder(Long id, Long approverId) {
        StockOutOrder order = stockOutOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("出库单不存在");
        }
        if (!"PENDING".equals(order.getStatus())) {
            throw new BusinessException("只有待审核状态的出库单可以审核");
        }

        List<StockOutDetail> details = stockOutDetailMapper.selectList(
                new LambdaQueryWrapper<StockOutDetail>().eq(StockOutDetail::getOrderId, id)
        );

        for (StockOutDetail detail : details) {
            MaterialInventory inventory = materialInventoryMapper.selectById(detail.getMaterialId());
            if (inventory == null || inventory.getQuantity().compareTo(detail.getQuantity()) < 0) {
                throw new BusinessException("物料 " + detail.getMaterialName() + " 库存不足");
            }
            inventory.setQuantity(inventory.getQuantity().subtract(detail.getQuantity()));

            if (inventory.getQuantity().compareTo(inventory.getWarningQuantity()) <= 0) {
                inventory.setStatus("WARNING");
            }

            materialInventoryMapper.updateById(inventory);
        }

        order.setStatus("COMPLETED");
        order.setApproverId(approverId);
        order.setApproveTime(LocalDateTime.now());
        order.setActualDate(LocalDateTime.now());
        stockOutOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void rejectStockOutOrder(Long id, String remark) {
        StockOutOrder order = stockOutOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("出库单不存在");
        }
        order.setStatus("REJECTED");
        order.setRemark(remark);
        stockOutOrderMapper.updateById(order);
    }

    public Page<StockOutOrder> listStockOutOrders(int page, int size, String status, String keyword) {
        LambdaQueryWrapper<StockOutOrder> wrapper = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            wrapper.eq(StockOutOrder::getStatus, status);
        }
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(StockOutOrder::getOrderNo, keyword)
                    .or().like(StockOutOrder::getWorkOrderNo, keyword));
        }
        wrapper.orderByDesc(StockOutOrder::getCreateTime);
        return stockOutOrderMapper.selectPage(new Page<>(page, size), wrapper);
    }

    public StockOutOrder getStockOutOrderById(Long id) {
        StockOutOrder order = stockOutOrderMapper.selectById(id);
        if (order != null) {
            List<StockOutDetail> details = stockOutDetailMapper.selectList(
                    new LambdaQueryWrapper<StockOutDetail>().eq(StockOutDetail::getOrderId, id)
            );
            order.setDetails(details);
        }
        return order;
    }

    public List<StockOutDetail> getStockOutDetails(Long orderId) {
        return stockOutDetailMapper.selectList(
                new LambdaQueryWrapper<StockOutDetail>().eq(StockOutDetail::getOrderId, orderId)
        );
    }
}
