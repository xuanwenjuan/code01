package com.fitness.manufacture.service.impl;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.metadata.OrderItem;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fitness.manufacture.common.BusinessException;
import com.fitness.manufacture.common.PageQuery;
import com.fitness.manufacture.common.ResultCode;
import com.fitness.manufacture.dto.MaterialOutboundDTO;
import com.fitness.manufacture.dto.MaterialOutboundQueryDTO;
import com.fitness.manufacture.entity.Material;
import com.fitness.manufacture.entity.MaterialBatch;
import com.fitness.manufacture.entity.MaterialOutbound;
import com.fitness.manufacture.mapper.MaterialBatchMapper;
import com.fitness.manufacture.mapper.MaterialMapper;
import com.fitness.manufacture.mapper.MaterialOutboundMapper;
import com.fitness.manufacture.service.MaterialBatchService;
import com.fitness.manufacture.service.MaterialOutboundService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialOutboundServiceImpl extends ServiceImpl<MaterialOutboundMapper, MaterialOutbound> implements MaterialOutboundService {

    private final MaterialOutboundMapper materialOutboundMapper;
    private final MaterialMapper materialMapper;
    private final MaterialBatchMapper materialBatchMapper;
    private final MaterialBatchService materialBatchService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveOutbound(MaterialOutboundDTO dto) {
        Material material = materialMapper.selectById(dto.getMaterialId());
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "物料不存在");
        }
        if (material.getStockQuantity().compareTo(dto.getQuantity()) < 0) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "库存不足");
        }

        MaterialOutbound outbound = new MaterialOutbound();
        BeanUtils.copyProperties(dto, outbound);
        outbound.setOutboundNo(generateOutboundNo());
        outbound.setMaterialName(material.getMaterialName());
        outbound.setUnitPrice(material.getUnitPrice());
        outbound.setTotalAmount(dto.getQuantity().multiply(material.getUnitPrice()));
        outbound.setStatus(0);
        materialOutboundMapper.insert(outbound);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void auditOutbound(Long id, Integer status, String remark) {
        MaterialOutbound outbound = materialOutboundMapper.selectById(id);
        if (outbound == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (outbound.getStatus() != 0) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "该出库单已审核，请勿重复操作");
        }

        outbound.setStatus(status);
        outbound.setAuditTime(LocalDateTime.now());
        outbound.setRemark(remark);
        materialOutboundMapper.updateById(outbound);

        if (status == 1) {
            Material material = materialMapper.selectById(outbound.getMaterialId());
            material.setStockQuantity(material.getStockQuantity().subtract(outbound.getQuantity()));
            if (material.getStockQuantity().compareTo(material.getWarningQuantity()) <= 0) {
                material.setStatus(2);
            }
            materialMapper.updateById(material);

            List<MaterialBatch> batches = materialBatchService.getAvailableBatches(outbound.getMaterialId());
            BigDecimal remain = outbound.getQuantity();
            for (MaterialBatch batch : batches) {
                if (remain.compareTo(BigDecimal.ZERO) <= 0) {
                    break;
                }
                if (batch.getQuantity().compareTo(remain) <= 0) {
                    remain = remain.subtract(batch.getQuantity());
                    batch.setQuantity(BigDecimal.ZERO);
                    batch.setStatus(0);
                } else {
                    batch.setQuantity(batch.getQuantity().subtract(remain));
                    remain = BigDecimal.ZERO;
                }
                materialBatchMapper.updateById(batch);
            }
        }
    }

    @Override
    public IPage<MaterialOutbound> getOutboundPage(PageQuery query, Long materialId, Long workOrderId, Integer status) {
        LambdaQueryWrapper<MaterialOutbound> wrapper = new LambdaQueryWrapper<>();
        if (materialId != null) {
            wrapper.eq(MaterialOutbound::getMaterialId, materialId);
        }
        if (workOrderId != null) {
            wrapper.eq(MaterialOutbound::getWorkOrderId, workOrderId);
        }
        if (status != null) {
            wrapper.eq(MaterialOutbound::getStatus, status);
        }
        wrapper.orderByDesc(MaterialOutbound::getCreateTime);

        Page<MaterialOutbound> page = new Page<>(query.getPageNum(), query.getPageSize());
        return materialOutboundMapper.selectPage(page, wrapper);
    }

    @Override
    public String generateOutboundNo() {
        String prefix = "OUT" + DateUtil.format(LocalDateTime.now(), "yyyyMMdd");
        LambdaQueryWrapper<MaterialOutbound> wrapper = new LambdaQueryWrapper<>();
        wrapper.likeRight(MaterialOutbound::getOutboundNo, prefix);
        wrapper.orderByDesc(MaterialOutbound::getOutboundNo);
        wrapper.last("limit 1");
        MaterialOutbound last = materialOutboundMapper.selectOne(wrapper);

        int sequence = 1;
        if (last != null) {
            String lastNo = last.getOutboundNo();
            sequence = Integer.parseInt(lastNo.substring(lastNo.length() - 4)) + 1;
        }
        return prefix + String.format("%04d", sequence);
    }

    @Override
    public IPage<MaterialOutbound> getOutboundPageByConditions(MaterialOutboundQueryDTO queryDTO) {
        LambdaQueryWrapper<MaterialOutbound> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(MaterialOutbound::getMaterialName, queryDTO.getKeyword())
                    .or().like(MaterialOutbound::getOutboundNo, queryDTO.getKeyword())
                    .or().like(MaterialOutbound::getReceiver, queryDTO.getKeyword()));
        }
        if (queryDTO.getMaterialId() != null) {
            wrapper.eq(MaterialOutbound::getMaterialId, queryDTO.getMaterialId());
        }
        if (queryDTO.getWorkOrderId() != null) {
            wrapper.eq(MaterialOutbound::getWorkOrderId, queryDTO.getWorkOrderId());
        }
        if (StringUtils.hasText(queryDTO.getMaterialType())) {
            wrapper.eq(MaterialOutbound::getMaterialType, queryDTO.getMaterialType());
        }
        if (queryDTO.getStatus() != null) {
            wrapper.eq(MaterialOutbound::getStatus, queryDTO.getStatus());
        }
        if (StringUtils.hasText(queryDTO.getOutboundType())) {
            wrapper.eq(MaterialOutbound::getOutboundType, queryDTO.getOutboundType());
        }
        if (StringUtils.hasText(queryDTO.getReceiver())) {
            wrapper.like(MaterialOutbound::getReceiver, queryDTO.getReceiver());
        }
        if (queryDTO.getMinQuantity() != null) {
            wrapper.ge(MaterialOutbound::getQuantity, queryDTO.getMinQuantity());
        }
        if (queryDTO.getMaxQuantity() != null) {
            wrapper.le(MaterialOutbound::getQuantity, queryDTO.getMaxQuantity());
        }
        if (queryDTO.getMinAmount() != null) {
            wrapper.ge(MaterialOutbound::getTotalAmount, queryDTO.getMinAmount());
        }
        if (queryDTO.getMaxAmount() != null) {
            wrapper.le(MaterialOutbound::getTotalAmount, queryDTO.getMaxAmount());
        }
        if (queryDTO.getStartDate() != null) {
            wrapper.ge(MaterialOutbound::getCreateTime, queryDTO.getStartDate().atStartOfDay());
        }
        if (queryDTO.getEndDate() != null) {
            wrapper.le(MaterialOutbound::getCreateTime, queryDTO.getEndDate().atTime(23, 59, 59));
        }
        if (StringUtils.hasText(queryDTO.getBatchNo())) {
            wrapper.like(MaterialOutbound::getRemark, queryDTO.getBatchNo());
        }

        Page<MaterialOutbound> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());

        if (StringUtils.hasText(queryDTO.getOrderBy())) {
            boolean isAsc = "asc".equalsIgnoreCase(queryDTO.getOrderDirection());
            switch (queryDTO.getOrderBy()) {
                case "quantity" ->
                        page.addOrder(isAsc ? OrderItem.asc("quantity") : OrderItem.desc("quantity"));
                case "totalAmount" ->
                        page.addOrder(isAsc ? OrderItem.asc("total_amount") : OrderItem.desc("total_amount"));
                case "createTime" ->
                        page.addOrder(isAsc ? OrderItem.asc("create_time") : OrderItem.desc("create_time"));
                case "auditTime" ->
                        page.addOrder(isAsc ? OrderItem.asc("audit_time") : OrderItem.desc("audit_time"));
                default -> page.addOrder(OrderItem.desc("create_time"));
            }
        } else {
            page.addOrder(OrderItem.desc("create_time"));
        }

        return materialOutboundMapper.selectPage(page, wrapper);
    }
}
