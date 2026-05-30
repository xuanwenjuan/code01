package com.construction.material.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.construction.material.common.PageQuery;
import com.construction.material.common.PageResult;
import com.construction.material.common.UserContext;
import com.construction.material.dto.InventoryFlowQueryDTO;
import com.construction.material.entity.InventoryFlow;
import com.construction.material.mapper.InventoryFlowMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class InventoryFlowService {

    private final InventoryFlowMapper flowMapper;

    public void recordFlow(Long inventoryId, String materialName, String specification, String unit,
                           String batchNo, Integer flowType, BigDecimal beforeQuantity,
                           BigDecimal changeQuantity, BigDecimal unitPrice, String relatedOrderNo,
                           String warehouse, String remark) {
        String flowTypeName = getFlowTypeName(flowType);
        BigDecimal afterQuantity = beforeQuantity.add(changeQuantity);
        BigDecimal changeAmount = changeQuantity.multiply(unitPrice);

        InventoryFlow flow = InventoryFlow.builder()
                .inventoryId(inventoryId)
                .materialName(materialName)
                .specification(specification)
                .unit(unit)
                .batchNo(batchNo)
                .flowType(flowType)
                .flowTypeName(flowTypeName)
                .beforeQuantity(beforeQuantity)
                .changeQuantity(changeQuantity)
                .afterQuantity(afterQuantity)
                .unitPrice(unitPrice)
                .changeAmount(changeAmount)
                .relatedOrderNo(relatedOrderNo)
                .warehouse(warehouse)
                .operator(UserContext.getUsername())
                .remark(remark)
                .build();

        flowMapper.insert(flow);
    }

    public PageResult<InventoryFlow> getFlowPage(PageQuery pageQuery, InventoryFlowQueryDTO queryDTO) {
        LambdaQueryWrapper<InventoryFlow> wrapper = new LambdaQueryWrapper<>();

        if (queryDTO.getInventoryId() != null) {
            wrapper.eq(InventoryFlow::getInventoryId, queryDTO.getInventoryId());
        }
        if (StringUtils.hasText(queryDTO.getMaterialName())) {
            wrapper.like(InventoryFlow::getMaterialName, queryDTO.getMaterialName());
        }
        if (queryDTO.getFlowType() != null) {
            wrapper.eq(InventoryFlow::getFlowType, queryDTO.getFlowType());
        }
        if (StringUtils.hasText(queryDTO.getWarehouse())) {
            wrapper.eq(InventoryFlow::getWarehouse, queryDTO.getWarehouse());
        }
        if (queryDTO.getStartDate() != null) {
            wrapper.ge(InventoryFlow::getCreateTime, queryDTO.getStartDate());
        }
        if (queryDTO.getEndDate() != null) {
            wrapper.le(InventoryFlow::getCreateTime, queryDTO.getEndDate());
        }

        wrapper.orderByDesc(InventoryFlow::getCreateTime);

        Page<InventoryFlow> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());
        IPage<InventoryFlow> result = flowMapper.selectPage(page, wrapper);

        return new PageResult<>(result.getRecords(), result.getTotal(),
                (int) result.getCurrent(), (int) result.getSize());
    }

    private String getFlowTypeName(Integer flowType) {
        return switch (flowType) {
            case 1 -> "采购入库";
            case 2 -> "调拨入库";
            case 3 -> "盘盈入库";
            case 11 -> "领用出库";
            case 12 -> "调拨出库";
            case 13 -> "盘亏出库";
            case 14 -> "损耗出库";
            default -> "其他";
        };
    }
}
