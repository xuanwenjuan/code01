package com.radiator.management.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.radiator.management.entity.MaterialInventory;
import com.radiator.management.entity.StockInDetail;
import com.radiator.management.entity.StockInOrder;
import com.radiator.management.exception.BusinessException;
import com.radiator.management.mapper.MaterialInventoryMapper;
import com.radiator.management.mapper.StockInDetailMapper;
import com.radiator.management.mapper.StockInOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockInService {

    private final StockInOrderMapper stockInOrderMapper;
    private final StockInDetailMapper stockInDetailMapper;
    private final MaterialInventoryMapper materialInventoryMapper;

    @Transactional(rollbackFor = Exception.class)
    public void createStockInOrder(StockInOrder order, Long userId) {
        String orderNo = "IN" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        order.setOrderNo(orderNo);
        order.setStatus("DRAFT");
        order.setCreateBy(userId);

        BigDecimal totalAmount = BigDecimal.ZERO;
        int totalQuantity = 0;
        if (order.getDetails() != null) {
            for (StockInDetail detail : order.getDetails()) {
                detail.setTotalPrice(detail.getUnitPrice().multiply(detail.getQuantity()));
                totalAmount = totalAmount.add(detail.getTotalPrice());
                totalQuantity += detail.getQuantity().intValue();
            }
        }
        order.setTotalAmount(totalAmount);
        order.setTotalQuantity(totalQuantity);

        stockInOrderMapper.insert(order);

        if (order.getDetails() != null) {
            for (StockInDetail detail : order.getDetails()) {
                detail.setOrderId(order.getId());
                stockInDetailMapper.insert(detail);
            }
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStockInOrder(StockInOrder order) {
        StockInOrder existing = stockInOrderMapper.selectById(order.getId());
        if (existing == null) {
            throw new BusinessException("入库单不存在");
        }
        if (!"DRAFT".equals(existing.getStatus())) {
            throw new BusinessException("只有草稿状态的入库单可以修改");
        }

        stockInDetailMapper.delete(
                new LambdaQueryWrapper<StockInDetail>().eq(StockInDetail::getOrderId, order.getId())
        );

        BigDecimal totalAmount = BigDecimal.ZERO;
        int totalQuantity = 0;
        if (order.getDetails() != null) {
            for (StockInDetail detail : order.getDetails()) {
                detail.setOrderId(order.getId());
                detail.setTotalPrice(detail.getUnitPrice().multiply(detail.getQuantity()));
                totalAmount = totalAmount.add(detail.getTotalPrice());
                totalQuantity += detail.getQuantity().intValue();
                stockInDetailMapper.insert(detail);
            }
        }
        order.setTotalAmount(totalAmount);
        order.setTotalQuantity(totalQuantity);
        stockInOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void submitStockInOrder(Long id) {
        StockInOrder order = stockInOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("入库单不存在");
        }
        if (!"DRAFT".equals(order.getStatus())) {
            throw new BusinessException("只有草稿状态的入库单可以提交");
        }
        order.setStatus("PENDING");
        stockInOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void approveStockInOrder(Long id, Long approverId) {
        StockInOrder order = stockInOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("入库单不存在");
        }
        if (!"PENDING".equals(order.getStatus())) {
            throw new BusinessException("只有待审核状态的入库单可以审核");
        }

        List<StockInDetail> details = stockInDetailMapper.selectList(
                new LambdaQueryWrapper<StockInDetail>().eq(StockInDetail::getOrderId, id)
        );

        for (StockInDetail detail : details) {
            MaterialInventory inventory = materialInventoryMapper.selectById(detail.getMaterialId());
            if (inventory == null) {
                inventory = new MaterialInventory();
                inventory.setMaterialId(detail.getMaterialId());
                inventory.setMaterialCode(detail.getMaterialCode());
                inventory.setMaterialName(detail.getMaterialName());
                inventory.setSpecification(detail.getSpecification());
                inventory.setUnit(detail.getUnit());
                inventory.setQuantity(detail.getQuantity());
                inventory.setWarningQuantity(BigDecimal.ZERO);
                inventory.setUnitPrice(detail.getUnitPrice());
                inventory.setBatchNo(detail.getBatchNo());
                inventory.setStatus("NORMAL");
                materialInventoryMapper.insert(inventory);
            } else {
                inventory.setQuantity(inventory.getQuantity().add(detail.getQuantity()));
                BigDecimal oldValue = inventory.getUnitPrice().multiply(inventory.getQuantity().subtract(detail.getQuantity()));
                BigDecimal newValue = detail.getUnitPrice().multiply(detail.getQuantity());
                BigDecimal newUnitPrice = oldValue.add(newValue).divide(inventory.getQuantity(), 4, BigDecimal.ROUND_HALF_UP);
                inventory.setUnitPrice(newUnitPrice);
                materialInventoryMapper.updateById(inventory);
            }
        }

        order.setStatus("COMPLETED");
        order.setApproverId(approverId);
        order.setApproveTime(LocalDateTime.now());
        order.setActualDate(LocalDateTime.now());
        stockInOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void rejectStockInOrder(Long id, String remark) {
        StockInOrder order = stockInOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("入库单不存在");
        }
        order.setStatus("REJECTED");
        order.setRemark(remark);
        stockInOrderMapper.updateById(order);
    }

    public Page<StockInOrder> listStockInOrders(int page, int size, String status, String keyword) {
        LambdaQueryWrapper<StockInOrder> wrapper = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            wrapper.eq(StockInOrder::getStatus, status);
        }
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(StockInOrder::getOrderNo, keyword)
                    .or().like(StockInOrder::getSupplierName, keyword));
        }
        wrapper.orderByDesc(StockInOrder::getCreateTime);
        return stockInOrderMapper.selectPage(new Page<>(page, size), wrapper);
    }

    public StockInOrder getStockInOrderById(Long id) {
        StockInOrder order = stockInOrderMapper.selectById(id);
        if (order != null) {
            List<StockInDetail> details = stockInDetailMapper.selectList(
                    new LambdaQueryWrapper<StockInDetail>().eq(StockInDetail::getOrderId, id)
            );
            order.setDetails(details);
        }
        return order;
    }

    public List<StockInDetail> getStockInDetails(Long orderId) {
        return stockInDetailMapper.selectList(
                new LambdaQueryWrapper<StockInDetail>().eq(StockInDetail::getOrderId, orderId)
        );
    }
}
