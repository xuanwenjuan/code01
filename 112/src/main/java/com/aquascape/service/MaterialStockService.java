package com.aquascape.service;

import com.aquascape.common.StockStatus;
import com.aquascape.dto.MaterialStockDTO;
import com.aquascape.dto.MaterialStockQueryDTO;
import com.aquascape.entity.MaterialCategory;
import com.aquascape.entity.MaterialStock;
import com.aquascape.exception.BusinessException;
import com.aquascape.mapper.MaterialCategoryMapper;
import com.aquascape.mapper.MaterialStockMapper;
import com.aquascape.vo.MaterialStockVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import cn.hutool.core.util.IdUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class MaterialStockService {

    @Autowired
    private MaterialStockMapper stockMapper;

    @Autowired
    private MaterialCategoryMapper categoryMapper;

    @Autowired
    private MaterialCategoryService categoryService;

    public Page<MaterialStockVO> queryByConditions(int page, int size, MaterialStockQueryDTO queryDTO) {
        LambdaQueryWrapper<MaterialStock> wrapper = new LambdaQueryWrapper<>();

        if (queryDTO.getKeyword() != null && !queryDTO.getKeyword().isEmpty()) {
            wrapper.and(w -> w.like(MaterialStock::getMaterialName, queryDTO.getKeyword())
                    .or().like(MaterialStock::getBatchNo, queryDTO.getKeyword()));
        }

        if (queryDTO.getCategoryId() != null) {
            wrapper.eq(MaterialStock::getCategoryId, queryDTO.getCategoryId());
        }

        if (queryDTO.getSizeSpec() != null && !queryDTO.getSizeSpec().isEmpty()) {
            wrapper.eq(MaterialStock::getSizeSpec, queryDTO.getSizeSpec());
        }

        if (queryDTO.getQualityLevel() != null && !queryDTO.getQualityLevel().isEmpty()) {
            wrapper.eq(MaterialStock::getQualityLevel, queryDTO.getQualityLevel());
        }

        if (queryDTO.getStockStatus() != null) {
            wrapper.eq(MaterialStock::getStockStatus, queryDTO.getStockStatus());
        }

        if (queryDTO.getOrigin() != null && !queryDTO.getOrigin().isEmpty()) {
            wrapper.eq(MaterialStock::getOrigin, queryDTO.getOrigin());
        }

        if (queryDTO.getStartExpiryDate() != null) {
            wrapper.ge(MaterialStock::getExpiryDate, queryDTO.getStartExpiryDate());
        }

        if (queryDTO.getEndExpiryDate() != null) {
            wrapper.le(MaterialStock::getExpiryDate, queryDTO.getEndExpiryDate());
        }

        wrapper.orderByDesc(MaterialStock::getCreateTime);

        Page<MaterialStock> pageResult = stockMapper.selectPage(new Page<>(page, size), wrapper);
        Page<MaterialStockVO> voPage = new Page<>(pageResult.getCurrent(), pageResult.getSize(), pageResult.getTotal());

        List<MaterialStockVO> voList = pageResult.getRecords().stream().map(stock -> {
            MaterialStockVO vo = new MaterialStockVO();
            BeanUtils.copyProperties(stock, vo);
            vo.setStockStatusName(StockStatus.getStatusName(stock.getStockStatus()));
            if (stock.getCategoryId() != null) {
                MaterialCategory category = categoryMapper.selectById(stock.getCategoryId());
                if (category != null) {
                    vo.setCategoryName(category.getCategoryName());
                }
            }
            return vo;
        }).toList();

        voPage.setRecords(voList);
        return voPage;
    }

    public Page<MaterialStock> page(int page, int size, String keyword, Long categoryId, Integer stockStatus) {
        LambdaQueryWrapper<MaterialStock> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(MaterialStock::getMaterialName, keyword)
                    .or().like(MaterialStock::getBatchNo, keyword);
        }
        if (categoryId != null) {
            wrapper.eq(MaterialStock::getCategoryId, categoryId);
        }
        if (stockStatus != null) {
            wrapper.eq(MaterialStock::getStockStatus, stockStatus);
        }
        wrapper.orderByDesc(MaterialStock::getCreateTime);

        Page<MaterialStock> pageResult = stockMapper.selectPage(new Page<>(page, size), wrapper);
        for (MaterialStock stock : pageResult.getRecords()) {
            if (stock.getCategoryId() != null) {
                MaterialCategory category = categoryMapper.selectById(stock.getCategoryId());
                if (category != null) {
                    stock.setCategoryName(category.getCategoryName());
                }
            }
        }
        return pageResult;
    }

    public List<MaterialStock> list() {
        List<MaterialStock> stocks = stockMapper.selectList(null);
        for (MaterialStock stock : stocks) {
            if (stock.getCategoryId() != null) {
                MaterialCategory category = categoryMapper.selectById(stock.getCategoryId());
                if (category != null) {
                    stock.setCategoryName(category.getCategoryName());
                }
            }
        }
        return stocks;
    }

    @Transactional(rollbackFor = Exception.class)
    public void create(MaterialStockDTO dto) {
        categoryService.validateCategoryAvailable(dto.getCategoryId());

        MaterialStock stock = new MaterialStock();
        BeanUtils.copyProperties(dto, stock);
        stock.setBatchNo("BATCH-" + IdUtil.getSnowflakeNextIdStr());
        calculateStockStatus(stock);
        if (dto.getQuantity() != null && dto.getUnitPrice() != null) {
            stock.setTotalPrice(dto.getUnitPrice().multiply(BigDecimal.valueOf(dto.getQuantity())));
        }
        stockMapper.insert(stock);
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, MaterialStockDTO dto) {
        MaterialStock stock = stockMapper.selectById(id);
        if (stock == null) {
            throw new BusinessException("库存记录不存在");
        }

        if (dto.getCategoryId() != null && !dto.getCategoryId().equals(stock.getCategoryId())) {
            categoryService.validateCategoryAvailable(dto.getCategoryId());
        }

        BeanUtils.copyProperties(dto, stock, "id", "batchNo");
        calculateStockStatus(stock);
        if (dto.getQuantity() != null && dto.getUnitPrice() != null) {
            stock.setTotalPrice(dto.getUnitPrice().multiply(BigDecimal.valueOf(dto.getQuantity())));
        }
        stockMapper.updateById(stock);
    }

    private void calculateStockStatus(MaterialStock stock) {
        if (stock.getQuantity() == null || stock.getQuantity() == 0) {
            stock.setStockStatus(StockStatus.OUT_OF_STOCK);
        } else if (stock.getQuantity() < 10) {
            stock.setStockStatus(StockStatus.LOW_STOCK);
        } else {
            stock.setStockStatus(StockStatus.AVAILABLE);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void stockIn(Long id, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new BusinessException("入库数量必须大于0");
        }
        MaterialStock stock = stockMapper.selectById(id);
        if (stock == null) {
            throw new BusinessException("库存记录不存在");
        }
        stock.setQuantity(stock.getQuantity() + quantity);
        calculateStockStatus(stock);
        stockMapper.updateById(stock);
    }

    @Transactional(rollbackFor = Exception.class)
    public void stockOut(Long id, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new BusinessException("出库数量必须大于0");
        }
        MaterialStock stock = stockMapper.selectById(id);
        if (stock == null) {
            throw new BusinessException("库存记录不存在");
        }
        if (stock.getQuantity() < quantity) {
            throw new BusinessException("库存不足");
        }
        stock.setQuantity(stock.getQuantity() - quantity);
        calculateStockStatus(stock);
        stockMapper.updateById(stock);
    }

    @Transactional(rollbackFor = Exception.class)
    public void lockStock(Long id, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new BusinessException("锁定数量必须大于0");
        }
        MaterialStock stock = stockMapper.selectById(id);
        if (stock == null) {
            throw new BusinessException("库存记录不存在");
        }
        if (stock.getQuantity() < quantity) {
            throw new BusinessException("库存不足，无法锁定");
        }
        stock.setQuantity(stock.getQuantity() - quantity);
        calculateStockStatus(stock);
        stockMapper.updateById(stock);
    }

    @Transactional(rollbackFor = Exception.class)
    public void unlockStock(Long id, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new BusinessException("解锁数量必须大于0");
        }
        MaterialStock stock = stockMapper.selectById(id);
        if (stock == null) {
            throw new BusinessException("库存记录不存在");
        }
        stock.setQuantity(stock.getQuantity() + quantity);
        calculateStockStatus(stock);
        stockMapper.updateById(stock);
    }

    public void delete(Long id) {
        stockMapper.deleteById(id);
    }

    public MaterialStock getById(Long id) {
        MaterialStock stock = stockMapper.selectById(id);
        if (stock != null && stock.getCategoryId() != null) {
            MaterialCategory category = categoryMapper.selectById(stock.getCategoryId());
            if (category != null) {
                stock.setCategoryName(category.getCategoryName());
            }
        }
        return stock;
    }

    public List<MaterialStock> getWarningList() {
        LocalDate warningDate = LocalDate.now().plusDays(7);
        List<MaterialStock> stocks = stockMapper.selectList(
                new LambdaQueryWrapper<MaterialStock>()
                        .isNotNull(MaterialStock::getExpiryDate)
                        .le(MaterialStock::getExpiryDate, warningDate)
                        .gt(MaterialStock::getQuantity, 0)
        );
        for (MaterialStock stock : stocks) {
            if (stock.getCategoryId() != null) {
                MaterialCategory category = categoryMapper.selectById(stock.getCategoryId());
                if (category != null) {
                    stock.setCategoryName(category.getCategoryName());
                }
            }
        }
        return stocks;
    }

    public List<MaterialStock> getAvailableStock(Long categoryId) {
        LambdaQueryWrapper<MaterialStock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialStock::getStockStatus, StockStatus.AVAILABLE)
                .gt(MaterialStock::getQuantity, 0);
        if (categoryId != null) {
            wrapper.eq(MaterialStock::getCategoryId, categoryId);
        }
        List<MaterialStock> stocks = stockMapper.selectList(wrapper);
        for (MaterialStock stock : stocks) {
            if (stock.getCategoryId() != null) {
                MaterialCategory category = categoryMapper.selectById(stock.getCategoryId());
                if (category != null) {
                    stock.setCategoryName(category.getCategoryName());
                }
            }
        }
        return stocks;
    }
}
