package com.household.management.service;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.household.management.common.entity.PageQuery;
import com.household.management.common.exception.BusinessException;
import com.household.management.common.result.ResultCode;
import com.household.management.entity.RawMaterial;
import com.household.management.entity.RawMaterialStock;
import com.household.management.mapper.RawMaterialMapper;
import com.household.management.mapper.RawMaterialStockMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class RawMaterialService {

    private final RawMaterialMapper materialMapper;
    private final RawMaterialStockMapper stockMapper;

    public RawMaterialService(RawMaterialMapper materialMapper, RawMaterialStockMapper stockMapper) {
        this.materialMapper = materialMapper;
        this.stockMapper = stockMapper;
    }

    public IPage<RawMaterial> page(PageQuery pageQuery, String materialType, String materialTexture, Integer status, String keyword) {
        IPage<RawMaterial> page = materialMapper.selectMaterialPageWithConditions(
                new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()),
                materialType, materialTexture, status, keyword);
        for (RawMaterial material : page.getRecords()) {
            updateMaterialStatus(material);
        }
        return page;
    }

    public List<RawMaterial> list() {
        List<RawMaterial> materials = materialMapper.selectMaterialListWithStock();
        for (RawMaterial material : materials) {
            updateMaterialStatus(material);
        }
        return materials;
    }

    public RawMaterial getById(Long id) {
        RawMaterial material = materialMapper.selectMaterialWithStockById(id);
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        updateMaterialStatus(material);
        return material;
    }

    private void updateMaterialStatus(RawMaterial material) {
        BigDecimal currentStock = material.getCurrentStock();
        if (currentStock == null) {
            currentStock = BigDecimal.ZERO;
        }
        if (material.getStatus() == 3) {
            return;
        }
        if (currentStock.compareTo(material.getWarnStock()) <= 0) {
            material.setStatus(2);
        } else {
            material.setStatus(1);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void add(RawMaterial material) {
        LambdaQueryWrapper<RawMaterial> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RawMaterial::getMaterialCode, material.getMaterialCode());
        if (materialMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("原料编码已存在");
        }
        materialMapper.insert(material);
        log.info("新增原材料：{}", material.getMaterialName());
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(RawMaterial material) {
        RawMaterial existing = materialMapper.selectById(material.getId());
        if (existing == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (!existing.getMaterialCode().equals(material.getMaterialCode())) {
            LambdaQueryWrapper<RawMaterial> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(RawMaterial::getMaterialCode, material.getMaterialCode());
            if (materialMapper.selectCount(wrapper) > 0) {
                throw new BusinessException("原料编码已存在");
            }
        }
        materialMapper.updateById(material);
        log.info("更新原材料：{}", material.getMaterialName());
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        RawMaterial material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        LambdaQueryWrapper<RawMaterialStock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RawMaterialStock::getMaterialId, id);
        if (stockMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("该原料存在库存记录，无法删除");
        }
        materialMapper.deleteById(id);
        log.info("删除原材料：{}", material.getMaterialName());
    }

    public void updateStatus(Long id, Integer status) {
        RawMaterial material = new RawMaterial();
        material.setId(id);
        material.setStatus(status);
        materialMapper.updateById(material);
        log.info("更新原材料状态：id={}, status={}", id, status);
    }

    public List<RawMaterialStock> getStockList() {
        List<RawMaterialStock> stockList = stockMapper.selectStockListWithMaterial();
        LocalDate today = LocalDate.now();
        for (RawMaterialStock stock : stockList) {
            if (stock.getExpirationDate() != null) {
                stock.setDaysToExpire(ChronoUnit.DAYS.between(today, stock.getExpirationDate()));
            }
        }
        return stockList;
    }

    public List<RawMaterialStock> getMoistureWarningList() {
        List<RawMaterialStock> stockList = stockMapper.selectMoistureWarningStock(30);
        LocalDate today = LocalDate.now();
        for (RawMaterialStock stock : stockList) {
            if (stock.getExpirationDate() != null) {
                stock.setDaysToExpire(ChronoUnit.DAYS.between(today, stock.getExpirationDate()));
            }
        }
        return stockList;
    }

    @Transactional(rollbackFor = Exception.class)
    public void stockIn(RawMaterialStock stock) {
        RawMaterial material = materialMapper.selectById(stock.getMaterialId());
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        String batchNo = generateBatchNo(material.getMaterialCode());
        stock.setBatchNo(batchNo);
        stock.setTotalAmount(stock.getUnitPrice().multiply(stock.getQuantity()));
        stock.setStatus(1);
        stockMapper.insert(stock);
        log.info("原料入库：{} - {} - {}", material.getMaterialName(), batchNo, stock.getQuantity());
    }

    private String generateBatchNo(String materialCode) {
        String dateStr = DateUtil.format(DateUtil.date(), "yyyyMMdd");
        String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return materialCode + "-" + dateStr + "-" + uuid;
    }
}
