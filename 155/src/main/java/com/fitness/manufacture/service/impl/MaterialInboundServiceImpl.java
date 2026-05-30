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
import com.fitness.manufacture.dto.MaterialInboundDTO;
import com.fitness.manufacture.dto.MaterialInboundQueryDTO;
import com.fitness.manufacture.entity.Material;
import com.fitness.manufacture.entity.MaterialBatch;
import com.fitness.manufacture.entity.MaterialInbound;
import com.fitness.manufacture.mapper.MaterialBatchMapper;
import com.fitness.manufacture.mapper.MaterialInboundMapper;
import com.fitness.manufacture.mapper.MaterialMapper;
import com.fitness.manufacture.service.MaterialBatchService;
import com.fitness.manufacture.service.MaterialInboundService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class MaterialInboundServiceImpl extends ServiceImpl<MaterialInboundMapper, MaterialInbound> implements MaterialInboundService {

    private final MaterialInboundMapper materialInboundMapper;
    private final MaterialMapper materialMapper;
    private final MaterialBatchMapper materialBatchMapper;
    private final MaterialBatchService materialBatchService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveInbound(MaterialInboundDTO dto) {
        Material material = materialMapper.selectById(dto.getMaterialId());
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "物料不存在");
        }

        MaterialInbound inbound = new MaterialInbound();
        BeanUtils.copyProperties(dto, inbound);
        inbound.setInboundNo(generateInboundNo());
        inbound.setMaterialName(material.getMaterialName());
        inbound.setTotalAmount(dto.getQuantity().multiply(dto.getUnitPrice()));
        inbound.setStatus(0);
        materialInboundMapper.insert(inbound);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void auditInbound(Long id, Integer status, String remark) {
        MaterialInbound inbound = materialInboundMapper.selectById(id);
        if (inbound == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (inbound.getStatus() != 0) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "该入库单已审核，请勿重复操作");
        }

        inbound.setStatus(status);
        inbound.setAuditTime(LocalDateTime.now());
        inbound.setRemark(remark);
        materialInboundMapper.updateById(inbound);

        if (status == 1) {
            String batchNo = materialBatchService.generateBatchNo();
            MaterialBatch batch = new MaterialBatch();
            batch.setBatchNo(batchNo);
            batch.setMaterialId(inbound.getMaterialId());
            batch.setMaterialName(inbound.getMaterialName());
            batch.setQuantity(inbound.getQuantity());
            batch.setUnitPrice(inbound.getUnitPrice());
            batch.setProductionDate(inbound.getProductionDate());
            batch.setExpiryDate(inbound.getExpiryDate());
            batch.setWarehouseLocation(inbound.getWarehouseLocation());
            batch.setStatus(1);
            materialBatchMapper.insert(batch);

            Material material = materialMapper.selectById(inbound.getMaterialId());
            material.setStockQuantity(material.getStockQuantity().add(inbound.getQuantity()));
            if (material.getStatus() == 2 && material.getStockQuantity().compareTo(material.getWarningQuantity()) > 0) {
                material.setStatus(1);
            }
            materialMapper.updateById(material);
        }
    }

    @Override
    public IPage<MaterialInbound> getInboundPage(PageQuery query, Long materialId, Integer status) {
        LambdaQueryWrapper<MaterialInbound> wrapper = new LambdaQueryWrapper<>();
        if (materialId != null) {
            wrapper.eq(MaterialInbound::getMaterialId, materialId);
        }
        if (status != null) {
            wrapper.eq(MaterialInbound::getStatus, status);
        }
        wrapper.orderByDesc(MaterialInbound::getCreateTime);

        Page<MaterialInbound> page = new Page<>(query.getPageNum(), query.getPageSize());
        return materialInboundMapper.selectPage(page, wrapper);
    }

    @Override
    public String generateInboundNo() {
        String prefix = "IN" + DateUtil.format(LocalDateTime.now(), "yyyyMMdd");
        LambdaQueryWrapper<MaterialInbound> wrapper = new LambdaQueryWrapper<>();
        wrapper.likeRight(MaterialInbound::getInboundNo, prefix);
        wrapper.orderByDesc(MaterialInbound::getInboundNo);
        wrapper.last("limit 1");
        MaterialInbound last = materialInboundMapper.selectOne(wrapper);

        int sequence = 1;
        if (last != null) {
            String lastNo = last.getInboundNo();
            sequence = Integer.parseInt(lastNo.substring(lastNo.length() - 4)) + 1;
        }
        return prefix + String.format("%04d", sequence);
    }

    @Override
    public IPage<MaterialInbound> getInboundPageByConditions(MaterialInboundQueryDTO queryDTO) {
        LambdaQueryWrapper<MaterialInbound> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(MaterialInbound::getMaterialName, queryDTO.getKeyword())
                    .or().like(MaterialInbound::getInboundNo, queryDTO.getKeyword())
                    .or().like(MaterialInbound::getSupplier, queryDTO.getKeyword()));
        }
        if (queryDTO.getMaterialId() != null) {
            wrapper.eq(MaterialInbound::getMaterialId, queryDTO.getMaterialId());
        }
        if (StringUtils.hasText(queryDTO.getMaterialType())) {
            wrapper.eq(MaterialInbound::getMaterialType, queryDTO.getMaterialType());
        }
        if (queryDTO.getStatus() != null) {
            wrapper.eq(MaterialInbound::getStatus, queryDTO.getStatus());
        }
        if (StringUtils.hasText(queryDTO.getSupplier())) {
            wrapper.like(MaterialInbound::getSupplier, queryDTO.getSupplier());
        }
        if (queryDTO.getMinQuantity() != null) {
            wrapper.ge(MaterialInbound::getQuantity, queryDTO.getMinQuantity());
        }
        if (queryDTO.getMaxQuantity() != null) {
            wrapper.le(MaterialInbound::getQuantity, queryDTO.getMaxQuantity());
        }
        if (queryDTO.getMinAmount() != null) {
            wrapper.ge(MaterialInbound::getTotalAmount, queryDTO.getMinAmount());
        }
        if (queryDTO.getMaxAmount() != null) {
            wrapper.le(MaterialInbound::getTotalAmount, queryDTO.getMaxAmount());
        }
        if (queryDTO.getStartDate() != null) {
            wrapper.ge(MaterialInbound::getCreateTime, queryDTO.getStartDate().atStartOfDay());
        }
        if (queryDTO.getEndDate() != null) {
            wrapper.le(MaterialInbound::getCreateTime, queryDTO.getEndDate().atTime(23, 59, 59));
        }
        if (StringUtils.hasText(queryDTO.getBatchNo())) {
            wrapper.like(MaterialInbound::getRemark, queryDTO.getBatchNo());
        }

        Page<MaterialInbound> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());

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

        return materialInboundMapper.selectPage(page, wrapper);
    }
}
