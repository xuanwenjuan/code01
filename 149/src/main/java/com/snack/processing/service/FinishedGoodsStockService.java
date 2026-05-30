package com.snack.processing.service;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.snack.processing.annotation.OperationLog;
import com.snack.processing.common.Result;
import com.snack.processing.common.ResultCode;
import com.snack.processing.dto.finishedgoods.FinishedGoodsInDTO;
import com.snack.processing.dto.finishedgoods.FinishedGoodsStockQueryDTO;
import com.snack.processing.entity.FinishedGoodsStock;
import com.snack.processing.entity.WorkOrder;
import com.snack.processing.exception.BusinessException;
import com.snack.processing.mapper.FinishedGoodsStockMapper;
import com.snack.processing.mapper.WorkOrderMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FinishedGoodsStockService extends ServiceImpl<FinishedGoodsStockMapper, FinishedGoodsStock> {

    private final FinishedGoodsStockMapper stockMapper;
    private final WorkOrderMapper workOrderMapper;

    @OperationLog(module = "成品库存管理", operation = "成品入库", description = "生产成品入库")
    @Transactional(rollbackFor = Exception.class)
    public Result<FinishedGoodsStock> stockIn(FinishedGoodsInDTO dto) {
        WorkOrder workOrder = workOrderMapper.selectById(dto.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND, "工单不存在");
        }

        String batchNo = generateBatchNo();

        FinishedGoodsStock stock = new FinishedGoodsStock();
        stock.setWorkOrderId(dto.getWorkOrderId());
        stock.setWorkOrderNo(workOrder.getOrderNo());
        stock.setSnackCategoryId(workOrder.getSnackCategoryId());
        stock.setSnackCategoryName(workOrder.getSnackCategoryName());
        stock.setProductName(dto.getProductName());
        stock.setBatchNo(batchNo);
        stock.setTotalQuantity(dto.getQuantity());
        stock.setAvailableQuantity(dto.getQuantity());
        stock.setLockedQuantity(BigDecimal.ZERO);
        stock.setOutQuantity(BigDecimal.ZERO);
        stock.setUnit(dto.getUnit());
        stock.setUnitCost(dto.getUnitCost());
        stock.setTotalCost(dto.getQuantity().multiply(dto.getUnitCost()));
        stock.setProductionDate(dto.getProductionDate() != null ? dto.getProductionDate() : LocalDate.now());
        stock.setExpireDate(dto.getExpireDate());
        stock.setWarehouse(dto.getWarehouse());
        stock.setLocation(dto.getLocation());
        stock.setStockStatus(1);
        stock.setRemark(dto.getRemark());

        if (dto.getExpireDate() != null) {
            LocalDate now = LocalDate.now();
            long daysUntilExpire = ChronoUnit.DAYS.between(now, dto.getExpireDate());
            if (daysUntilExpire <= 30) {
                stock.setStockStatus(2);
            }
            if (daysUntilExpire < 0) {
                stock.setStockStatus(3);
            }
        }

        stockMapper.insert(stock);
        return Result.success(stock);
    }

    @OperationLog(module = "成品库存管理", operation = "成品出库", description = "成品销售出库")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> stockOut(Long stockId, BigDecimal quantity) {
        FinishedGoodsStock stock = stockMapper.selectById(stockId);
        if (stock == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND, "库存记录不存在");
        }

        if (stock.getAvailableQuantity().compareTo(quantity) < 0) {
            throw new BusinessException(ResultCode.STOCK_NOT_ENOUGH);
        }

        stock.setAvailableQuantity(stock.getAvailableQuantity().subtract(quantity));
        stock.setOutQuantity(stock.getOutQuantity().add(quantity));

        stockMapper.updateById(stock);
        return Result.success();
    }

    public Result<IPage<FinishedGoodsStock>> getStockPage(FinishedGoodsStockQueryDTO dto) {
        LambdaQueryWrapper<FinishedGoodsStock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(dto.getWorkOrderId() != null, FinishedGoodsStock::getWorkOrderId, dto.getWorkOrderId())
                .like(dto.getWorkOrderNo() != null, FinishedGoodsStock::getWorkOrderNo, dto.getWorkOrderNo())
                .eq(dto.getSnackCategoryId() != null, FinishedGoodsStock::getSnackCategoryId, dto.getSnackCategoryId())
                .like(dto.getProductName() != null, FinishedGoodsStock::getProductName, dto.getProductName())
                .eq(dto.getBatchNo() != null, FinishedGoodsStock::getBatchNo, dto.getBatchNo())
                .eq(dto.getStockStatus() != null, FinishedGoodsStock::getStockStatus, dto.getStockStatus())
                .ge(dto.getExpireDateStart() != null, FinishedGoodsStock::getExpireDate, dto.getExpireDateStart())
                .le(dto.getExpireDateEnd() != null, FinishedGoodsStock::getExpireDate, dto.getExpireDateEnd())
                .orderByDesc(FinishedGoodsStock::getCreateTime);

        IPage<FinishedGoodsStock> page = stockMapper.selectPage(dto.buildPage(), wrapper);
        return Result.success(page);
    }

    public Result<FinishedGoodsStock> getStockById(Long id) {
        FinishedGoodsStock stock = stockMapper.selectById(id);
        if (stock == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }
        return Result.success(stock);
    }

    private String generateBatchNo() {
        String datePart = DateUtil.format(DateUtil.date(), "yyyyMMdd");
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "FG" + datePart + uuid;
    }
}
