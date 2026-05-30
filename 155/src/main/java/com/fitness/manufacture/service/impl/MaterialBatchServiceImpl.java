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
import com.fitness.manufacture.dto.MaterialBatchQueryDTO;
import com.fitness.manufacture.entity.MaterialBatch;
import com.fitness.manufacture.entity.StockWarning;
import com.fitness.manufacture.mapper.MaterialBatchMapper;
import com.fitness.manufacture.mapper.StockWarningMapper;
import com.fitness.manufacture.service.MaterialBatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialBatchServiceImpl extends ServiceImpl<MaterialBatchMapper, MaterialBatch> implements MaterialBatchService {

    private final MaterialBatchMapper materialBatchMapper;
    private final StockWarningMapper stockWarningMapper;

    @Override
    public IPage<MaterialBatch> getBatchPage(PageQuery query, Long materialId, Integer status) {
        LambdaQueryWrapper<MaterialBatch> wrapper = new LambdaQueryWrapper<>();
        if (materialId != null) {
            wrapper.eq(MaterialBatch::getMaterialId, materialId);
        }
        if (status != null) {
            wrapper.eq(MaterialBatch::getStatus, status);
        }
        wrapper.orderByDesc(MaterialBatch::getCreateTime);

        Page<MaterialBatch> page = new Page<>(query.getPageNum(), query.getPageSize());
        return materialBatchMapper.selectPage(page, wrapper);
    }

    @Override
    public List<MaterialBatch> getAvailableBatches(Long materialId) {
        LambdaQueryWrapper<MaterialBatch> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialBatch::getMaterialId, materialId);
        wrapper.eq(MaterialBatch::getStatus, 1);
        wrapper.gt(MaterialBatch::getQuantity, 0);
        wrapper.orderByAsc(MaterialBatch::getExpiryDate);
        return materialBatchMapper.selectList(wrapper);
    }

    @Override
    public String generateBatchNo() {
        String prefix = "B" + DateUtil.format(LocalDateTime.now(), "yyyyMMdd");
        LambdaQueryWrapper<MaterialBatch> wrapper = new LambdaQueryWrapper<>();
        wrapper.likeRight(MaterialBatch::getBatchNo, prefix);
        wrapper.orderByDesc(MaterialBatch::getBatchNo);
        wrapper.last("limit 1");
        MaterialBatch last = materialBatchMapper.selectOne(wrapper);

        int sequence = 1;
        if (last != null) {
            String lastNo = last.getBatchNo();
            sequence = Integer.parseInt(lastNo.substring(lastNo.length() - 4)) + 1;
        }
        return prefix + String.format("%04d", sequence);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void checkExpiryWarning() {
        LocalDate today = LocalDate.now();
        LocalDate warningDate = today.plusDays(30);

        LambdaQueryWrapper<MaterialBatch> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialBatch::getStatus, 1);
        wrapper.gt(MaterialBatch::getQuantity, 0);
        wrapper.isNotNull(MaterialBatch::getExpiryDate);
        wrapper.le(MaterialBatch::getExpiryDate, warningDate);
        var batches = materialBatchMapper.selectList(wrapper);

        for (MaterialBatch batch : batches) {
            long daysToExpiry = ChronoUnit.DAYS.between(today, batch.getExpiryDate());

            StockWarning warning = new StockWarning();
            warning.setMaterialId(batch.getMaterialId());
            warning.setMaterialName(batch.getMaterialName());
            warning.setBatchNo(batch.getBatchNo());
            warning.setCurrentQuantity(batch.getQuantity());
            warning.setExpiryDate(batch.getExpiryDate());
            warning.setDaysToExpiry((int) daysToExpiry);
            warning.setStatus(0);
            warning.setCreateTime(LocalDateTime.now());

            if (daysToExpiry <= 0) {
                warning.setWarningType("已过期");
                batch.setStatus(3);
            } else {
                warning.setWarningType("即将过期");
                batch.setStatus(2);
            }

            stockWarningMapper.insert(warning);
            materialBatchMapper.updateById(batch);
        }
    }

    @Override
    public IPage<MaterialBatch> getBatchPageByConditions(MaterialBatchQueryDTO queryDTO) {
        LambdaQueryWrapper<MaterialBatch> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(MaterialBatch::getMaterialName, queryDTO.getKeyword())
                    .or().like(MaterialBatch::getBatchNo, queryDTO.getKeyword()));
        }
        if (queryDTO.getMaterialId() != null) {
            wrapper.eq(MaterialBatch::getMaterialId, queryDTO.getMaterialId());
        }
        if (StringUtils.hasText(queryDTO.getBatchNo())) {
            wrapper.like(MaterialBatch::getBatchNo, queryDTO.getBatchNo());
        }
        if (queryDTO.getStatus() != null) {
            wrapper.eq(MaterialBatch::getStatus, queryDTO.getStatus());
        }
        if (StringUtils.hasText(queryDTO.getWarehouseLocation())) {
            wrapper.like(MaterialBatch::getWarehouseLocation, queryDTO.getWarehouseLocation());
        }
        if (queryDTO.getMinQuantity() != null) {
            wrapper.ge(MaterialBatch::getQuantity, queryDTO.getMinQuantity());
        }
        if (queryDTO.getMaxQuantity() != null) {
            wrapper.le(MaterialBatch::getQuantity, queryDTO.getMaxQuantity());
        }
        if (queryDTO.getProductionStartDate() != null) {
            wrapper.ge(MaterialBatch::getProductionDate, queryDTO.getProductionStartDate());
        }
        if (queryDTO.getProductionEndDate() != null) {
            wrapper.le(MaterialBatch::getProductionDate, queryDTO.getProductionEndDate());
        }
        if (queryDTO.getExpiryStartDate() != null) {
            wrapper.ge(MaterialBatch::getExpiryDate, queryDTO.getExpiryStartDate());
        }
        if (queryDTO.getExpiryEndDate() != null) {
            wrapper.le(MaterialBatch::getExpiryDate, queryDTO.getExpiryEndDate());
        }
        if (queryDTO.getExpiryWarning() != null && queryDTO.getExpiryWarning() == 1) {
            LocalDate warningDate = LocalDate.now().plusDays(30);
            wrapper.le(MaterialBatch::getExpiryDate, warningDate);
            wrapper.gt(MaterialBatch::getQuantity, 0);
        }

        Page<MaterialBatch> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());

        if (StringUtils.hasText(queryDTO.getOrderBy())) {
            boolean isAsc = "asc".equalsIgnoreCase(queryDTO.getOrderDirection());
            switch (queryDTO.getOrderBy()) {
                case "quantity" ->
                        page.addOrder(isAsc ? OrderItem.asc("quantity") : OrderItem.desc("quantity"));
                case "productionDate" ->
                        page.addOrder(isAsc ? OrderItem.asc("production_date") : OrderItem.desc("production_date"));
                case "expiryDate" ->
                        page.addOrder(isAsc ? OrderItem.asc("expiry_date") : OrderItem.desc("expiry_date"));
                case "createTime" ->
                        page.addOrder(isAsc ? OrderItem.asc("create_time") : OrderItem.desc("create_time"));
                default -> page.addOrder(OrderItem.desc("create_time"));
            }
        } else {
            page.addOrder(OrderItem.asc("expiry_date"));
        }

        return materialBatchMapper.selectPage(page, wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateQuantity(Long batchId, BigDecimal quantity, int type) {
        MaterialBatch batch = materialBatchMapper.selectById(batchId);
        if (batch == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "批次不存在");
        }

        if (type == 1) {
            batch.setQuantity(batch.getQuantity().add(quantity));
        } else if (type == 2) {
            if (batch.getQuantity().compareTo(quantity) < 0) {
                throw new BusinessException(ResultCode.MATERIAL_NOT_ENOUGH, "批次库存不足");
            }
            batch.setQuantity(batch.getQuantity().subtract(quantity));
        }

        if (batch.getQuantity().compareTo(BigDecimal.ZERO) == 0) {
            batch.setStatus(0);
        }

        materialBatchMapper.updateById(batch);
    }
}
