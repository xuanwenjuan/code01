package com.fan.impeller.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fan.impeller.common.Constants;
import com.fan.impeller.common.PageQuery;
import com.fan.impeller.context.UserContext;
import com.fan.impeller.entity.Material;
import com.fan.impeller.entity.MaterialStockLog;
import com.fan.impeller.entity.PurchaseOrder;
import com.fan.impeller.exception.BusinessException;
import com.fan.impeller.mapper.MaterialStockLogMapper;
import com.fan.impeller.mapper.PurchaseOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService extends ServiceImpl<PurchaseOrderMapper, PurchaseOrder> {

    private final MaterialService materialService;
    private final MaterialStockLogMapper stockLogMapper;

    public Page<PurchaseOrder> page(PageQuery query, Integer status, String materialType) {
        return lambdaQuery()
                .eq(status != null, PurchaseOrder::getStatus, status)
                .eq(materialType != null, PurchaseOrder::getMaterialType, materialType)
                .orderByDesc(PurchaseOrder::getCreateTime)
                .page(new Page<>(query.getPageNum(), query.getPageSize()));
    }

    @Transactional(rollbackFor = Exception.class)
    public void createPurchaseOrder(PurchaseOrder order) {
        String orderNo = "PO" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        order.setOrderNo(orderNo);
        order.setStatus(1);
        order.setApplicantId(UserContext.getUserId());
        order.setApplicantName(UserContext.getUsername());
        if (order.getQuantity() != null && order.getUnitPrice() != null) {
            order.setTotalAmount(order.getQuantity().multiply(order.getUnitPrice()));
        }
        save(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void audit(Long id, Integer status, String remark) {
        PurchaseOrder order = getById(id);
        if (order == null) {
            throw new BusinessException("采购订单不存在");
        }
        if (order.getStatus() != 1) {
            throw new BusinessException("订单状态不正确，无法审核");
        }
        order.setStatus(status);
        order.setAuditorId(UserContext.getUserId());
        order.setAuditorName(UserContext.getUsername());
        order.setAuditTime(LocalDateTime.now());
        order.setRemark(remark);
        updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void stockIn(Long id) {
        PurchaseOrder order = getById(id);
        if (order == null) {
            throw new BusinessException("采购订单不存在");
        }
        if (order.getStatus() != 2) {
            throw new BusinessException("订单未通过审核，无法入库");
        }

        Material material = materialService.getById(order.getMaterialId());
        if (material == null) {
            throw new BusinessException("原料不存在");
        }

        BigDecimal beforeQuantity = material.getQuantity();
        BigDecimal afterQuantity = beforeQuantity.add(order.getQuantity());

        MaterialStockLog log = new MaterialStockLog();
        log.setMaterialId(material.getId());
        log.setMaterialName(material.getMaterialName());
        log.setBatchNo(material.getBatchNo());
        log.setType(1);
        log.setBeforeQuantity(beforeQuantity);
        log.setChangeQuantity(order.getQuantity());
        log.setAfterQuantity(afterQuantity);
        log.setOperatorId(UserContext.getUserId());
        log.setOperatorName(UserContext.getUsername());
        log.setPurchaseOrderId(order.getId());
        log.setPurchaseOrderNo(order.getOrderNo());
        log.setRemark("采购入库");
        stockLogMapper.insert(log);

        material.setQuantity(afterQuantity);
        materialService.updateMaterial(material);

        order.setStatus(3);
        updateById(order);
    }

    public void autoCreatePurchaseOrders() {
        materialService.list(new LambdaQueryWrapper<Material>()
                .eq(Material::getStockStatus, Constants.MATERIAL_STOCK_STOP)
                .eq(Material::getStatus, 1)).forEach(material -> {
            PurchaseOrder order = new PurchaseOrder();
            order.setMaterialId(material.getId());
            order.setMaterialName(material.getMaterialName());
            order.setMaterialType(material.getMaterialType());
            order.setQuantity(new BigDecimal("1000"));
            order.setUnit(material.getUnit());
            order.setUnitPrice(material.getUnitPrice());
            order.setSupplier(material.getSupplier());
            order.setRemark("系统自动生成采购订单");
            createPurchaseOrder(order);
        });
    }
}
