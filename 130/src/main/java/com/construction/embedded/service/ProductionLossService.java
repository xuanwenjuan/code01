package com.construction.embedded.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.construction.embedded.dto.DefectHandleDTO;
import com.construction.embedded.entity.Material;
import com.construction.embedded.entity.OrderMaterialDetail;
import com.construction.embedded.entity.ProductionLossRecord;
import com.construction.embedded.entity.ProductionOrder;
import com.construction.embedded.exception.BusinessException;
import com.construction.embedded.mapper.OrderMaterialDetailMapper;
import com.construction.embedded.mapper.ProductionLossRecordMapper;
import com.construction.embedded.mapper.ProductionOrderMapper;
import com.construction.embedded.util.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductionLossService {

    @Autowired
    private ProductionLossRecordMapper productionLossRecordMapper;

    @Autowired
    private ProductionOrderMapper productionOrderMapper;

    @Autowired
    private OrderMaterialDetailMapper orderMaterialDetailMapper;

    @Autowired
    private MaterialService materialService;

    @Autowired
    private ProductionLogService productionLogService;

    @Transactional(rollbackFor = Exception.class)
    public void handleDefect(DefectHandleDTO dto) {
        ProductionOrder order = productionOrderMapper.selectById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        LambdaQueryWrapper<OrderMaterialDetail> detailWrapper = new LambdaQueryWrapper<>();
        detailWrapper.eq(OrderMaterialDetail::getOrderId, dto.getOrderId());
        List<OrderMaterialDetail> materialDetails = orderMaterialDetailMapper.selectList(detailWrapper);

        if (materialDetails.isEmpty()) {
            throw new BusinessException("该工单没有用料明细");
        }

        int planQuantity = order.getPlanQuantity() != null ? order.getPlanQuantity() : 1;
        BigDecimal defectRatio = new BigDecimal(dto.getDefectQuantity()).divide(new BigDecimal(planQuantity), 4, BigDecimal.ROUND_HALF_UP);

        for (OrderMaterialDetail detail : materialDetails) {
            BigDecimal material = materialService.getById(detail.getMaterialId());
            if (material == null) {
                continue;
            }

            BigDecimal lossQuantity = detail.getUsedQuantity().multiply(defectRatio);
            BigDecimal lossCost = lossQuantity.multiply(material.getUnitPrice() != null ? material.getUnitPrice() : BigDecimal.ZERO);

            ProductionLossRecord lossRecord = new ProductionLossRecord();
            lossRecord.setOrderId(dto.getOrderId());
            lossRecord.setOrderNo(order.getOrderNo());
            lossRecord.setMaterialId(detail.getMaterialId());
            lossRecord.setMaterialName(detail.getMaterialName());
            lossRecord.setSpecification(detail.getSpecification());
            lossRecord.setLossType(dto.getHandleType());
            lossRecord.setLossQuantity(lossQuantity);
            lossRecord.setUnitPrice(material.getUnitPrice());
            lossRecord.setTotalLossCost(lossCost);
            lossRecord.setOperatorId(UserContext.getUserId());
            lossRecord.setOperatorName(UserContext.getUsername());
            lossRecord.setRemark(dto.getRemark());
            productionLossRecordMapper.insert(lossRecord);
        }

        int currentDefective = order.getDefectiveQuantity() != null ? order.getDefectiveQuantity() : 0;
        order.setDefectiveQuantity(currentDefective + dto.getDefectQuantity());
        productionOrderMapper.updateById(order);

        productionLogService.saveLog(dto.getOrderId(), "DEFECT_HANDLE",
            "次品处理：" + dto.getHandleType() + "，数量：" + dto.getDefectQuantity(),
            null, null);
    }

    @Transactional(rollbackFor = Exception.class)
    public void collectLossOnCompletion(Long orderId) {
        ProductionOrder order = productionOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        LambdaQueryWrapper<OrderMaterialDetail> detailWrapper = new LambdaQueryWrapper<>();
        detailWrapper.eq(OrderMaterialDetail::getOrderId, orderId);
        List<OrderMaterialDetail> materialDetails = orderMaterialDetailMapper.selectList(detailWrapper);

        int defectiveQuantity = order.getDefectiveQuantity() != null ? order.getDefectiveQuantity() : 0;
        if (defectiveQuantity == 0) {
            return;
        }

        int planQuantity = order.getPlanQuantity() != null ? order.getPlanQuantity() : 1;
        BigDecimal defectRatio = new BigDecimal(defectiveQuantity).divide(new BigDecimal(planQuantity), 4, BigDecimal.ROUND_HALF_UP);

        for (OrderMaterialDetail detail : materialDetails) {
            BigDecimal existingLoss = getExistingLoss(orderId, detail.getMaterialId());
            if (existingLoss.compareTo(BigDecimal.ZERO) > 0) {
                continue;
            }

            Material material = materialService.getById(detail.getMaterialId());
            if (material == null) {
                continue;
            }

            BigDecimal lossQuantity = detail.getWasteQuantity() != null ? 
                detail.getWasteQuantity() : detail.getUsedQuantity().multiply(defectRatio);
            BigDecimal lossCost = lossQuantity.multiply(material.getUnitPrice() != null ? material.getUnitPrice() : BigDecimal.ZERO);

            ProductionLossRecord lossRecord = new ProductionLossRecord();
            lossRecord.setOrderId(orderId);
            lossRecord.setOrderNo(order.getOrderNo());
            lossRecord.setMaterialId(detail.getMaterialId());
            lossRecord.setMaterialName(detail.getMaterialName());
            lossRecord.setSpecification(detail.getSpecification());
            lossRecord.setLossType("PRODUCTION_WASTE");
            lossRecord.setLossQuantity(lossQuantity);
            lossRecord.setUnitPrice(material.getUnitPrice());
            lossRecord.setTotalLossCost(lossCost);
            lossRecord.setOperatorId(UserContext.getUserId());
            lossRecord.setOperatorName(UserContext.getUsername());
            lossRecord.setRemark("成品完工自动归集损耗");
            productionLossRecordMapper.insert(lossRecord);
        }

        productionLogService.saveLog(orderId, "LOSS_COLLECT",
            "成品完工自动归集生产损耗",
            null, null);
    }

    private BigDecimal getExistingLoss(Long orderId, Long materialId) {
        LambdaQueryWrapper<ProductionLossRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionLossRecord::getOrderId, orderId)
               .eq(ProductionLossRecord::getMaterialId, materialId);
        List<ProductionLossRecord> existingRecords = productionLossRecordMapper.selectList(wrapper);
        
        return existingRecords.stream()
            .map(ProductionLossRecord::getLossQuantity)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getOrderTotalLossCost(Long orderId) {
        LambdaQueryWrapper<ProductionLossRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionLossRecord::getOrderId, orderId);
        List<ProductionLossRecord> lossRecords = productionLossRecordMapper.selectList(wrapper);
        
        return lossRecords.stream()
            .map(record -> record.getTotalLossCost() != null ? record.getTotalLossCost() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public IPage<ProductionLossRecord> queryPage(Long orderId, String lossType, Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<ProductionLossRecord> wrapper = new LambdaQueryWrapper<>();
        if (orderId != null) {
            wrapper.eq(ProductionLossRecord::getOrderId, orderId);
        }
        if (lossType != null && !lossType.isEmpty()) {
            wrapper.eq(ProductionLossRecord::getLossType, lossType);
        }
        wrapper.orderByDesc(ProductionLossRecord::getCreateTime);
        return productionLossRecordMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    public ProductionLossRecord getById(Long id) {
        return productionLossRecordMapper.selectById(id);
    }
}
