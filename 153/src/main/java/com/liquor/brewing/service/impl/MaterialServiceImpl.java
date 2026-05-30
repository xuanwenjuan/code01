package com.liquor.brewing.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.liquor.brewing.common.Constants;
import com.liquor.brewing.common.PageQuery;
import com.liquor.brewing.dto.MaterialQueryDTO;
import com.liquor.brewing.entity.Material;
import com.liquor.brewing.entity.MaterialBatch;
import com.liquor.brewing.exception.BusinessException;
import com.liquor.brewing.mapper.MaterialBatchMapper;
import com.liquor.brewing.mapper.MaterialMapper;
import com.liquor.brewing.mapper.MaterialStockRecordMapper;
import com.liquor.brewing.service.MaterialService;
import com.liquor.brewing.util.CodeGenerator;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class MaterialServiceImpl extends ServiceImpl<MaterialMapper, Material> implements MaterialService {

    @Resource
    private CodeGenerator codeGenerator;

    @Resource
    private MaterialBatchMapper materialBatchMapper;

    @Resource
    private MaterialStockRecordMapper stockRecordMapper;

    @Value("${liquor.warn-expire-days:30}")
    private Integer warnExpireDays;

    @Override
    public IPage<Material> page(String keyword, Long typeId, Integer status, PageQuery pageQuery) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(Material::getMaterialName, keyword)
                    .or().like(Material::getMaterialCode, keyword));
        }
        if (typeId != null) {
            wrapper.eq(Material::getTypeId, typeId);
        }
        if (status != null) {
            wrapper.eq(Material::getStatus, status);
        }
        wrapper.orderByDesc(Material::getCreateTime);
        return baseMapper.selectMaterialPage(new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()), wrapper);
    }

    @Override
    public IPage<Material> pageByCondition(MaterialQueryDTO query, PageQuery pageQuery) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(query.getKeyword())) {
            wrapper.and(w -> w.like(Material::getMaterialName, query.getKeyword())
                    .or().like(Material::getMaterialCode, query.getKeyword()));
        }
        if (StrUtil.isNotBlank(query.getMaterialCode())) {
            wrapper.like(Material::getMaterialCode, query.getMaterialCode());
        }
        if (StrUtil.isNotBlank(query.getMaterialName())) {
            wrapper.like(Material::getMaterialName, query.getMaterialName());
        }
        if (query.getTypeId() != null) {
            wrapper.eq(Material::getTypeId, query.getTypeId());
        }
        if (query.getStatus() != null) {
            wrapper.eq(Material::getStatus, query.getStatus());
        }
        if (StrUtil.isNotBlank(query.getUnit())) {
            wrapper.eq(Material::getUnit, query.getUnit());
        }
        if (query.getIsFermented() != null) {
            wrapper.eq(Material::getIsFermented, query.getIsFermented());
        }
        if (query.getMinQuantity() != null) {
            wrapper.apply("IFNULL((SELECT SUM(quantity) FROM material_batch WHERE material_id = m.id AND status = 1 AND deleted = 0), 0) >= {0}", query.getMinQuantity());
        }
        if (query.getMaxQuantity() != null) {
            wrapper.apply("IFNULL((SELECT SUM(quantity) FROM material_batch WHERE material_id = m.id AND status = 1 AND deleted = 0), 0) <= {0}", query.getMaxQuantity());
        }
        if (query.getMinShelfLifeDays() != null) {
            wrapper.ge(Material::getShelfLifeDays, query.getMinShelfLifeDays());
        }
        if (query.getMaxShelfLifeDays() != null) {
            wrapper.le(Material::getShelfLifeDays, query.getMaxShelfLifeDays());
        }
        if (query.getMinWarningStock() != null) {
            wrapper.ge(Material::getWarningStock, query.getMinWarningStock());
        }
        if (query.getMaxWarningStock() != null) {
            wrapper.le(Material::getWarningStock, query.getMaxWarningStock());
        }
        wrapper.orderByDesc(Material::getCreateTime);
        return baseMapper.selectMaterialPage(new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()), wrapper);
    }

    @Override
    public void add(Material material) {
        material.setMaterialCode(codeGenerator.generateMaterialCode());
        material.setStatus(Constants.MaterialStatus.NORMAL);
        save(material);
    }

    @Override
    public void update(Material material) {
        Material exist = getById(material.getId());
        if (exist == null) {
            throw new BusinessException("物料不存在");
        }
        updateById(material);
    }

    @Override
    public void delete(Long id) {
        Long count = materialBatchMapper.selectCount(new LambdaQueryWrapper<MaterialBatch>()
                .eq(MaterialBatch::getMaterialId, id));
        if (count > 0) {
            throw new BusinessException("该物料存在库存批次，无法删除");
        }
        removeById(id);
    }

    @Override
    public void updateStatus(Long id, Integer status) {
        Material material = new Material();
        material.setId(id);
        material.setStatus(status);
        updateById(material);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void stockIn(MaterialBatch batch) {
        Material material = getById(batch.getMaterialId());
        if (material == null) {
            throw new BusinessException("物料不存在");
        }
        if (Constants.MaterialStatus.STOPPED.equals(material.getStatus())) {
            throw new BusinessException("该物料已停止采购，无法入库");
        }
        batch.setBatchCode(codeGenerator.generateBatchCode());
        batch.setStatus(Constants.Status.ENABLE);
        if (batch.getUnitPrice() != null && batch.getQuantity() != null) {
            batch.setTotalPrice(batch.getUnitPrice().multiply(batch.getQuantity()));
        }
        materialBatchMapper.insert(batch);

        com.liquor.brewing.entity.MaterialStockRecord record = new com.liquor.brewing.entity.MaterialStockRecord();
        record.setRecordNo(codeGenerator.generateBatchCode());
        record.setBatchId(batch.getId());
        record.setMaterialId(batch.getMaterialId());
        record.setRecordType(1);
        record.setQuantity(batch.getQuantity());
        record.setUnitPrice(batch.getUnitPrice());
        record.setTotalPrice(batch.getTotalPrice());
        record.setWorkOrderId(null);
        record.setRemark("物料入库");
        stockRecordMapper.insert(record);

        updateMaterialStatus(batch.getMaterialId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void stockOut(Long batchId, BigDecimal quantity, Long workOrderId, String remark) {
        MaterialBatch batch = materialBatchMapper.selectById(batchId);
        if (batch == null) {
            throw new BusinessException("批次不存在");
        }
        if (batch.getQuantity().compareTo(quantity) < 0) {
            throw new BusinessException("库存不足");
        }
        if (batch.getExpireDate() != null && batch.getExpireDate().isBefore(LocalDate.now())) {
            throw new BusinessException("物料已过期");
        }

        BigDecimal remaining = batch.getQuantity().subtract(quantity);
        if (remaining.compareTo(BigDecimal.ZERO) == 0) {
            batch.setStatus(Constants.Status.DISABLE);
        }
        batch.setQuantity(remaining);
        materialBatchMapper.updateById(batch);

        com.liquor.brewing.entity.MaterialStockRecord record = new com.liquor.brewing.entity.MaterialStockRecord();
        record.setRecordNo(codeGenerator.generateBatchCode());
        record.setBatchId(batchId);
        record.setMaterialId(batch.getMaterialId());
        record.setRecordType(2);
        record.setQuantity(quantity);
        record.setUnitPrice(batch.getUnitPrice());
        record.setTotalPrice(batch.getUnitPrice() != null ? batch.getUnitPrice().multiply(quantity) : null);
        record.setWorkOrderId(workOrderId);
        record.setRemark(remark != null ? remark : "物料出库");
        stockRecordMapper.insert(record);

        updateMaterialStatus(batch.getMaterialId());
    }

    private void updateMaterialStatus(Long materialId) {
        Material material = getById(materialId);
        if (material == null || Constants.MaterialStatus.STOPPED.equals(material.getStatus())) {
            return;
        }
        BigDecimal totalStock = baseMapper.getTotalStock(materialId);
        if (material.getWarningStock() != null && totalStock.compareTo(material.getWarningStock()) <= 0) {
            material.setStatus(Constants.MaterialStatus.WARNING);
        } else {
            material.setStatus(Constants.MaterialStatus.NORMAL);
        }
        updateById(material);
    }

    @Override
    public List<MaterialBatch> getExpireWarning() {
        LocalDate warnDate = LocalDate.now().plusDays(warnExpireDays);
        List<MaterialBatch> batches = materialBatchMapper.selectList(new LambdaQueryWrapper<MaterialBatch>()
                .eq(MaterialBatch::getStatus, Constants.Status.ENABLE)
                .isNotNull(MaterialBatch::getExpireDate)
                .le(MaterialBatch::getExpireDate, warnDate)
                .ge(MaterialBatch::getExpireDate, LocalDate.now())
                .gt(MaterialBatch::getQuantity, BigDecimal.ZERO)
                .orderByAsc(MaterialBatch::getExpireDate));

        for (MaterialBatch batch : batches) {
            if (batch.getExpireDate() != null) {
                batch.setDaysToExpire((int) ChronoUnit.DAYS.between(LocalDate.now(), batch.getExpireDate()));
            }
        }
        return batches;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchUpdateStatus(List<Long> ids, Integer status) {
        for (Long id : ids) {
            Material material = new Material();
            material.setId(id);
            material.setStatus(status);
            updateById(material);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchDelete(List<Long> ids) {
        for (Long id : ids) {
            delete(id);
        }
    }
}
