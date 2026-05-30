package com.paper.production.service.quality.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.paper.production.common.PageQuery;
import com.paper.production.common.PageResult;
import com.paper.production.common.ResultCode;
import com.paper.production.dto.quality.DefectiveProductDTO;
import com.paper.production.entity.quality.DefectiveProduct;
import com.paper.production.entity.workorder.WorkOrder;
import com.paper.production.exception.BusinessException;
import com.paper.production.mapper.quality.DefectiveProductMapper;
import com.paper.production.mapper.workorder.WorkOrderMapper;
import com.paper.production.service.quality.DefectiveProductService;
import com.paper.production.utils.UserContextUtil;
import jakarta.annotation.Resource;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DefectiveProductServiceImpl extends ServiceImpl<DefectiveProductMapper, DefectiveProduct> implements DefectiveProductService {

    @Resource
    private WorkOrderMapper workOrderMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveDefective(DefectiveProductDTO dto) {
        WorkOrder workOrder = workOrderMapper.selectById(dto.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST.getCode(), "工单不存在");
        }

        if (dto.getTotalQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), "总数量必须大于0");
        }

        if (dto.getDefectiveQuantity().compareTo(dto.getTotalQuantity()) > 0) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), "次品数量不能大于总数量");
        }

        BigDecimal defectiveRate = dto.getDefectiveQuantity()
                .divide(dto.getTotalQuantity(), 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));

        BigDecimal lossAmount = dto.getHandleCost() != null ? dto.getHandleCost() : BigDecimal.ZERO;
        if (dto.getScrapValue() != null) {
            lossAmount = lossAmount.subtract(dto.getScrapValue());
        }

        DefectiveProduct defective = new DefectiveProduct();
        BeanUtils.copyProperties(dto, defective);
        defective.setDefectiveNo(generateDefectiveNo());
        defective.setProductCategoryId(workOrder.getProductCategoryId());
        defective.setProductCategoryName(workOrder.getProductCategoryName());
        defective.setDefectiveRate(defectiveRate);
        defective.setLossAmount(lossAmount);
        defective.setInspector(dto.getInspector() != null ? dto.getInspector() : UserContextUtil.getUsername());
        defective.setStatus(1);
        save(defective);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateDefective(DefectiveProductDTO dto) {
        if (dto.getId() == null) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), "ID不能为空");
        }

        DefectiveProduct defective = getById(dto.getId());
        if (defective == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        if (dto.getTotalQuantity() != null && dto.getTotalQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), "总数量必须大于0");
        }

        if (dto.getDefectiveQuantity() != null && dto.getTotalQuantity() != null
                && dto.getDefectiveQuantity().compareTo(dto.getTotalQuantity()) > 0) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), "次品数量不能大于总数量");
        }

        BeanUtils.copyProperties(dto, defective);

        if (dto.getDefectiveQuantity() != null && dto.getTotalQuantity() != null) {
            BigDecimal defectiveRate = dto.getDefectiveQuantity()
                    .divide(dto.getTotalQuantity(), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
            defective.setDefectiveRate(defectiveRate);
        }

        BigDecimal lossAmount = dto.getHandleCost() != null ? dto.getHandleCost() : defective.getHandleCost();
        if (lossAmount == null) lossAmount = BigDecimal.ZERO;
        if (dto.getScrapValue() != null) {
            lossAmount = lossAmount.subtract(dto.getScrapValue());
        } else if (defective.getScrapValue() != null) {
            lossAmount = lossAmount.subtract(defective.getScrapValue());
        }
        defective.setLossAmount(lossAmount);

        updateById(defective);
    }

    @Override
    public void deleteDefective(Long id) {
        DefectiveProduct defective = getById(id);
        if (defective == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        removeById(id);
    }

    @Override
    public PageResult<DefectiveProduct> queryPage(PageQuery query) {
        LambdaQueryWrapper<DefectiveProduct> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(query.getKeyword())) {
            wrapper.and(w -> w.like(DefectiveProduct::getDefectiveNo, query.getKeyword())
                    .or().like(DefectiveProduct::getOrderNo, query.getKeyword())
                    .or().like(DefectiveProduct::getDefectiveType, query.getKeyword()));
        }
        wrapper.orderByDesc(DefectiveProduct::getCreateTime);

        Page<DefectiveProduct> page = page(new Page<>(query.getCurrent(), query.getSize()), wrapper);
        return PageResult.of(page.getTotal(), page.getPages(), page.getCurrent(), page.getSize(), page.getRecords());
    }

    @Override
    public List<DefectiveProduct> getByWorkOrderId(Long workOrderId) {
        LambdaQueryWrapper<DefectiveProduct> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DefectiveProduct::getWorkOrderId, workOrderId);
        wrapper.orderByDesc(DefectiveProduct::getCreateTime);
        return list(wrapper);
    }

    @Override
    public Map<String, Object> getDefectiveStatistics(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> result = new HashMap<>();

        LambdaQueryWrapper<DefectiveProduct> wrapper = new LambdaQueryWrapper<>();
        if (startDate != null) {
            wrapper.ge(DefectiveProduct::getCreateTime, startDate.atStartOfDay());
        }
        if (endDate != null) {
            wrapper.le(DefectiveProduct::getCreateTime, endDate.atTime(23, 59, 59));
        }

        List<DefectiveProduct> defectives = list(wrapper);

        BigDecimal totalDefectiveQuantity = BigDecimal.ZERO;
        BigDecimal totalLossAmount = BigDecimal.ZERO;
        BigDecimal totalHandleCost = BigDecimal.ZERO;
        BigDecimal totalScrapValue = BigDecimal.ZERO;

        Map<String, BigDecimal> typeStats = new HashMap<>();

        for (DefectiveProduct defective : defectives) {
            if (defective.getDefectiveQuantity() != null) {
                totalDefectiveQuantity = totalDefectiveQuantity.add(defective.getDefectiveQuantity());
            }
            if (defective.getLossAmount() != null) {
                totalLossAmount = totalLossAmount.add(defective.getLossAmount());
            }
            if (defective.getHandleCost() != null) {
                totalHandleCost = totalHandleCost.add(defective.getHandleCost());
            }
            if (defective.getScrapValue() != null) {
                totalScrapValue = totalScrapValue.add(defective.getScrapValue());
            }

            String type = defective.getDefectiveType() != null ? defective.getDefectiveType() : "其他";
            typeStats.merge(type, defective.getDefectiveQuantity() != null ? defective.getDefectiveQuantity() : BigDecimal.ZERO, BigDecimal::add);
        }

        result.put("totalCount", defectives.size());
        result.put("totalDefectiveQuantity", totalDefectiveQuantity);
        result.put("totalLossAmount", totalLossAmount);
        result.put("totalHandleCost", totalHandleCost);
        result.put("totalScrapValue", totalScrapValue);
        result.put("typeStatistics", typeStats);

        return result;
    }

    @Override
    public Map<String, Object> getProcessDefectiveRate(Long workOrderId) {
        Map<String, Object> result = new HashMap<>();

        List<DefectiveProduct> defectives = getByWorkOrderId(workOrderId);

        Map<String, BigDecimal> processDefectiveRate = new HashMap<>();
        Map<String, BigDecimal> processDefectiveQty = new HashMap<>();
        Map<String, BigDecimal> processTotalQty = new HashMap<>();

        for (DefectiveProduct defective : defectives) {
            String process = defective.getProcessName();
            BigDecimal defectiveQty = defective.getDefectiveQuantity() != null ? defective.getDefectiveQuantity() : BigDecimal.ZERO;
            BigDecimal totalQty = defective.getTotalQuantity() != null ? defective.getTotalQuantity() : BigDecimal.ZERO;

            processDefectiveQty.merge(process, defectiveQty, BigDecimal::add);
            processTotalQty.merge(process, totalQty, BigDecimal::add);
        }

        for (Map.Entry<String, BigDecimal> entry : processDefectiveQty.entrySet()) {
            String process = entry.getKey();
            BigDecimal defQty = entry.getValue();
            BigDecimal totalQty = processTotalQty.getOrDefault(process, BigDecimal.ONE);
            BigDecimal rate = totalQty.compareTo(BigDecimal.ZERO) > 0
                    ? defQty.divide(totalQty, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
                    : BigDecimal.ZERO;
            processDefectiveRate.put(process, rate);
        }

        result.put("processDefectiveRate", processDefectiveRate);
        result.put("processDefectiveQty", processDefectiveQty);
        result.put("processTotalQty", processTotalQty);

        return result;
    }

    private String generateDefectiveNo() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int count = Math.toIntExact(count(new LambdaQueryWrapper<DefectiveProduct>()
                .likeRight(DefectiveProduct::getDefectiveNo, "DEF-" + date)) + 1);
        return String.format("DEF-%s-%04d", date, count);
    }
}
