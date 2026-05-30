package com.rotor.manufacture.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.rotor.manufacture.context.UserContext;
import com.rotor.manufacture.dto.CostAccountingQueryDTO;
import com.rotor.manufacture.dto.PageQueryDTO;
import com.rotor.manufacture.entity.CostAccounting;
import com.rotor.manufacture.entity.OrderMaterial;
import com.rotor.manufacture.entity.OrderProcess;
import com.rotor.manufacture.mapper.CostAccountingMapper;
import com.rotor.manufacture.mapper.OrderMaterialMapper;
import com.rotor.manufacture.mapper.OrderProcessMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CostAccountingService {

    private final CostAccountingMapper costAccountingMapper;
    private final OrderMaterialMapper orderMaterialMapper;
    private final OrderProcessMapper orderProcessMapper;

    @Transactional(rollbackFor = Exception.class)
    public CostAccounting calculateCost(Long orderId) {
        LambdaQueryWrapper<CostAccounting> existWrapper = new LambdaQueryWrapper<>();
        existWrapper.eq(CostAccounting::getOrderId, orderId);
        CostAccounting exist = costAccountingMapper.selectOne(existWrapper);
        if (exist != null) {
            costAccountingMapper.deleteById(exist.getId());
        }

        LambdaQueryWrapper<OrderMaterial> materialWrapper = new LambdaQueryWrapper<>();
        materialWrapper.eq(OrderMaterial::getOrderId, orderId);
        List<OrderMaterial> materials = orderMaterialMapper.selectList(materialWrapper);

        BigDecimal siliconSteelCost = BigDecimal.ZERO;
        BigDecimal magnetCost = BigDecimal.ZERO;
        BigDecimal shaftCost = BigDecimal.ZERO;
        BigDecimal coatingCost = BigDecimal.ZERO;
        BigDecimal otherMaterialCost = BigDecimal.ZERO;
        BigDecimal scrapCost = BigDecimal.ZERO;

        for (OrderMaterial material : materials) {
            BigDecimal totalPrice = material.getTotalPrice() != null ? material.getTotalPrice() : BigDecimal.ZERO;
            Integer operationType = material.getOperationType();

            if (operationType != null && operationType == 3) {
                scrapCost = scrapCost.add(totalPrice);
                continue;
            }

            switch (material.getMaterialType()) {
                case "SILICON_STEEL":
                    siliconSteelCost = siliconSteelCost.add(totalPrice);
                    break;
                case "PERMANENT_MAGNET":
                    magnetCost = magnetCost.add(totalPrice);
                    break;
                case "SHAFT_BLANK":
                    shaftCost = shaftCost.add(totalPrice);
                    break;
                case "INSULATION_COATING":
                    coatingCost = coatingCost.add(totalPrice);
                    break;
                default:
                    otherMaterialCost = otherMaterialCost.add(totalPrice);
                    break;
            }
        }

        LambdaQueryWrapper<OrderProcess> processWrapper = new LambdaQueryWrapper<>();
        processWrapper.eq(OrderProcess::getOrderId, orderId);
        List<OrderProcess> processes = orderProcessMapper.selectList(processWrapper);

        BigDecimal equipmentCost = BigDecimal.ZERO;
        BigDecimal laborCost = BigDecimal.ZERO;
        BigDecimal energyCost = BigDecimal.ZERO;
        int totalDefective = 0;

        for (OrderProcess process : processes) {
            if (process.getEquipmentCost() != null) {
                equipmentCost = equipmentCost.add(process.getEquipmentCost());
            }
            if (process.getLaborHours() != null) {
                laborCost = laborCost.add(process.getLaborHours().multiply(new BigDecimal("50")));
            }
            if (process.getEnergyConsumption() != null) {
                energyCost = energyCost.add(process.getEnergyConsumption().multiply(new BigDecimal("1.5")));
            }
            if (process.getScrapMaterialCost() != null) {
                scrapCost = scrapCost.add(process.getScrapMaterialCost());
            }
            if (process.getDefectiveQuantity() != null) {
                totalDefective += process.getDefectiveQuantity();
            }
        }

        int totalQuantity = processes.stream()
                .mapToInt(p -> p.getQualifiedQuantity() != null ? p.getQualifiedQuantity() : 0)
                .sum();

        BigDecimal totalCost = siliconSteelCost
                .add(magnetCost)
                .add(shaftCost)
                .add(coatingCost)
                .add(otherMaterialCost)
                .add(equipmentCost)
                .add(laborCost)
                .add(energyCost)
                .add(scrapCost);

        BigDecimal unitCost = totalQuantity > 0
                ? totalCost.divide(new BigDecimal(totalQuantity), 2, BigDecimal.ROUND_HALF_UP)
                : BigDecimal.ZERO;

        CostAccounting cost = new CostAccounting();
        cost.setOrderId(orderId);
        cost.setQuantity(totalQuantity);
        cost.setDefectiveQuantity(totalDefective);

        cost.setSiliconSteelCost(siliconSteelCost);
        cost.setMagnetCost(magnetCost);
        cost.setShaftCost(shaftCost);
        cost.setCoatingCost(coatingCost);
        cost.setOtherMaterialCost(otherMaterialCost);

        cost.setEquipmentCost(equipmentCost);
        cost.setLaborCost(laborCost);
        cost.setEnergyCost(energyCost);

        cost.setScrapCost(scrapCost);
        cost.setOtherCost(BigDecimal.ZERO);

        cost.setTotalCost(totalCost);
        cost.setUnitCost(unitCost);

        cost.setAccountingDate(LocalDateTime.now());
        cost.setAccountant(UserContext.getUsername());

        costAccountingMapper.insert(cost);
        log.info("成本核算完成: 工单ID={}, 总成本={}", orderId, totalCost);
        return cost;
    }

    public List<CostAccounting> list() {
        LambdaQueryWrapper<CostAccounting> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(CostAccounting::getCreateTime);
        return costAccountingMapper.selectList(wrapper);
    }

    public Page<CostAccounting> pageQuery(PageQueryDTO queryDTO) {
        Page<CostAccounting> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());
        LambdaQueryWrapper<CostAccounting> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(CostAccounting::getOrderNo, queryDTO.getKeyword())
                    .or().like(CostAccounting::getProductName, queryDTO.getKeyword()));
        }
        wrapper.orderByDesc(CostAccounting::getCreateTime);
        return costAccountingMapper.selectPage(page, wrapper);
    }

    public Page<CostAccounting> queryByConditions(CostAccountingQueryDTO queryDTO) {
        Page<CostAccounting> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());
        LambdaQueryWrapper<CostAccounting> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(CostAccounting::getOrderNo, queryDTO.getKeyword())
                    .or().like(CostAccounting::getProductName, queryDTO.getKeyword()));
        }
        if (StringUtils.hasText(queryDTO.getOrderNo())) {
            wrapper.like(CostAccounting::getOrderNo, queryDTO.getOrderNo());
        }
        if (queryDTO.getProductId() != null) {
            wrapper.eq(CostAccounting::getProductId, queryDTO.getProductId());
        }
        if (queryDTO.getMinTotalCost() != null) {
            wrapper.ge(CostAccounting::getTotalCost, queryDTO.getMinTotalCost());
        }
        if (queryDTO.getMaxTotalCost() != null) {
            wrapper.le(CostAccounting::getTotalCost, queryDTO.getMaxTotalCost());
        }
        if (queryDTO.getMinUnitCost() != null) {
            wrapper.ge(CostAccounting::getUnitCost, queryDTO.getMinUnitCost());
        }
        if (queryDTO.getMaxUnitCost() != null) {
            wrapper.le(CostAccounting::getUnitCost, queryDTO.getMaxUnitCost());
        }
        if (queryDTO.getStartAccountingDate() != null) {
            wrapper.ge(CostAccounting::getAccountingDate, queryDTO.getStartAccountingDate());
        }
        if (queryDTO.getEndAccountingDate() != null) {
            wrapper.le(CostAccounting::getAccountingDate, queryDTO.getEndAccountingDate());
        }

        if ("asc".equalsIgnoreCase(queryDTO.getOrderDirection())) {
            wrapper.orderByAsc(getOrderColumn(queryDTO.getOrderBy()));
        } else {
            wrapper.orderByDesc(getOrderColumn(queryDTO.getOrderBy()));
        }

        return costAccountingMapper.selectPage(page, wrapper);
    }

    private String getOrderColumn(String orderBy) {
        return switch (orderBy) {
            case "totalCost" -> "total_cost";
            case "unitCost" -> "unit_cost";
            case "accountingDate" -> "accounting_date";
            case "createTime" -> "create_time";
            default -> "create_time";
        };
    }

    public CostAccounting getById(Long id) {
        return costAccountingMapper.selectById(id);
    }

    public CostAccounting getByOrderId(Long orderId) {
        LambdaQueryWrapper<CostAccounting> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CostAccounting::getOrderId, orderId);
        return costAccountingMapper.selectOne(wrapper);
    }

    public List<CostAccounting> getReport(LocalDateTime startDate, LocalDateTime endDate) {
        LambdaQueryWrapper<CostAccounting> wrapper = new LambdaQueryWrapper<>();
        if (startDate != null) {
            wrapper.ge(CostAccounting::getAccountingDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(CostAccounting::getAccountingDate, endDate);
        }
        wrapper.orderByDesc(CostAccounting::getAccountingDate);
        return costAccountingMapper.selectList(wrapper);
    }
}