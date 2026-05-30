package com.textile.production.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.textile.production.common.Result;
import com.textile.production.common.ResultCode;
import com.textile.production.dto.MaterialQueryDTO;
import com.textile.production.dto.RawMaterialDTO;
import com.textile.production.entity.RawMaterial;
import com.textile.production.entity.RawMaterialBatch;
import com.textile.production.exception.BusinessException;
import com.textile.production.mapper.RawMaterialMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RawMaterialService extends ServiceImpl<RawMaterialMapper, RawMaterial> {

    private final RawMaterialBatchService batchService;

    public Result<RawMaterial> addMaterial(RawMaterialDTO dto) {
        LambdaQueryWrapper<RawMaterial> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RawMaterial::getName, dto.getName())
                .eq(RawMaterial::getSpecification, dto.getSpecification());
        if (exists(wrapper)) {
            throw new BusinessException(ResultCode.DATA_ALREADY_EXIST.getCode(), "该原料已存在");
        }

        RawMaterial material = new RawMaterial();
        material.setName(dto.getName());
        material.setType(dto.getType());
        material.setSpecification(dto.getSpecification());
        material.setUnit(dto.getUnit());
        material.setTotalQuantity(dto.getTotalQuantity());
        material.setWarningQuantity(dto.getWarningQuantity());
        material.setMoistureProof(dto.getMoistureProof());
        material.setStatus(calculateStatus(dto.getTotalQuantity(), dto.getWarningQuantity()));
        material.setDescription(dto.getDescription());
        save(material);

        return Result.success("添加成功", material);
    }

    public Result<RawMaterial> updateMaterial(RawMaterialDTO dto) {
        RawMaterial material = getById(dto.getId());
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        LambdaQueryWrapper<RawMaterial> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RawMaterial::getName, dto.getName())
                .eq(RawMaterial::getSpecification, dto.getSpecification())
                .ne(RawMaterial::getId, dto.getId());
        if (exists(wrapper)) {
            throw new BusinessException(ResultCode.DATA_ALREADY_EXIST.getCode(), "该原料已存在");
        }

        material.setName(dto.getName());
        material.setType(dto.getType());
        material.setSpecification(dto.getSpecification());
        material.setUnit(dto.getUnit());
        material.setWarningQuantity(dto.getWarningQuantity());
        material.setMoistureProof(dto.getMoistureProof());
        material.setStatus(calculateStatus(material.getTotalQuantity(), dto.getWarningQuantity()));
        material.setDescription(dto.getDescription());
        updateById(material);

        return Result.success("更新成功", material);
    }

    public Result<Void> deleteMaterial(Long id) {
        RawMaterial material = getById(id);
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        LambdaQueryWrapper<RawMaterialBatch> batchWrapper = new LambdaQueryWrapper<>();
        batchWrapper.eq(RawMaterialBatch::getMaterialId, id)
                .eq(RawMaterialBatch::getStatus, 1);
        if (batchService.exists(batchWrapper)) {
            throw new BusinessException(ResultCode.DATA_IN_USE.getCode(), "该原料存在在库批次，无法删除");
        }

        removeById(id);
        return Result.success("删除成功");
    }

    public Result<IPage<RawMaterial>> getPage(Integer pageNum, Integer pageSize, String type, String status, String keyword) {
        LambdaQueryWrapper<RawMaterial> wrapper = new LambdaQueryWrapper<>();
        if (type != null && !type.isEmpty()) {
            wrapper.eq(RawMaterial::getType, type);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(RawMaterial::getStatus, status);
        }
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(RawMaterial::getName, keyword)
                    .or()
                    .like(RawMaterial::getSpecification, keyword);
        }
        wrapper.orderByDesc(RawMaterial::getCreateTime);

        Page<RawMaterial> page = new Page<>(pageNum, pageSize);
        return Result.success(page(page, wrapper));
    }

    public Result<List<RawMaterial>> getList(String type) {
        LambdaQueryWrapper<RawMaterial> wrapper = new LambdaQueryWrapper<>();
        if (type != null && !type.isEmpty()) {
            wrapper.eq(RawMaterial::getType, type);
        }
        wrapper.orderByAsc(RawMaterial::getName);
        return Result.success(list(wrapper));
    }

    @Transactional(rollbackFor = Exception.class)
    public void addStock(Long materialId, BigDecimal quantity) {
        RawMaterial material = getById(materialId);
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        material.setTotalQuantity(material.getTotalQuantity().add(quantity));
        material.setStatus(calculateStatus(material.getTotalQuantity(), material.getWarningQuantity()));
        updateById(material);
    }

    @Transactional(rollbackFor = Exception.class)
    public void reduceStock(Long materialId, BigDecimal quantity) {
        RawMaterial material = getById(materialId);
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (material.getTotalQuantity().compareTo(quantity) < 0) {
            throw new BusinessException(ResultCode.STOCK_NOT_ENOUGH);
        }
        material.setTotalQuantity(material.getTotalQuantity().subtract(quantity));
        material.setStatus(calculateStatus(material.getTotalQuantity(), material.getWarningQuantity()));
        updateById(material);
    }

    public String calculateStatus(BigDecimal totalQuantity, BigDecimal warningQuantity) {
        if (totalQuantity.compareTo(BigDecimal.ZERO) <= 0) {
            return "STOP";
        } else if (totalQuantity.compareTo(warningQuantity) <= 0) {
            return "WARNING";
        }
        return "NORMAL";
    }

    public Result<List<RawMaterial>> getWarningList() {
        LambdaQueryWrapper<RawMaterial> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(RawMaterial::getStatus, "WARNING", "STOP")
                .orderByDesc(RawMaterial::getStatus)
                .orderByAsc(RawMaterial::getName);
        return Result.success(list(wrapper));
    }

    public Result<List<RawMaterial>> getMaterialWithAvailableBatches(String type, String status, String keyword) {
        return Result.success(baseMapper.getMaterialWithAvailableBatches(type, status, keyword));
    }

    public Result<List<Map<String, Object>>> getMaterialStockStatistics() {
        return Result.success(baseMapper.getMaterialStockStatistics());
    }

    public Result<List<Map<String, Object>>> getBatchUsageStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        return Result.success(baseMapper.getBatchUsageStatistics(startDate, endDate));
    }

    public Result<IPage<RawMaterial>> queryMaterials(MaterialQueryDTO query) {
        LambdaQueryWrapper<RawMaterial> wrapper = new LambdaQueryWrapper<>();

        if (query.getType() != null && !query.getType().isEmpty()) {
            wrapper.eq(RawMaterial::getType, query.getType());
        }
        if (query.getStatus() != null && !query.getStatus().isEmpty()) {
            wrapper.eq(RawMaterial::getStatus, query.getStatus());
        }
        if (query.getKeyword() != null && !query.getKeyword().isEmpty()) {
            wrapper.and(w -> w.like(RawMaterial::getName, query.getKeyword())
                    .or()
                    .like(RawMaterial::getSpecification, query.getKeyword());
        }
        if (query.getMoistureProof() != null) {
            wrapper.eq(RawMaterial::getMoistureProof, query.getMoistureProof());
        }
        if (query.getMinQuantity() != null) {
            wrapper.ge(RawMaterial::getTotalQuantity, query.getMinQuantity());
        }
        if (query.getMaxQuantity() != null) {
            wrapper.le(RawMaterial::getTotalQuantity, query.getMaxQuantity());
        }

        if (query.getOrderBy() != null && !query.getOrderBy().isEmpty()) {
            boolean isAsc = "asc".equalsIgnoreCase(query.getOrderDir());
            if ("name".equals(query.getOrderBy())) {
                wrapper.orderBy(true, isAsc, RawMaterial::getName);
            } else if ("totalQuantity".equals(query.getOrderBy())) {
                wrapper.orderBy(true, isAsc, RawMaterial::getTotalQuantity);
            } else if ("createTime".equals(query.getOrderBy())) {
                wrapper.orderBy(true, isAsc, RawMaterial::getCreateTime);
            } else {
                wrapper.orderByDesc(RawMaterial::getCreateTime);
            }
        } else {
            wrapper.orderByDesc(RawMaterial::getCreateTime);
        }

        Page<RawMaterial> page = new Page<>(query.getPageNum(), query.getPageSize());
        return Result.success(page(page, wrapper));
    }
}
