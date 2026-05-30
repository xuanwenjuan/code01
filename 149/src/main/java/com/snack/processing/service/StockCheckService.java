package com.snack.processing.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.snack.processing.annotation.OperationLog;
import com.snack.processing.common.Result;
import com.snack.processing.common.ResultCode;
import com.snack.processing.dto.stockcheck.StockCheckAddDTO;
import com.snack.processing.dto.stockcheck.StockCheckDetailDTO;
import com.snack.processing.dto.stockcheck.StockCheckQueryDTO;
import com.snack.processing.entity.StockCheck;
import com.snack.processing.entity.StockCheckDetail;
import com.snack.processing.exception.BusinessException;
import com.snack.processing.mapper.StockCheckDetailMapper;
import com.snack.processing.mapper.StockCheckMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockCheckService extends ServiceImpl<StockCheckMapper, StockCheck> {

    private final StockCheckMapper checkMapper;
    private final StockCheckDetailMapper detailMapper;

    @OperationLog(module = "库存盘点", operation = "创建盘点单", description = "创建库存盘点单")
    @Transactional(rollbackFor = Exception.class)
    public Result<StockCheck> createStockCheck(StockCheckAddDTO dto) {
        StockCheck exists = checkMapper.selectOne(new LambdaQueryWrapper<StockCheck>()
                .eq(StockCheck::getCheckNo, dto.getCheckNo()));

        if (exists != null) {
            throw new BusinessException(ResultCode.DATA_EXISTS, "盘点单号已存在");
        }

        StockCheck stockCheck = new StockCheck();
        stockCheck.setCheckNo(dto.getCheckNo());
        stockCheck.setWarehouse(dto.getWarehouse());
        stockCheck.setCheckDate(dto.getCheckDate());
        stockCheck.setCheckType(dto.getCheckType());
        stockCheck.setStatus(1);
        stockCheck.setRemark(dto.getRemark());

        int totalCount = 0;
        int differenceCount = 0;
        BigDecimal totalDifferenceAmount = BigDecimal.ZERO;

        List<StockCheckDetail> details = new ArrayList<>();
        if (dto.getDetails() != null && !dto.getDetails().isEmpty()) {
            for (StockCheckDetailDTO detailDTO : dto.getDetails()) {
                StockCheckDetail detail = new StockCheckDetail();
                detail.setMaterialId(detailDTO.getMaterialId());
                detail.setMaterialName(detailDTO.getMaterialName());
                detail.setMaterialCode(detailDTO.getMaterialCode());
                detail.setBatchNo(detailDTO.getBatchNo());
                detail.setSystemQuantity(detailDTO.getSystemQuantity());
                detail.setActualQuantity(detailDTO.getActualQuantity());

                BigDecimal diff = detailDTO.getActualQuantity().subtract(detailDTO.getSystemQuantity());
                detail.setDifferenceQuantity(diff);
                detail.setUnitPrice(detailDTO.getUnitPrice());

                BigDecimal diffAmount = diff.multiply(detailDTO.getUnitPrice() != null ? detailDTO.getUnitPrice() : BigDecimal.ZERO);
                detail.setDifferenceAmount(diffAmount);
                detail.setReason(detailDTO.getReason());
                detail.setRemark(detailDTO.getRemark());

                details.add(detail);
                totalCount++;

                if (diff.compareTo(BigDecimal.ZERO) != 0) {
                    differenceCount++;
                    totalDifferenceAmount = totalDifferenceAmount.add(diffAmount.abs());
                }
            }
        }

        stockCheck.setTotalCount(totalCount);
        stockCheck.setDifferenceCount(differenceCount);
        stockCheck.setTotalDifferenceAmount(totalDifferenceAmount);

        checkMapper.insert(stockCheck);

        for (StockCheckDetail detail : details) {
            detail.setCheckId(stockCheck.getId());
            detailMapper.insert(detail);
        }

        return Result.success(stockCheck);
    }

    @OperationLog(module = "库存盘点", operation = "完成盘点", description = "完成库存盘点")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> completeStockCheck(Long id) {
        StockCheck stockCheck = checkMapper.selectById(id);
        if (stockCheck == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        if (stockCheck.getStatus() == 2) {
            throw new BusinessException("盘点单已完成，无需重复操作");
        }

        stockCheck.setStatus(2);
        checkMapper.updateById(stockCheck);

        return Result.success();
    }

    public Result<StockCheck> getStockCheckDetail(Long id) {
        StockCheck stockCheck = checkMapper.selectById(id);
        if (stockCheck == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        List<StockCheckDetail> details = detailMapper.selectList(new LambdaQueryWrapper<StockCheckDetail>()
                .eq(StockCheckDetail::getCheckId, id));
        stockCheck.setDetails(details);

        return Result.success(stockCheck);
    }

    public Result<IPage<StockCheck>> getStockCheckPage(StockCheckQueryDTO dto) {
        LambdaQueryWrapper<StockCheck> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(dto.getCheckNo() != null, StockCheck::getCheckNo, dto.getCheckNo())
                .like(dto.getWarehouse() != null, StockCheck::getWarehouse, dto.getWarehouse())
                .ge(dto.getCheckDateStart() != null, StockCheck::getCheckDate, dto.getCheckDateStart())
                .le(dto.getCheckDateEnd() != null, StockCheck::getCheckDate, dto.getCheckDateEnd())
                .eq(dto.getCheckType() != null, StockCheck::getCheckType, dto.getCheckType())
                .eq(dto.getStatus() != null, StockCheck::getStatus, dto.getStatus())
                .orderByDesc(StockCheck::getCheckDate);

        IPage<StockCheck> page = checkMapper.selectPage(dto.buildPage(), wrapper);
        return Result.success(page);
    }
}
