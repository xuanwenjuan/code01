package com.household.management.service;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.household.management.common.entity.PageQuery;
import com.household.management.common.exception.BusinessException;
import com.household.management.common.result.ResultCode;
import com.household.management.entity.RawMaterial;
import com.household.management.entity.RawMaterialInbound;
import com.household.management.entity.RawMaterialStock;
import com.household.management.mapper.RawMaterialInboundMapper;
import com.household.management.mapper.RawMaterialMapper;
import com.household.management.mapper.RawMaterialStockMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class RawMaterialInboundService {

    private final RawMaterialInboundMapper inboundMapper;
    private final RawMaterialMapper materialMapper;
    private final RawMaterialStockMapper stockMapper;

    public RawMaterialInboundService(RawMaterialInboundMapper inboundMapper,
                                     RawMaterialMapper materialMapper,
                                     RawMaterialStockMapper stockMapper) {
        this.inboundMapper = inboundMapper;
        this.materialMapper = materialMapper;
        this.stockMapper = stockMapper;
    }

    public IPage<RawMaterialInbound> page(PageQuery pageQuery, Integer status, Long materialId) {
        LambdaQueryWrapper<RawMaterialInbound> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(RawMaterialInbound::getStatus, status);
        }
        if (materialId != null) {
            wrapper.eq(RawMaterialInbound::getMaterialId, materialId);
        }
        wrapper.orderByDesc(RawMaterialInbound::getCreateTime);
        return inboundMapper.selectPage(new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()), wrapper);
    }

    public List<RawMaterialInbound> list() {
        return inboundMapper.selectInboundList();
    }

    public RawMaterialInbound getById(Long id) {
        RawMaterialInbound inbound = inboundMapper.selectInboundDetail(id);
        if (inbound == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        return inbound;
    }

    @Transactional(rollbackFor = Exception.class)
    public void createInbound(RawMaterialInbound inbound) {
        RawMaterial material = materialMapper.selectById(inbound.getMaterialId());
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        String inboundNo = generateInboundNo();
        inbound.setInboundNo(inboundNo);
        inbound.setTotalAmount(inbound.getUnitPrice().multiply(inbound.getQuantity()));
        inbound.setStatus(1);
        inboundMapper.insert(inbound);

        log.info("创建原料入库单：{} - {}", inboundNo, material.getMaterialName());
    }

    @Transactional(rollbackFor = Exception.class)
    public void auditInbound(Long id, Long auditorId, boolean passed, String remark) {
        RawMaterialInbound inbound = inboundMapper.selectById(id);
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

            RawMaterialStock stock = new RawMaterialStock();
            stock.setMaterialId(inbound.getMaterialId());
            String batchNo = generateBatchNo(inbound.getMaterialId());
            stock.setBatchNo(batchNo);
            stock.setQuantity(inbound.getQuantity());
            stock.setUnitPrice(inbound.getUnitPrice());
            stock.setTotalAmount(inbound.getTotalAmount());
            stock.setProductionDate(inbound.getProductionDate());
            stock.setExpirationDate(inbound.getExpirationDate());
            stock.setWarehouseLocation(inbound.getWarehouseLocation());
            stock.setStatus(1);
            stockMapper.insert(stock);

            updateMaterialStatus(inbound.getMaterialId());

            log.info("原料入库单审核通过：{}，批次号：{}", inbound.getInboundNo(), batchNo);
        } else {
            inbound.setStatus(3);
            inboundMapper.updateById(inbound);
            log.info("原料入库单审核驳回：{}，原因：{}", inbound.getInboundNo(), remark);
        }
    }

    private void updateMaterialStatus(Long materialId) {
        RawMaterial material = materialMapper.selectMaterialWithStockById(materialId);
        if (material != null) {
            BigDecimal currentStock = material.getCurrentStock() != null ? material.getCurrentStock() : BigDecimal.ZERO;
            if (material.getStatus() == 3) {
                return;
            }
            if (currentStock.compareTo(material.getWarnStock()) <= 0) {
                material.setStatus(2);
            } else {
                material.setStatus(1);
            }
            materialMapper.updateById(material);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateInbound(RawMaterialInbound inbound) {
        RawMaterialInbound existing = inboundMapper.selectById(inbound.getId());
        if (existing == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (existing.getStatus() != 1) {
            throw new BusinessException("只有待审核的入库单才能修改");
        }
        if (inbound.getQuantity() != null && inbound.getUnitPrice() != null) {
            inbound.setTotalAmount(inbound.getUnitPrice().multiply(inbound.getQuantity()));
        }
        inboundMapper.updateById(inbound);
        log.info("更新原料入库单：{}", existing.getInboundNo());
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteInbound(Long id) {
        RawMaterialInbound inbound = inboundMapper.selectById(id);
        if (inbound == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (inbound.getStatus() == 2) {
            throw new BusinessException("已入库的单据无法删除");
        }
        inboundMapper.deleteById(id);
        log.info("删除原料入库单：{}", inbound.getInboundNo());
    }

    private String generateInboundNo() {
        String dateStr = DateUtil.format(DateUtil.date(), "yyyyMMdd");
        String uuid = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "RMI" + dateStr + uuid;
    }

    private String generateBatchNo(Long materialId) {
        RawMaterial material = materialMapper.selectById(materialId);
        String materialCode = material != null ? material.getMaterialCode() : "MAT";
        String dateStr = DateUtil.format(DateUtil.date(), "yyyyMMdd");
        String uuid = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return materialCode + "-" + dateStr + "-" + uuid;
    }
}
