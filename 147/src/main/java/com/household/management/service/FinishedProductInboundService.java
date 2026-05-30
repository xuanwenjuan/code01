package com.household.management.service;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.household.management.common.entity.PageQuery;
import com.household.management.common.exception.BusinessException;
import com.household.management.common.result.ResultCode;
import com.household.management.entity.FinishedProductInbound;
import com.household.management.entity.FinishedProductStock;
import com.household.management.mapper.FinishedProductInboundMapper;
import com.household.management.mapper.FinishedProductStockMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class FinishedProductInboundService {

    private final FinishedProductInboundMapper inboundMapper;
    private final FinishedProductStockMapper stockMapper;

    public FinishedProductInboundService(FinishedProductInboundMapper inboundMapper,
                                         FinishedProductStockMapper stockMapper) {
        this.inboundMapper = inboundMapper;
        this.stockMapper = stockMapper;
    }

    public IPage<FinishedProductInbound> page(PageQuery pageQuery, Integer status, Long productId) {
        LambdaQueryWrapper<FinishedProductInbound> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(FinishedProductInbound::getStatus, status);
        }
        if (productId != null) {
            wrapper.eq(FinishedProductInbound::getProductId, productId);
        }
        wrapper.orderByDesc(FinishedProductInbound::getCreateTime);
        return inboundMapper.selectPage(new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()), wrapper);
    }

    public List<FinishedProductInbound> list() {
        return inboundMapper.selectInboundList();
    }

    public FinishedProductInbound getById(Long id) {
        FinishedProductInbound inbound = inboundMapper.selectInboundDetail(id);
        if (inbound == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        return inbound;
    }

    @Transactional(rollbackFor = Exception.class)
    public void createInbound(FinishedProductInbound inbound) {
        String inboundNo = generateInboundNo();
        inbound.setInboundNo(inboundNo);
        inbound.setStatus(1);
        inboundMapper.insert(inbound);
        log.info("创建成品入库单：{}", inboundNo);
    }

    @Transactional(rollbackFor = Exception.class)
    public void auditInbound(Long id, Long auditorId, boolean passed, String remark) {
        FinishedProductInbound inbound = inboundMapper.selectById(id);
        if (inbound == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (inbound.getStatus() != 1) {
            throw new BusinessException("只有待审核的入库单才能审核");
        }

        inbound.setAuditorId(auditorId);
        inbound.setAuditTime(LocalDateTime.now());
        inbound.setRemark(remark);

        if (passed) {
            inbound.setStatus(2);
            inboundMapper.updateById(inbound);

            FinishedProductStock stock = stockMapper.selectByProductId(inbound.getProductId());
            if (stock == null) {
                stock = new FinishedProductStock();
                stock.setProductId(inbound.getProductId());
                stock.setQuantity(inbound.getQualifiedQuantity());
                stock.setWarehouseLocation(inbound.getWarehouseLocation());
                stock.setWarnStock(100);
                stock.setStatus(1);
                stockMapper.insert(stock);
            } else {
                stockMapper.addStock(inbound.getProductId(), inbound.getQualifiedQuantity());
            }

            updateStockStatus(inbound.getProductId());
            log.info("成品入库单审核通过：{}，入库数量：{}", inbound.getInboundNo(), inbound.getQualifiedQuantity());
        } else {
            inbound.setStatus(3);
            inboundMapper.updateById(inbound);
            log.info("成品入库单审核驳回：{}，原因：{}", inbound.getInboundNo(), remark);
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
    public void updateInbound(FinishedProductInbound inbound) {
        FinishedProductInbound existing = inboundMapper.selectById(inbound.getId());
        if (existing == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (existing.getStatus() != 1) {
            throw new BusinessException("只有待审核的入库单才能修改");
        }
        inboundMapper.updateById(inbound);
        log.info("更新成品入库单：{}", existing.getInboundNo());
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteInbound(Long id) {
        FinishedProductInbound inbound = inboundMapper.selectById(id);
        if (inbound == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (inbound.getStatus() == 2) {
            throw new BusinessException("已入库的单据无法删除");
        }
        inboundMapper.deleteById(id);
        log.info("删除成品入库单：{}", inbound.getInboundNo());
    }

    private String generateInboundNo() {
        String dateStr = DateUtil.format(DateUtil.date(), "yyyyMMdd");
        String uuid = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "FPI" + dateStr + uuid;
    }
}
