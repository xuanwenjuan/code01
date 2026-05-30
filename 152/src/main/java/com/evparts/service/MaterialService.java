package com.evparts.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.evparts.common.PageResult;
import com.evparts.common.ResultCode;
import com.evparts.dto.*;
import com.evparts.entity.Material;
import com.evparts.entity.MaterialStock;
import com.evparts.entity.WorkOrderMaterial;
import com.evparts.exception.BusinessException;
import com.evparts.mapper.MaterialMapper;
import com.evparts.mapper.MaterialStockMapper;
import com.evparts.mapper.WorkOrderMaterialMapper;
import com.evparts.utils.CodeGenerator;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class MaterialService {

    @Autowired
    private MaterialMapper materialMapper;

    @Autowired
    private MaterialStockMapper materialStockMapper;

    @Autowired
    private WorkOrderMaterialMapper workOrderMaterialMapper;

    @Autowired
    private CodeGenerator codeGenerator;

    public PageResult<Material> getPage(MaterialQueryDTO queryDTO) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        if (queryDTO.getMaterialName() != null && !queryDTO.getMaterialName().isEmpty()) {
            wrapper.like(Material::getMaterialName, queryDTO.getMaterialName());
        }
        if (queryDTO.getMaterialCode() != null && !queryDTO.getMaterialCode().isEmpty()) {
            wrapper.like(Material::getMaterialCode, queryDTO.getMaterialCode());
        }
        if (queryDTO.getMaterialType() != null && !queryDTO.getMaterialType().isEmpty()) {
            wrapper.eq(Material::getMaterialType, queryDTO.getMaterialType());
        }
        if (queryDTO.getStatus() != null) {
            wrapper.eq(Material::getStatus, queryDTO.getStatus());
        }
        wrapper.orderByDesc(Material::getCreateTime);

        IPage<Material> page = materialMapper.selectPage(queryDTO.toPage(), wrapper);
        for (Material material : page.getRecords()) {
            BigDecimal totalStock = materialStockMapper.getTotalStockByMaterialId(material.getId());
            material.setTotalStock(totalStock);
        }
        return PageResult.of(page);
    }

    public List<Material> getList() {
        return materialMapper.selectList(
                new LambdaQueryWrapper<Material>()
                        .eq(Material::getStatus, 1)
                        .orderByDesc(Material::getCreateTime)
        );
    }

    public Material getById(Long id) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException(ResultCode.MATERIAL_NOT_EXIST);
        }
        BigDecimal totalStock = materialStockMapper.getTotalStockByMaterialId(id);
        material.setTotalStock(totalStock);
        return material;
    }

    @Transactional(rollbackFor = Exception.class)
    public void add(MaterialDTO dto) {
        Long count = materialMapper.selectCount(
                new LambdaQueryWrapper<Material>()
                        .eq(Material::getMaterialCode, dto.getMaterialCode())
        );
        if (count > 0) {
            throw new BusinessException(ResultCode.MATERIAL_CODE_EXIST);
        }
        Material material = new Material();
        BeanUtils.copyProperties(dto, material);
        materialMapper.insert(material);
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(MaterialDTO dto) {
        Material material = materialMapper.selectById(dto.getId());
        if (material == null) {
            throw new BusinessException(ResultCode.MATERIAL_NOT_EXIST);
        }
        if (!material.getMaterialCode().equals(dto.getMaterialCode())) {
            Long count = materialMapper.selectCount(
                    new LambdaQueryWrapper<Material>()
                            .eq(Material::getMaterialCode, dto.getMaterialCode())
            );
            if (count > 0) {
                throw new BusinessException(ResultCode.MATERIAL_CODE_EXIST);
            }
        }
        BeanUtils.copyProperties(dto, material);
        materialMapper.updateById(material);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStatus(Long id, Integer status) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException(ResultCode.MATERIAL_NOT_EXIST);
        }
        material.setStatus(status);
        materialMapper.updateById(material);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException(ResultCode.MATERIAL_NOT_EXIST);
        }
        materialMapper.deleteById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void stockIn(MaterialStockInDTO dto) {
        Material material = materialMapper.selectById(dto.getMaterialId());
        if (material == null) {
            throw new BusinessException(ResultCode.MATERIAL_NOT_EXIST);
        }

        String batchNo = codeGenerator.generateBatchNo("BATCH");

        MaterialStock stock = new MaterialStock();
        stock.setMaterialId(dto.getMaterialId());
        stock.setBatchNo(batchNo);
        stock.setQuantity(dto.getQuantity());
        stock.setUnitPrice(dto.getUnitPrice());
        stock.setWarehouse(dto.getWarehouse());
        stock.setInboundDate(dto.getInboundDate());
        stock.setExpiryDate(dto.getExpiryDate());
        stock.setStockStatus(1);
        if (material.getMoistureProof() == 1) {
            stock.setMoistureCheckTime(LocalDateTime.now());
        }
        stock.setRemark(dto.getRemark());

        materialStockMapper.insert(stock);
    }

    public PageResult<MaterialStock> getStockDetailPage(Integer pageNum, Integer pageSize,
                                                        String materialName, String materialCode,
                                                        String materialType, Integer stockStatus,
                                                        String warehouse, Boolean moistureWarning) {
        Page<MaterialStock> page = new Page<>(pageNum, pageSize);
        IPage<MaterialStock> resultPage = materialStockMapper.getStockDetailPage(
                page, materialName, materialCode, materialType, stockStatus, warehouse, moistureWarning
        );
        return PageResult.of(resultPage);
    }

    public List<MaterialStock> getAvailableStock(Long materialId) {
        return materialStockMapper.getStockByMaterialId(materialId);
    }

    public List<MaterialStock> getMoistureWarningList() {
        return materialStockMapper.selectList(
                new LambdaQueryWrapper<MaterialStock>()
                        .eq(MaterialStock::getStockStatus, 1)
                        .apply("moisture_check_time < DATE_SUB(NOW(), INTERVAL 7 DAY)")
                        .orderByAsc(MaterialStock::getMoistureCheckTime)
        );
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateMoistureCheckTime(Long stockId) {
        MaterialStock stock = materialStockMapper.selectById(stockId);
        if (stock == null) {
            throw new BusinessException(ResultCode.STOCK_NOT_EXIST);
        }
        stock.setMoistureCheckTime(LocalDateTime.now());
        materialStockMapper.updateById(stock);
    }

    @Transactional(rollbackFor = Exception.class)
    public void stockOut(MaterialStockOutDTO dto) {
        MaterialStock stock = materialStockMapper.selectById(dto.getStockId());
        if (stock == null) {
            throw new BusinessException(ResultCode.STOCK_NOT_EXIST);
        }
        if (stock.getQuantity().compareTo(dto.getQuantity()) < 0) {
            throw new BusinessException(ResultCode.STOCK_INSUFFICIENT);
        }
        if (stock.getStockStatus() == 3) {
            throw new BusinessException("该批次已过期，无法出库");
        }

        WorkOrderMaterial orderMaterial = workOrderMaterialMapper.selectOne(
                new LambdaQueryWrapper<WorkOrderMaterial>()
                        .eq(WorkOrderMaterial::getWorkOrderId, dto.getWorkOrderId())
                        .eq(WorkOrderMaterial::getMaterialId, dto.getMaterialId())
        );

        if (orderMaterial == null) {
            throw new BusinessException("该工单未分配此原料，请先添加工单用料计划");
        }

        materialStockMapper.updateStockQuantity(dto.getStockId(), dto.getQuantity().negate());

        orderMaterial.setActualQuantity(orderMaterial.getActualQuantity().add(dto.getQuantity()));
        orderMaterial.setMaterialStockId(dto.getStockId());
        if (stock.getUnitPrice() != null) {
            orderMaterial.setUnitPrice(stock.getUnitPrice());
            orderMaterial.setTotalPrice(orderMaterial.getActualQuantity().multiply(stock.getUnitPrice()));
        }
        workOrderMaterialMapper.updateById(orderMaterial);
    }

    @Transactional(rollbackFor = Exception.class)
    public void stockReturn(MaterialStockReturnDTO dto) {
        WorkOrderMaterial orderMaterial = workOrderMaterialMapper.selectById(dto.getWorkOrderMaterialId());
        if (orderMaterial == null) {
            throw new BusinessException("工单用料记录不存在");
        }
        if (orderMaterial.getActualQuantity().compareTo(dto.getQuantity()) < 0) {
            throw new BusinessException("退料数量不能大于实际领料数量");
        }

        orderMaterial.setActualQuantity(orderMaterial.getActualQuantity().subtract(dto.getQuantity()));
        if (orderMaterial.getUnitPrice() != null) {
            orderMaterial.setTotalPrice(orderMaterial.getActualQuantity().multiply(orderMaterial.getUnitPrice()));
        }
        workOrderMaterialMapper.updateById(orderMaterial);

        if (orderMaterial.getMaterialStockId() != null) {
            materialStockMapper.updateStockQuantity(orderMaterial.getMaterialStockId(), dto.getQuantity());
        } else {
            MaterialStock stock = new MaterialStock();
            stock.setMaterialId(orderMaterial.getMaterialId());
            stock.setBatchNo(codeGenerator.generateBatchNo("RET"));
            stock.setQuantity(dto.getQuantity());
            stock.setUnitPrice(orderMaterial.getUnitPrice());
            stock.setWarehouse("退回仓");
            stock.setInboundDate(java.time.LocalDate.now());
            stock.setStockStatus(1);
            stock.setRemark("工单退料：" + dto.getRemark());
            materialStockMapper.insert(stock);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void stockTransfer(MaterialStockTransferDTO dto) {
        MaterialStock fromStock = materialStockMapper.selectById(dto.getFromStockId());
        if (fromStock == null) {
            throw new BusinessException(ResultCode.STOCK_NOT_EXIST);
        }
        if (fromStock.getQuantity().compareTo(dto.getQuantity()) < 0) {
            throw new BusinessException(ResultCode.STOCK_INSUFFICIENT);
        }

        materialStockMapper.updateStockQuantity(dto.getFromStockId(), dto.getQuantity().negate());

        MaterialStock toStock = new MaterialStock();
        toStock.setMaterialId(fromStock.getMaterialId());
        toStock.setBatchNo(codeGenerator.generateBatchNo("TRN"));
        toStock.setQuantity(dto.getQuantity());
        toStock.setUnitPrice(fromStock.getUnitPrice());
        toStock.setWarehouse(dto.getToWarehouse());
        toStock.setInboundDate(java.time.LocalDate.now());
        toStock.setExpiryDate(fromStock.getExpiryDate());
        toStock.setStockStatus(fromStock.getStockStatus());
        toStock.setMoistureCheckTime(fromStock.getMoistureCheckTime());
        toStock.setRemark("调拨来源：" + fromStock.getBatchNo() + "，" + dto.getRemark());
        materialStockMapper.insert(toStock);
    }

    public List<Map<String, Object>> getStockSummary() {
        return materialStockMapper.getStockSummary();
    }

}
