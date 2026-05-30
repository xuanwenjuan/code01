package com.cosmetics.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cosmetics.common.PageQuery;
import com.cosmetics.common.ResultCode;
import com.cosmetics.context.UserContext;
import com.cosmetics.dto.MaterialOutDTO;
import com.cosmetics.entity.Material;
import com.cosmetics.entity.MaterialBatch;
import com.cosmetics.entity.MaterialInOutLog;
import com.cosmetics.entity.User;
import com.cosmetics.exception.BusinessException;
import com.cosmetics.mapper.MaterialBatchMapper;
import com.cosmetics.mapper.MaterialInOutLogMapper;
import com.cosmetics.mapper.MaterialMapper;
import com.cosmetics.mapper.UserMapper;
import com.cosmetics.service.MaterialBatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MaterialBatchServiceImpl implements MaterialBatchService {

    private final MaterialBatchMapper batchMapper;
    private final MaterialMapper materialMapper;
    private final MaterialInOutLogMapper inOutLogMapper;
    private final UserMapper userMapper;

    @Override
    public Page<MaterialBatch> getPage(PageQuery pageQuery, Long materialId, Integer isExpired) {
        LambdaQueryWrapper<MaterialBatch> wrapper = new LambdaQueryWrapper<>();
        if (materialId != null) {
            wrapper.eq(MaterialBatch::getMaterialId, materialId);
        }
        if (isExpired != null) {
            wrapper.eq(MaterialBatch::getIsExpired, isExpired);
        }
        wrapper.orderByDesc(MaterialBatch::getCreateTime);

        return batchMapper.selectPage(
                new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()),
                wrapper
        );
    }

    @Override
    public MaterialBatch getById(Long id) {
        return batchMapper.selectById(id);
    }

    @Override
    public String generateBatchNo(Long materialId) {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        String prefix = "B" + dateStr;

        Long count = batchMapper.selectCount(
                new LambdaQueryWrapper<MaterialBatch>()
                        .likeRight(MaterialBatch::getBatchNo, prefix)
        );

        return String.format("%s%04d", prefix, count + 1);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void warehouseIn(MaterialBatch batch) {
        Material material = materialMapper.selectById(batch.getMaterialId());
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND.getCode(), "原料不存在");
        }

        if (batch.getBatchNo() == null || batch.getBatchNo().isEmpty()) {
            batch.setBatchNo(generateBatchNo(batch.getMaterialId()));
        }

        batch.setRemainingQuantity(batch.getQuantity());
        batch.setWarehouseTime(LocalDateTime.now());
        batch.setOperatorId(UserContext.getUserId());
        batch.setIsExpired(0);

        if (batch.getExpiryDate() != null && batch.getExpiryDate().isBefore(LocalDate.now())) {
            batch.setIsExpired(1);
        }

        batchMapper.insert(batch);

        updateMaterialStatus(batch.getMaterialId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateExpiredStatus() {
        List<MaterialBatch> batches = batchMapper.selectList(
                new LambdaQueryWrapper<MaterialBatch>()
                        .eq(MaterialBatch::getIsExpired, 0)
                        .le(MaterialBatch::getExpiryDate, LocalDate.now())
        );

        for (MaterialBatch batch : batches) {
            batch.setIsExpired(1);
            batchMapper.updateById(batch);
        }
    }

    @Override
    public List<MaterialBatch> getExpiringBatches(Integer days) {
        LocalDate warningDate = LocalDate.now().plusDays(days);
        return batchMapper.selectList(
                new LambdaQueryWrapper<MaterialBatch>()
                        .eq(MaterialBatch::getIsExpired, 0)
                        .le(MaterialBatch::getExpiryDate, warningDate)
                        .gt(MaterialBatch::getRemainingQuantity, BigDecimal.ZERO)
                        .orderByAsc(MaterialBatch::getExpiryDate)
        );
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void warehouseOut(MaterialOutDTO outDTO) {
        MaterialBatch batch = batchMapper.selectById(outDTO.getMaterialBatchId());
        if (batch == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND.getCode(), "原料批次不存在");
        }
        if (batch.getIsExpired() == 1) {
            throw new BusinessException("该批次原料已过期，无法出库");
        }
        if (batch.getRemainingQuantity().compareTo(outDTO.getQuantity()) < 0) {
            throw new BusinessException(ResultCode.INVENTORY_SHORTAGE);
        }

        BigDecimal beforeQuantity = batch.getRemainingQuantity();
        batch.setRemainingQuantity(batch.getRemainingQuantity().subtract(outDTO.getQuantity()));
        batchMapper.updateById(batch);

        saveInOutLog(batch.getMaterialId(), batch.getId(), 2, outDTO.getQuantity(),
                beforeQuantity, batch.getRemainingQuantity(), outDTO.getWorkOrderId(), outDTO.getRemark());

        updateMaterialStatus(batch.getMaterialId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchWarehouseOut(List<MaterialOutDTO> outDTOList) {
        for (MaterialOutDTO outDTO : outDTOList) {
            warehouseOut(outDTO);
        }
    }

    @Override
    public BigDecimal getTotalStock(Long materialId) {
        return batchMapper.selectList(
                        new LambdaQueryWrapper<MaterialBatch>()
                                .eq(MaterialBatch::getMaterialId, materialId)
                                .eq(MaterialBatch::getIsExpired, 0)
                ).stream()
                .map(MaterialBatch::getRemainingQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public Map<String, Object> getStockSummary() {
        Map<String, Object> summary = new HashMap<>();

        Long totalMaterials = materialMapper.selectCount(new LambdaQueryWrapper<>());
        Long warningCount = materialMapper.selectCount(
                new LambdaQueryWrapper<Material>().eq(Material::getStatus, 2)
        );
        Long suspendCount = materialMapper.selectCount(
                new LambdaQueryWrapper<Material>().eq(Material::getStatus, 3)
        );
        Long expiringCount = (long) getExpiringBatches(30).size();

        summary.put("totalMaterials", totalMaterials);
        summary.put("warningCount", warningCount);
        summary.put("suspendCount", suspendCount);
        summary.put("expiringCount", expiringCount);

        return summary;
    }

    @Override
    public Page<MaterialInOutLog> getInOutLogPage(PageQuery pageQuery, Long materialId, Integer type) {
        LambdaQueryWrapper<MaterialInOutLog> wrapper = new LambdaQueryWrapper<>();
        if (materialId != null) {
            wrapper.eq(MaterialInOutLog::getMaterialId, materialId);
        }
        if (type != null) {
            wrapper.eq(MaterialInOutLog::getType, type);
        }
        wrapper.orderByDesc(MaterialInOutLog::getCreateTime);

        return inOutLogMapper.selectPage(
                new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()),
                wrapper
        );
    }

    @Override
    public List<MaterialBatch> getAvailableBatches(Long materialId) {
        return batchMapper.selectList(
                new LambdaQueryWrapper<MaterialBatch>()
                        .eq(MaterialBatch::getMaterialId, materialId)
                        .eq(MaterialBatch::getIsExpired, 0)
                        .gt(MaterialBatch::getRemainingQuantity, BigDecimal.ZERO)
                        .orderByAsc(MaterialBatch::getExpiryDate)
        );
    }

    private void updateMaterialStatus(Long materialId) {
        BigDecimal totalStock = getTotalStock(materialId);
        Material material = materialMapper.selectById(materialId);
        if (material != null) {
            int status = 1;
            if (totalStock.compareTo(BigDecimal.ZERO) <= 0) {
                status = 3;
            } else if (totalStock.compareTo(material.getWarningStock()) <= 0) {
                status = 2;
            }
            if (material.getStatus() != status) {
                material.setStatus(status);
                materialMapper.updateById(material);
            }
        }
    }

    private void saveInOutLog(Long materialId, Long materialBatchId, Integer type, BigDecimal quantity,
                              BigDecimal beforeQuantity, BigDecimal afterQuantity, Long workOrderId, String remark) {
        MaterialInOutLog log = new MaterialInOutLog();
        log.setMaterialId(materialId);
        log.setMaterialBatchId(materialBatchId);
        log.setType(type);
        log.setQuantity(quantity);
        log.setBeforeQuantity(beforeQuantity);
        log.setAfterQuantity(afterQuantity);
        log.setWorkOrderId(workOrderId);
        log.setOperatorId(UserContext.getUserId());

        User user = userMapper.selectById(UserContext.getUserId());
        if (user != null) {
            log.setOperatorName(user.getRealName());
        }
        log.setRemark(remark);
        inOutLogMapper.insert(log);
    }
}
