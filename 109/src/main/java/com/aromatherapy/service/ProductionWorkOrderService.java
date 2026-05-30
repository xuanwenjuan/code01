package com.aromatherapy.service;

import com.aromatherapy.entity.dto.WorkOrderCompleteDTO;
import com.aromatherapy.entity.dto.WorkOrderCreateDTO;
import com.aromatherapy.entity.po.*;
import com.aromatherapy.entity.vo.ProductionWorkOrderVO;
import com.aromatherapy.enums.WorkOrderStatusEnum;
import com.aromatherapy.exception.BusinessException;
import com.aromatherapy.mapper.*;
import com.aromatherapy.util.WorkOrderStatusFlow;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductionWorkOrderService {

    private final ProductionWorkOrderMapper workOrderMapper;
    private final WorkOrderFormulaMapper formulaMapper;
    private final AromaCategoryMapper categoryMapper;
    private final RawMaterialMapper rawMaterialMapper;
    private final RawMaterialService rawMaterialService;
    private final CostLedgerMapper costLedgerMapper;

    @Transactional(rollbackFor = Exception.class)
    public void create(WorkOrderCreateDTO dto) {
        AromaCategoryPO category = categoryMapper.selectById(dto.getCategoryId());
        if (category == null) {
            throw new BusinessException("香型分类不存在");
        }
        if (category.getStatus() == 0) {
            throw new BusinessException("该香型已停产，不允许创建工单");
        }

        String orderNo = "WO" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        
        ProductionWorkOrderPO workOrder = new ProductionWorkOrderPO();
        BeanUtils.copyProperties(dto, workOrder);
        workOrder.setOrderNo(orderNo);
        workOrder.setStatus(WorkOrderStatusEnum.PENDING.getCode());
        workOrder.setIsLocked(0);
        workOrderMapper.insert(workOrder);

        if (dto.getFormulaItems() != null) {
            for (var item : dto.getFormulaItems()) {
                WorkOrderFormulaPO formula = new WorkOrderFormulaPO();
                BeanUtils.copyProperties(item, formula);
                formula.setWorkOrderId(workOrder.getId());
                formulaMapper.insert(formula);
            }
        }

        log.info("创建工单成功：工单号={}, 香型={}", orderNo, dto.getAromaName());
    }

    @Transactional(rollbackFor = Exception.class)
    public void confirmFormula(Long workOrderId, Long perfumerId) {
        ProductionWorkOrderPO workOrder = workOrderMapper.selectById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        WorkOrderStatusFlow.validateStatusTransition(
            WorkOrderStatusEnum.valueOf(workOrder.getStatus()),
            WorkOrderStatusEnum.FORMULA_CONFIRMED
        );

        LambdaQueryWrapper<WorkOrderFormulaPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrderFormulaPO::getWorkOrderId, workOrderId);
        List<WorkOrderFormulaPO> formulas = formulaMapper.selectList(wrapper);
        
        if (formulas.isEmpty()) {
            throw new BusinessException("工单配方不能为空，请先添加配方");
        }

        for (WorkOrderFormulaPO formula : formulas) {
            RawMaterialPO material = rawMaterialMapper.selectById(formula.getRawMaterialId());
            if (material == null) {
                throw new BusinessException("原料不存在：" + formula.getMaterialName());
            }
            
            BigDecimal availableStock = material.getStockQuantity().subtract(material.getLockedQuantity());
            if (availableStock.compareTo(formula.getDosage()) < 0) {
                throw new BusinessException("原料库存不足：" + material.getMaterialName() + 
                    ", 可用：" + availableStock + ", 需要：" + formula.getDosage());
            }
            
            rawMaterialService.lockStock(formula.getRawMaterialId(), formula.getDosage());
        }

        workOrder.setStatus(WorkOrderStatusEnum.FORMULA_CONFIRMED.getCode());
        workOrder.setFormulaConfirmedTime(LocalDateTime.now());
        workOrder.setPerfumerId(perfumerId);
        workOrder.setIsLocked(1);
        workOrderMapper.updateById(workOrder);

        log.info("工单配方确认并锁定库存：工单号={}", workOrder.getOrderNo());
    }

    @Transactional(rollbackFor = Exception.class)
    public void completeProduction(WorkOrderCompleteDTO dto) {
        ProductionWorkOrderPO workOrder = workOrderMapper.selectById(dto.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        WorkOrderStatusFlow.validateStatusTransition(
            WorkOrderStatusEnum.valueOf(workOrder.getStatus()),
            WorkOrderStatusEnum.QC_PASSED
        );

        LambdaQueryWrapper<WorkOrderFormulaPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrderFormulaPO::getWorkOrderId, dto.getWorkOrderId());
        List<WorkOrderFormulaPO> formulas = formulaMapper.selectList(wrapper);

        BigDecimal totalMaterialCost = BigDecimal.ZERO;
        BigDecimal totalMaterialConsumption = BigDecimal.ZERO;
        BigDecimal totalMixingLoss = BigDecimal.ZERO;
        BigDecimal totalMixingLossCost = BigDecimal.ZERO;

        for (WorkOrderFormulaPO formula : formulas) {
            RawMaterialPO material = rawMaterialMapper.selectById(formula.getRawMaterialId());
            
            BigDecimal actualUsage = formula.getDosage().multiply(
                BigDecimal.ONE.add(formula.getLossRate().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP))
            );
            formula.setActualUsage(actualUsage);
            formulaMapper.updateById(formula);

            BigDecimal materialCost = actualUsage.multiply(material.getUnitPrice());
            BigDecimal mixingLoss = actualUsage.subtract(formula.getDosage());
            BigDecimal mixingLossCost = mixingLoss.multiply(material.getUnitPrice());

            totalMaterialCost = totalMaterialCost.add(materialCost);
            totalMaterialConsumption = totalMaterialConsumption.add(actualUsage);
            totalMixingLoss = totalMixingLoss.add(mixingLoss);
            totalMixingLossCost = totalMixingLossCost.add(mixingLossCost);

            rawMaterialService.deductStock(formula.getRawMaterialId(), actualUsage);
        }

        BigDecimal laborCost = dto.getLaborCost() != null ? dto.getLaborCost() : BigDecimal.ZERO;
        BigDecimal totalCost = totalMaterialCost.add(laborCost);

        workOrder.setActualQuantity(dto.getActualQuantity());
        workOrder.setTotalMaterialCost(totalMaterialCost);
        workOrder.setMixingLoss(totalMixingLoss);
        workOrder.setMixingLossCost(totalMixingLossCost);
        workOrder.setLaborCost(laborCost);
        workOrder.setTotalCost(totalCost);
        workOrder.setStatus(WorkOrderStatusEnum.QC_PASSED.getCode());
        workOrder.setQcTime(LocalDateTime.now());
        workOrder.setQcResult(dto.getQcResult());
        workOrderMapper.updateById(workOrder);

        generateCostLedger(workOrder, formulas, totalMaterialCost, totalMaterialConsumption, 
                          totalMixingLoss, totalMixingLossCost, laborCost, totalCost);

        log.info("工单生产完成，成本核算完成：工单号={}, 总成本={}", workOrder.getOrderNo(), totalCost);
    }

    private void generateCostLedger(ProductionWorkOrderPO workOrder, List<WorkOrderFormulaPO> formulas,
                                    BigDecimal totalMaterialCost, BigDecimal totalMaterialConsumption,
                                    BigDecimal totalMixingLoss, BigDecimal totalMixingLossCost,
                                    BigDecimal laborCost, BigDecimal totalCost) {
        String ledgerNo = "CL" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        
        AromaCategoryPO category = categoryMapper.selectById(workOrder.getCategoryId());
        
        String materialOrigin = formulas.stream()
            .map(f -> rawMaterialMapper.selectById(f.getRawMaterialId()).getOrigin())
            .distinct()
            .reduce((a, b) -> a + "," + b)
            .orElse("");

        CostLedgerPO ledger = new CostLedgerPO();
        ledger.setLedgerNo(ledgerNo);
        ledger.setWorkOrderId(workOrder.getId());
        ledger.setCategoryId(workOrder.getCategoryId());
        ledger.setCategoryName(category != null ? category.getCategoryName() : "");
        ledger.setMaterialOrigin(materialOrigin);
        ledger.setTotalMaterialCost(totalMaterialCost);
        ledger.setTotalMaterialConsumption(totalMaterialConsumption);
        ledger.setMixingLoss(totalMixingLoss);
        ledger.setMixingLossCost(totalMixingLossCost);
        ledger.setLaborCost(laborCost);
        ledger.setTotalCost(totalCost);
        ledger.setSupplyQuantity(workOrder.getActualQuantity());
        ledger.setSettlementStatus(0);
        costLedgerMapper.insert(ledger);
    }

    public ProductionWorkOrderVO getById(Long id) {
        ProductionWorkOrderPO po = workOrderMapper.selectById(id);
        if (po == null) {
            return null;
        }
        return convertToVO(po);
    }

    private ProductionWorkOrderVO convertToVO(ProductionWorkOrderPO po) {
        ProductionWorkOrderVO vo = new ProductionWorkOrderVO();
        BeanUtils.copyProperties(po, vo);
        vo.setStatusDesc(WorkOrderStatusEnum.valueOf(po.getStatus()).getDesc());
        return vo;
    }
}
