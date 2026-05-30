package com.household.management.service;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.household.management.common.entity.PageQuery;
import com.household.management.common.exception.BusinessException;
import com.household.management.common.result.ResultCode;
import com.household.management.entity.*;
import com.household.management.mapper.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class SalesOrderService {

    private final SalesOrderMapper orderMapper;
    private final SalesOrderDetailMapper orderDetailMapper;
    private final ProductMapper productMapper;
    private final CustomerMapper customerMapper;
    private final FinishedProductStockMapper stockMapper;

    public SalesOrderService(SalesOrderMapper orderMapper,
                             SalesOrderDetailMapper orderDetailMapper,
                             ProductMapper productMapper,
                             CustomerMapper customerMapper,
                             FinishedProductStockMapper stockMapper) {
        this.orderMapper = orderMapper;
        this.orderDetailMapper = orderDetailMapper;
        this.productMapper = productMapper;
        this.customerMapper = customerMapper;
        this.stockMapper = stockMapper;
    }

    public IPage<SalesOrder> page(PageQuery pageQuery, Integer status, Long customerId) {
        LambdaQueryWrapper<SalesOrder> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(SalesOrder::getStatus, status);
        }
        if (customerId != null) {
            wrapper.eq(SalesOrder::getCustomerId, customerId);
        }
        wrapper.orderByDesc(SalesOrder::getPriority).orderByDesc(SalesOrder::getCreateTime);
        return orderMapper.selectPage(new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()), wrapper);
    }

    public List<SalesOrder> list() {
        return orderMapper.selectOrderList();
    }

    public SalesOrder getById(Long id) {
        SalesOrder order = orderMapper.selectOrderDetail(id);
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        order.setDetails(orderDetailMapper.selectByOrderId(id));
        return order;
    }

    @Transactional(rollbackFor = Exception.class)
    public void createOrder(SalesOrder order, List<SalesOrderDetail> details) {
        Customer customer = customerMapper.selectById(order.getCustomerId());
        if (customer == null) {
            throw new BusinessException("客户不存在");
        }

        String orderNo = generateOrderNo();
        order.setOrderNo(orderNo);
        order.setStatus(1);
        if (order.getPriority() == null) {
            order.setPriority(0);
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (SalesOrderDetail detail : details) {
            Product product = productMapper.selectById(detail.getProductId());
            if (product == null) {
                throw new BusinessException("产品不存在：" + detail.getProductId());
            }
            if (product.getStatus() == 0) {
                throw new BusinessException("产品已下架：" + product.getProductName());
            }
            if (detail.getUnitPrice() == null) {
                detail.setUnitPrice(product.getSellingPrice());
            }
            detail.setTotalAmount(detail.getUnitPrice().multiply(new BigDecimal(detail.getQuantity())));
            totalAmount = totalAmount.add(detail.getTotalAmount());
        }
        order.setTotalAmount(totalAmount);

        orderMapper.insert(order);

        for (SalesOrderDetail detail : details) {
            detail.setOrderId(order.getId());
            detail.setCreateTime(LocalDateTime.now());
            orderDetailMapper.insert(detail);
        }

        log.info("创建销售订单：{} - {}，总金额：{}", orderNo, customer.getCustomerName(), totalAmount);
    }

    @Transactional(rollbackFor = Exception.class)
    public void confirmOrder(Long id) {
        SalesOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (order.getStatus() != 1) {
            throw new BusinessException("只有待确认的订单才能确认");
        }

        order.setStatus(3);
        orderMapper.updateById(order);
        log.info("确认销售订单：{}", order.getOrderNo());
    }

    @Transactional(rollbackFor = Exception.class)
    public void cancelOrder(Long id, String reason) {
        SalesOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (order.getStatus() >= 4) {
            throw new BusinessException("订单已发货或已完成，无法取消");
        }
        order.setStatus(6);
        order.setRemark(reason);
        orderMapper.updateById(order);
        log.info("取消销售订单：{}，原因：{}", order.getOrderNo(), reason);
    }

    @Transactional(rollbackFor = Exception.class)
    public void completeOrder(Long id) {
        SalesOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (order.getStatus() != 4) {
            throw new BusinessException("只有已发货的订单才能完成");
        }
        order.setStatus(5);
        orderMapper.updateById(order);
        log.info("完成销售订单：{}", order.getOrderNo());
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateOrder(SalesOrder order, List<SalesOrderDetail> details) {
        SalesOrder existing = orderMapper.selectById(order.getId());
        if (existing == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (existing.getStatus() != 1) {
            throw new BusinessException("只有待确认的订单才能修改");
        }

        orderDetailMapper.delete(new LambdaQueryWrapper<SalesOrderDetail>()
                .eq(SalesOrderDetail::getOrderId, order.getId()));

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (SalesOrderDetail detail : details) {
            Product product = productMapper.selectById(detail.getProductId());
            if (product == null) {
                throw new BusinessException("产品不存在：" + detail.getProductId());
            }
            if (detail.getUnitPrice() == null) {
                detail.setUnitPrice(product.getSellingPrice());
            }
            detail.setTotalAmount(detail.getUnitPrice().multiply(new BigDecimal(detail.getQuantity())));
            totalAmount = totalAmount.add(detail.getTotalAmount());
            detail.setOrderId(order.getId());
            detail.setCreateTime(LocalDateTime.now());
            orderDetailMapper.insert(detail);
        }
        order.setTotalAmount(totalAmount);
        orderMapper.updateById(order);
        log.info("更新销售订单：{}", existing.getOrderNo());
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteOrder(Long id) {
        SalesOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (order.getStatus() >= 2) {
            throw new BusinessException("订单已确认，无法删除");
        }
        orderDetailMapper.delete(new LambdaQueryWrapper<SalesOrderDetail>()
                .eq(SalesOrderDetail::getOrderId, id));
        orderMapper.deleteById(id);
        log.info("删除销售订单：{}", order.getOrderNo());
    }

    private String generateOrderNo() {
        String dateStr = DateUtil.format(DateUtil.date(), "yyyyMMdd");
        String uuid = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "SO" + dateStr + uuid;
    }
}
