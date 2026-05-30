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
public class SalesOutboundService {

    private final SalesOutboundMapper outboundMapper;
    private final SalesOutboundDetailMapper outboundDetailMapper;
    private final SalesOrderMapper orderMapper;
    private final CustomerMapper customerMapper;
    private final ProductMapper productMapper;
    private final FinishedProductStockMapper stockMapper;

    public SalesOutboundService(SalesOutboundMapper outboundMapper,
                                SalesOutboundDetailMapper outboundDetailMapper,
                                SalesOrderMapper orderMapper,
                                CustomerMapper customerMapper,
                                ProductMapper productMapper,
                                FinishedProductStockMapper stockMapper) {
        this.outboundMapper = outboundMapper;
        this.outboundDetailMapper = outboundDetailMapper;
        this.orderMapper = orderMapper;
        this.customerMapper = customerMapper;
        this.productMapper = productMapper;
        this.stockMapper = stockMapper;
    }

    public IPage<SalesOutbound> page(PageQuery pageQuery, Integer status, Long customerId) {
        LambdaQueryWrapper<SalesOutbound> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(SalesOutbound::getStatus, status);
        }
        if (customerId != null) {
            wrapper.eq(SalesOutbound::getCustomerId, customerId);
        }
        wrapper.orderByDesc(SalesOutbound::getCreateTime);
        return outboundMapper.selectPage(new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()), wrapper);
    }

    public List<SalesOutbound> list() {
        return outboundMapper.selectOutboundList();
    }

    public SalesOutbound getById(Long id) {
        SalesOutbound outbound = outboundMapper.selectOutboundDetail(id);
        if (outbound == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        outbound.setDetails(outboundDetailMapper.selectByOutboundId(id));
        return outbound;
    }

    @Transactional(rollbackFor = Exception.class)
    public void createOutbound(SalesOutbound outbound, List<SalesOutboundDetail> details) {
        if (outbound.getCustomerId() == null) {
            throw new BusinessException("请选择客户");
        }
        Customer customer = customerMapper.selectById(outbound.getCustomerId());
        if (customer == null) {
            throw new BusinessException("客户不存在");
        }

        if (outbound.getOrderId() != null) {
            SalesOrder order = orderMapper.selectById(outbound.getOrderId());
            if (order == null) {
                throw new BusinessException("订单不存在");
            }
        }

        String outboundNo = generateOutboundNo();
        outbound.setOutboundNo(outboundNo);
        outbound.setStatus(1);

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (SalesOutboundDetail detail : details) {
            Product product = productMapper.selectById(detail.getProductId());
            if (product == null) {
                throw new BusinessException("产品不存在：" + detail.getProductId());
            }
            FinishedProductStock stock = stockMapper.selectByProductId(detail.getProductId());
            if (stock == null || stock.getQuantity() < detail.getQuantity()) {
                throw new BusinessException("库存不足：" + product.getProductName());
            }
            if (detail.getUnitPrice() == null) {
                detail.setUnitPrice(product.getSellingPrice());
            }
            detail.setTotalAmount(detail.getUnitPrice().multiply(new BigDecimal(detail.getQuantity())));
            totalAmount = totalAmount.add(detail.getTotalAmount());
        }
        outbound.setTotalAmount(totalAmount);

        outboundMapper.insert(outbound);

        for (SalesOutboundDetail detail : details) {
            detail.setOutboundId(outbound.getId());
            detail.setWarehouseLocation("成品仓-A区");
            detail.setCreateTime(LocalDateTime.now());
            outboundDetailMapper.insert(detail);
        }

        log.info("创建销售出库单：{}，总金额：{}", outboundNo, totalAmount);
    }

    @Transactional(rollbackFor = Exception.class)
    public void auditOutbound(Long id, Long auditorId, boolean passed, String remark) {
        SalesOutbound outbound = outboundMapper.selectById(id);
        if (outbound == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (outbound.getStatus() != 1) {
            throw new BusinessException("只有待审核的出库单才能审核");
        }

        outbound.setAuditorId(auditorId);
        outbound.setAuditTime(LocalDateTime.now());
        outbound.setRemark(remark);

        if (passed) {
            List<SalesOutboundDetail> details = outboundDetailMapper.selectByOutboundId(id);
            for (SalesOutboundDetail detail : details) {
                int result = stockMapper.deductStock(detail.getProductId(), detail.getQuantity());
                if (result == 0) {
                    throw new BusinessException("库存不足，出库失败");
                }
                updateStockStatus(detail.getProductId());
            }
            outbound.setStatus(2);
            outboundMapper.updateById(outbound);

            if (outbound.getOrderId() != null) {
                SalesOrder order = orderMapper.selectById(outbound.getOrderId());
                if (order != null) {
                    order.setStatus(4);
                    orderMapper.updateById(order);
                }
            }
            log.info("销售出库单审核通过：{}，出库数量：{}", outbound.getOutboundNo(), details.size());
        } else {
            outbound.setStatus(3);
            outboundMapper.updateById(outbound);
            log.info("销售出库单审核驳回：{}，原因：{}", outbound.getOutboundNo(), remark);
        }
    }

    private void updateStockStatus(Long productId) {
        FinishedProductStock stock = stockMapper.selectByProductId(productId);
        if (stock != null) {
            if (stock.getQuantity() <= stock.getWarnStock()) {
                stock.setStatus(2);
            } else {
                stock.setStatus(1);
            }
            stockMapper.updateById(stock);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateOutbound(SalesOutbound outbound, List<SalesOutboundDetail> details) {
        SalesOutbound existing = outboundMapper.selectById(outbound.getId());
        if (existing == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (existing.getStatus() != 1) {
            throw new BusinessException("只有待审核的出库单才能修改");
        }

        outboundDetailMapper.delete(new LambdaQueryWrapper<SalesOutboundDetail>()
                .eq(SalesOutboundDetail::getOutboundId, outbound.getId()));

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (SalesOutboundDetail detail : details) {
            Product product = productMapper.selectById(detail.getProductId());
            if (product == null) {
                throw new BusinessException("产品不存在：" + detail.getProductId());
            }
            if (detail.getUnitPrice() == null) {
                detail.setUnitPrice(product.getSellingPrice());
            }
            detail.setTotalAmount(detail.getUnitPrice().multiply(new BigDecimal(detail.getQuantity())));
            totalAmount = totalAmount.add(detail.getTotalAmount());
            detail.setOutboundId(outbound.getId());
            detail.setWarehouseLocation("成品仓-A区");
            detail.setCreateTime(LocalDateTime.now());
            outboundDetailMapper.insert(detail);
        }
        outbound.setTotalAmount(totalAmount);
        outboundMapper.updateById(outbound);
        log.info("更新销售出库单：{}", existing.getOutboundNo());
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteOutbound(Long id) {
        SalesOutbound outbound = outboundMapper.selectById(id);
        if (outbound == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (outbound.getStatus() == 2) {
            throw new BusinessException("已出库的单据无法删除");
        }
        outboundDetailMapper.delete(new LambdaQueryWrapper<SalesOutboundDetail>()
                .eq(SalesOutboundDetail::getOutboundId, id));
        outboundMapper.deleteById(id);
        log.info("删除销售出库单：{}", outbound.getOutboundNo());
    }

    private String generateOutboundNo() {
        String dateStr = DateUtil.format(DateUtil.date(), "yyyyMMdd");
        String uuid = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "SOU" + dateStr + uuid;
    }
}
