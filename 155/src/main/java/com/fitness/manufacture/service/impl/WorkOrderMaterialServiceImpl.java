package com.fitness.manufacture.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fitness.manufacture.common.BusinessException;
import com.fitness.manufacture.common.ResultCode;
import com.fitness.manufacture.entity.ProductBom;
import com.fitness.manufacture.entity.WorkOrder;
import com.fitness.manufacture.entity.WorkOrderMaterial;
import com.fitness.manufacture.mapper.ProductBomMapper;
import com.fitness.manufacture.mapper.WorkOrderMapper;
import com.fitness.manufacture.mapper.WorkOrderMaterialMapper;
import com.fitness.manufacture.service.WorkOrderMaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkOrderMaterialServiceImpl extends ServiceImpl<WorkOrderMaterialMapper, WorkOrderMaterial> implements WorkOrderMaterialService {

    private final WorkOrderMaterialMapper workOrderMaterialMapper;
    private final WorkOrderMapper workOrderMapper;
    private final ProductBomMapper productBomMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void allocateMaterials(Long workOrderId) {
        WorkOrder workOrder = workOrderMapper.selectById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        LambdaQueryWrapper<ProductBom> bomWrapper = new LambdaQueryWrapper<>();
        bomWrapper.eq(ProductBom::getProductId, workOrder.getProductId());
        List<ProductBom> boms = productBomMapper.selectList(bomWrapper);

        for (ProductBom bom : boms) {
            WorkOrderMaterial wom = new WorkOrderMaterial();
            wom.setWorkOrderId(workOrderId);
            wom.setMaterialId(bom.getMaterialId());
            wom.setMaterialName(bom.getMaterialName());
            wom.setPlannedQuantity(bom.getQuantity().multiply(new BigDecimal(workOrder.getPlanQuantity())));
            wom.setActualQuantity(BigDecimal.ZERO);
            wom.setStatus(0);
            workOrderMaterialMapper.insert(wom);
        }
    }

    @Override
    public List<WorkOrderMaterial> getMaterialsByWorkOrderId(Long workOrderId) {
        LambdaQueryWrapper<WorkOrderMaterial> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrderMaterial::getWorkOrderId, workOrderId);
        return workOrderMaterialMapper.selectList(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void pickMaterial(Long id) {
        WorkOrderMaterial wom = workOrderMaterialMapper.selectById(id);
        if (wom == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (wom.getStatus() != 0) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "物料状态不正确");
        }

        wom.setStatus(1);
        wom.setActualQuantity(wom.getPlannedQuantity());
        wom.setTotalAmount(wom.getPlannedQuantity().multiply(wom.getUnitPrice() != null ? wom.getUnitPrice() : BigDecimal.ZERO));
        wom.setOutboundTime(LocalDateTime.now());
        workOrderMaterialMapper.updateById(wom);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void returnMaterial(Long id) {
        WorkOrderMaterial wom = workOrderMaterialMapper.selectById(id);
        if (wom == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (wom.getStatus() != 1) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "物料未领用");
        }

        wom.setStatus(2);
        wom.setActualQuantity(BigDecimal.ZERO);
        wom.setTotalAmount(BigDecimal.ZERO);
        workOrderMaterialMapper.updateById(wom);
    }
}
