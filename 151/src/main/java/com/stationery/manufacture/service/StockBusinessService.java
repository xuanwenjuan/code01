package com.stationery.manufacture.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.stationery.manufacture.common.BusinessException;
import com.stationery.manufacture.common.ErrorCode;
import com.stationery.manufacture.common.UserContext;
import com.stationery.manufacture.entity.MaterialStock;
import com.stationery.manufacture.entity.StockFlow;
import com.stationery.manufacture.entity.StockInbound;
import com.stationery.manufacture.entity.StockOutbound;
import com.stationery.manufacture.mapper.MaterialStockMapper;
import com.stationery.manufacture.mapper.StockFlowMapper;
import com.stationery.manufacture.mapper.StockInboundMapper;
import com.stationery.manufacture.mapper.StockOutboundMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class StockBusinessService {

    private final StockInboundMapper inboundMapper;
    private final StockOutboundMapper outboundMapper;
    private final StockFlowMapper flowMapper;
    private final MaterialStockMapper stockMapper;
    private final StringRedisTemplate redisTemplate;

    public StockBusinessService(StockInboundMapper inboundMapper,
                                StockOutboundMapper outboundMapper,
                                StockFlowMapper flowMapper,
                                MaterialStockMapper stockMapper,
                                StringRedisTemplate redisTemplate) {
        this.inboundMapper = inboundMapper;
        this.outboundMapper = outboundMapper;
        this.flowMapper = flowMapper;
        this.stockMapper = stockMapper;
        this.redisTemplate = redisTemplate;
    }

    @Transactional(rollbackFor = Exception.class)
    public void createInbound(StockInbound inbound) {
        MaterialStock stock = stockMapper.selectById(inbound.getMaterialId());
        if (stock == null) {
            throw new BusinessException("物料不存在");
        }

        inbound.setInboundNo(generateInboundNo());
        inbound.setTotalPrice(inbound.getQuantity().multiply(inbound.getUnitPrice()));
        inbound.setStatus(1);
        inbound.setOperatorId(UserContext.getCurrentUserId());
        inbound.setOperatorName(UserContext.getCurrentUsername());
        inbound.setCreateTime(LocalDateTime.now());
        inbound.setUpdateTime(LocalDateTime.now());
        inbound.setMaterialCode(stock.getMaterialCode());
        inbound.setMaterialName(stock.getMaterialName());
        inbound.setSpecification(stock.getSpecification());
        inbound.setUnit(stock.getUnit());
        if (!StringUtils.hasText(inbound.getBatchNo())) {
            inbound.setBatchNo(generateBatchNo(stock.getMaterialType()));
        }

        inboundMapper.insert(inbound);
    }

    @Transactional(rollbackFor = Exception.class)
    public void confirmInbound(Long id) {
        StockInbound inbound = inboundMapper.selectById(id);
        if (inbound == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }
        if (inbound.getStatus() == 2) {
            throw new BusinessException("入库单已确认");
        }

        MaterialStock stock = stockMapper.selectById(inbound.getMaterialId());
        if (stock == null) {
            throw new BusinessException("物料不存在");
        }

        BigDecimal beforeQty = stock.getQuantity();
        BigDecimal afterQty = beforeQty.add(inbound.getQuantity());

        stock.setQuantity(afterQty);
        if (afterQty.compareTo(stock.getWarningQuantity()) <= 0) {
            stock.setStockStatus(2);
            stock.setPurchaseStatus(2);
        } else {
            stock.setStockStatus(1);
        }
        stock.setUpdateTime(LocalDateTime.now());
        stockMapper.updateById(stock);

        recordStockFlow(stock, "IN", inbound.getQuantity(), beforeQty, afterQty,
                inbound.getInboundNo(), "INBOUND", "原料入库");

        inbound.setStatus(2);
        inbound.setUpdateTime(LocalDateTime.now());
        inboundMapper.updateById(inbound);
    }

    @Transactional(rollbackFor = Exception.class)
    public void createOutbound(StockOutbound outbound) {
        MaterialStock stock = stockMapper.selectById(outbound.getMaterialId());
        if (stock == null) {
            throw new BusinessException("物料不存在");
        }
        if (stock.getQuantity().compareTo(outbound.getQuantity()) < 0) {
            throw new BusinessException(ErrorCode.STOCK_NOT_ENOUGH);
        }

        outbound.setOutboundNo(generateOutboundNo());
        outbound.setTotalPrice(outbound.getQuantity().multiply(outbound.getUnitPrice()));
        outbound.setStatus(1);
        outbound.setOperatorId(UserContext.getCurrentUserId());
        outbound.setOperatorName(UserContext.getCurrentUsername());
        outbound.setCreateTime(LocalDateTime.now());
        outbound.setUpdateTime(LocalDateTime.now());
        outbound.setMaterialCode(stock.getMaterialCode());
        outbound.setMaterialName(stock.getMaterialName());
        outbound.setSpecification(stock.getSpecification());
        outbound.setUnit(stock.getUnit());

        outboundMapper.insert(outbound);
    }

    @Transactional(rollbackFor = Exception.class)
    public void confirmOutbound(Long id) {
        StockOutbound outbound = outboundMapper.selectById(id);
        if (outbound == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }
        if (outbound.getStatus() == 2) {
            throw new BusinessException("出库单已确认");
        }

        MaterialStock stock = stockMapper.selectById(outbound.getMaterialId());
        if (stock == null) {
            throw new BusinessException("物料不存在");
        }
        if (stock.getQuantity().compareTo(outbound.getQuantity()) < 0) {
            throw new BusinessException(ErrorCode.STOCK_NOT_ENOUGH);
        }

        BigDecimal beforeQty = stock.getQuantity();
        BigDecimal afterQty = beforeQty.subtract(outbound.getQuantity());

        stock.setQuantity(afterQty);
        if (afterQty.compareTo(stock.getWarningQuantity()) <= 0) {
            stock.setStockStatus(2);
            stock.setPurchaseStatus(2);
        } else {
            stock.setStockStatus(1);
        }
        stock.setUpdateTime(LocalDateTime.now());
        stockMapper.updateById(stock);

        recordStockFlow(stock, "OUT", outbound.getQuantity(), beforeQty, afterQty,
                outbound.getOutboundNo(), "OUTBOUND", "原料出库");

        outbound.setStatus(2);
        outbound.setUpdateTime(LocalDateTime.now());
        outboundMapper.updateById(outbound);
    }

    @Transactional(rollbackFor = Exception.class)
    public void allocateMaterial(Long orderId, Long materialId, BigDecimal quantity, String batchNo) {
        MaterialStock stock = stockMapper.selectById(materialId);
        if (stock == null) {
            throw new BusinessException("物料不存在");
        }
        if (stock.getQuantity().compareTo(quantity) < 0) {
            throw new BusinessException(ErrorCode.STOCK_NOT_ENOUGH);
        }

        BigDecimal beforeQty = stock.getQuantity();
        BigDecimal afterQty = beforeQty.subtract(quantity);

        stock.setQuantity(afterQty);
        if (afterQty.compareTo(stock.getWarningQuantity()) <= 0) {
            stock.setStockStatus(2);
            stock.setPurchaseStatus(2);
        }
        stock.setUpdateTime(LocalDateTime.now());
        stockMapper.updateById(stock);

        recordStockFlow(stock, "OUT", quantity, beforeQty, afterQty,
                "PO" + orderId, "PRODUCTION", "生产领料");
    }

    private void recordStockFlow(MaterialStock stock, String flowType, BigDecimal changeQty,
                                 BigDecimal beforeQty, BigDecimal afterQty,
                                 String relatedNo, String relatedType, String remark) {
        StockFlow flow = new StockFlow();
        flow.setFlowNo(generateFlowNo());
        flow.setMaterialId(stock.getId());
        flow.setMaterialCode(stock.getMaterialCode());
        flow.setMaterialName(stock.getMaterialName());
        flow.setFlowType(flowType);
        flow.setBeforeQuantity(beforeQty);
        flow.setChangeQuantity(changeQty);
        flow.setAfterQuantity(afterQty);
        flow.setRelatedNo(relatedNo);
        flow.setRelatedType(relatedType);
        flow.setRemark(remark);
        flow.setOperatorId(UserContext.getCurrentUserId());
        flow.setOperatorName(UserContext.getCurrentUsername());
        flow.setCreateTime(LocalDateTime.now());
        flowMapper.insert(flow);
    }

    public Page<StockInbound> getInboundPage(Integer pageNum, Integer pageSize,
                                             String inboundNo, Long materialId, Integer status) {
        Page<StockInbound> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<StockInbound> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(inboundNo)) {
            wrapper.like(StockInbound::getInboundNo, inboundNo);
        }
        if (materialId != null) {
            wrapper.eq(StockInbound::getMaterialId, materialId);
        }
        if (status != null) {
            wrapper.eq(StockInbound::getStatus, status);
        }
        wrapper.orderByDesc(StockInbound::getCreateTime);
        return inboundMapper.selectPage(page, wrapper);
    }

    public Page<StockOutbound> getOutboundPage(Integer pageNum, Integer pageSize,
                                                String outboundNo, Long materialId, Integer status) {
        Page<StockOutbound> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<StockOutbound> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(outboundNo)) {
            wrapper.like(StockOutbound::getOutboundNo, outboundNo);
        }
        if (materialId != null) {
            wrapper.eq(StockOutbound::getMaterialId, materialId);
        }
        if (status != null) {
            wrapper.eq(StockOutbound::getStatus, status);
        }
        wrapper.orderByDesc(StockOutbound::getCreateTime);
        return outboundMapper.selectPage(page, wrapper);
    }

    public Page<StockFlow> getFlowPage(Integer pageNum, Integer pageSize,
                                        Long materialId, String flowType,
                                        LocalDateTime startTime, LocalDateTime endTime) {
        Page<StockFlow> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<StockFlow> wrapper = new LambdaQueryWrapper<>();
        if (materialId != null) {
            wrapper.eq(StockFlow::getMaterialId, materialId);
        }
        if (StringUtils.hasText(flowType)) {
            wrapper.eq(StockFlow::getFlowType, flowType);
        }
        if (startTime != null) {
            wrapper.ge(StockFlow::getCreateTime, startTime);
        }
        if (endTime != null) {
            wrapper.le(StockFlow::getCreateTime, endTime);
        }
        wrapper.orderByDesc(StockFlow::getCreateTime);
        return flowMapper.selectPage(page, wrapper);
    }

    public List<StockFlow> getMaterialFlow(Long materialId) {
        return flowMapper.selectList(new LambdaQueryWrapper<StockFlow>()
                .eq(StockFlow::getMaterialId, materialId)
                .orderByDesc(StockFlow::getCreateTime)
                .last("LIMIT 50"));
    }

    private String generateInboundNo() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String key = "inbound:no:" + date;
        Long increment = redisTemplate.opsForValue().increment(key, 1);
        redisTemplate.expire(key, 1, TimeUnit.DAYS);
        return "IN" + date + String.format("%04d", increment);
    }

    private String generateOutboundNo() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String key = "outbound:no:" + date;
        Long increment = redisTemplate.opsForValue().increment(key, 1);
        redisTemplate.expire(key, 1, TimeUnit.DAYS);
        return "OUT" + date + String.format("%04d", increment);
    }

    private String generateFlowNo() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String key = "flow:no:" + date;
        Long increment = redisTemplate.opsForValue().increment(key, 1);
        redisTemplate.expire(key, 1, TimeUnit.DAYS);
        return "FL" + date + String.format("%06d", increment);
    }

    private String generateBatchNo(String materialType) {
        String prefix = materialType != null ? materialType.substring(0, 2).toUpperCase() : "MT";
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String key = "batch:no:" + prefix + date;
        Long increment = redisTemplate.opsForValue().increment(key, 1);
        redisTemplate.expire(key, 1, TimeUnit.DAYS);
        return prefix + date + String.format("%04d", increment);
    }
}
