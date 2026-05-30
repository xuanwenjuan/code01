package com.motor.core.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.motor.core.common.BusinessException;
import com.motor.core.dto.ProcessCompleteDTO;
import com.motor.core.dto.ProductionOrderCreateDTO;
import com.motor.core.entity.po.*;
import com.motor.core.mapper.*;
import com.motor.core.vo.OrderProcessVO;
import com.motor.core.vo.ProductionOrderVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductionOrderService extends ServiceImpl<ProductionOrderMapper, ProductionOrderPO> {
    private final ProductionOrderMapper productionOrderMapper;
    private final OrderProcessMapper orderProcessMapper;
    private final MaterialMapper materialMapper;
    private final ProductionCostMapper productionCostMapper;
    private final CoreCategoryMapper coreCategoryMapper;

    public Page<ProductionOrderVO> queryPage(int pageNum, int pageSize, Integer status, Long categoryId) {
        Page<ProductionOrderPO> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<ProductionOrderPO> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(ProductionOrderPO::getStatus, status);
        }
        if (categoryId != null) {
            wrapper.eq(ProductionOrderPO::getCategoryId, categoryId);
        }
        wrapper.orderByDesc(ProductionOrderPO::getPriority, ProductionOrderPO::getCreateTime);

        Page<ProductionOrderPO> poPage = page(page, wrapper);
        return poPage.convert(this::convertToVO);
    }

    public ProductionOrderVO getDetailById(Long id) {
        ProductionOrderPO po = getById(id);
        if (po == null) {
            throw new BusinessException("工单不存在");
        }
        ProductionOrderVO vo = convertToVO(po);

        List<OrderProcessPO> processes = orderProcessMapper.selectList(
            new LambdaQueryWrapper<OrderProcessPO>()
                .eq(OrderProcessPO::getOrderId, id)
                .orderByAsc(OrderProcessPO::getId)
        );
        vo.setProcesses(processes.stream().map(this::convertProcessToVO).collect(Collectors.toList()));

        return vo;
    }

    @Transactional(rollbackFor = Exception.class)
    public ProductionOrderVO createOrder(ProductionOrderCreateDTO dto) {
        CoreCategoryPO category = coreCategoryMapper.selectById(dto.getCategoryId());
        if (category == null) {
            throw new BusinessException("产品类目不存在");
        }
        if (category.getStatus() == 0) {
            throw new BusinessException("该型号已下架，无法下达工单");
        }

        MaterialPO material = materialMapper.selectById(dto.getMaterialId());
        if (material == null) {
            throw new BusinessException("物料不存在");
        }

        BigDecimal available = material.getQuantity().subtract(
            material.getLockedQuantity() != null ? material.getLockedQuantity() : BigDecimal.ZERO
        );
        if (available.compareTo(dto.getMaterialUsage()) < 0) {
            throw new BusinessException("物料库存不足，可用: " + available);
        }

        ProductionOrderPO order = new ProductionOrderPO();
        BeanUtils.copyProperties(dto, order);
        order.setOrderNo(generateOrderNo());
        order.setStatus(1);
        order.setActualQuantity(0);
        order.setMaterialWaste(BigDecimal.ZERO);
        order.setEnergyConsumption(BigDecimal.ZERO);
        order.setLaborHours(BigDecimal.ZERO);
        order.setDefectiveQuantity(0);
        order.setTotalCost(BigDecimal.ZERO);
        save(order);

        initProcesses(order.getId());

        return convertToVO(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean startProcess(Long orderId, String processCode, Long operatorId) {
        ProductionOrderPO order = getById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        if (order.getStatus() == 9) {
            throw new BusinessException("工单已搁置，无法继续生产");
        }

        int currentStatus = getProcessStatus(processCode);
        if (order.getStatus() != currentStatus - 1) {
            throw new BusinessException("请按流程顺序执行工序");
        }

        if ("开平分条".equals(getProcessName(processCode)) && order.getStatus() == 1) {
            materialMapper.lockMaterialStock(order.getMaterialId(), order.getMaterialUsage());
        }

        LambdaQueryWrapper<OrderProcessPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderProcessPO::getOrderId, orderId)
               .eq(OrderProcessPO::getProcessCode, processCode);
        OrderProcessPO process = orderProcessMapper.selectOne(wrapper);

        if (process == null) {
            throw new BusinessException("工序不存在");
        }

        process.setStartTime(LocalDateTime.now());
        process.setOperatorId(operatorId);
        process.setStatus(2);
        orderProcessMapper.updateById(process);

        if (order.getActualStartTime() == null) {
            order.setActualStartTime(LocalDateTime.now());
        }
        order.setStatus(currentStatus);
        updateById(order);

        return true;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean completeProcess(ProcessCompleteDTO dto) {
        ProductionOrderPO order = getById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        int currentStatus = getProcessStatus(dto.getProcessCode());
        if (order.getStatus() != currentStatus) {
            throw new BusinessException("请先开始当前工序");
        }

        LambdaQueryWrapper<OrderProcessPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderProcessPO::getOrderId, dto.getOrderId())
               .eq(OrderProcessPO::getProcessCode, dto.getProcessCode());
        OrderProcessPO process = orderProcessMapper.selectOne(wrapper);

        if (process == null || process.getStartTime() == null) {
            throw new BusinessException("请先开始工序");
        }

        process.setEndTime(LocalDateTime.now());
        process.setProcessDuration((int) ChronoUnit.MINUTES.between(process.getStartTime(), process.getEndTime()));
        process.setOutputQuantity(dto.getOutputQuantity());
        process.setDefectiveQuantity(dto.getDefectiveQuantity() != null ? dto.getDefectiveQuantity() : 0);
        process.setMaterialWaste(dto.getMaterialWaste() != null ? dto.getMaterialWaste() : BigDecimal.ZERO);
        process.setEnergyConsumption(dto.getEnergyConsumption() != null ? dto.getEnergyConsumption() : BigDecimal.ZERO);
        process.setLaborHours(dto.getLaborHours() != null ? dto.getLaborHours() : BigDecimal.ZERO);
        process.setStatus(3);
        process.setRemark(dto.getRemark());
        orderProcessMapper.updateById(process);

        accumulateProductionData(order.getId());

        if ("FINISHED".equals(dto.getProcessCode())) {
            completeOrder(order, dto);
        }

        return true;
    }

    private void accumulateProductionData(Long orderId) {
        List<OrderProcessPO> processes = orderProcessMapper.selectList(
            new LambdaQueryWrapper<OrderProcessPO>().eq(OrderProcessPO::getOrderId, orderId)
        );

        BigDecimal totalMaterialWaste = BigDecimal.ZERO;
        BigDecimal totalEnergy = BigDecimal.ZERO;
        BigDecimal totalLaborHours = BigDecimal.ZERO;
        int totalDefective = 0;

        for (OrderProcessPO p : processes) {
            if (p.getMaterialWaste() != null) totalMaterialWaste = totalMaterialWaste.add(p.getMaterialWaste());
            if (p.getEnergyConsumption() != null) totalEnergy = totalEnergy.add(p.getEnergyConsumption());
            if (p.getLaborHours() != null) totalLaborHours = totalLaborHours.add(p.getLaborHours());
            if (p.getDefectiveQuantity() != null) totalDefective += p.getDefectiveQuantity();
        }

        ProductionOrderPO order = new ProductionOrderPO();
        order.setId(orderId);
        order.setMaterialWaste(totalMaterialWaste);
        order.setEnergyConsumption(totalEnergy);
        order.setLaborHours(totalLaborHours);
        order.setDefectiveQuantity(totalDefective);
        updateById(order);
    }

    private void completeOrder(ProductionOrderPO order, ProcessCompleteDTO dto) {
        order.setStatus(8);
        order.setActualEndTime(LocalDateTime.now());
        order.setActualQuantity(dto.getOutputQuantity());

        materialMapper.deductMaterialStock(order.getMaterialId(), order.getMaterialUsage());

        calculateTotalCost(order);

        updateById(order);

        createCostRecord(order);
    }

    private void calculateTotalCost(ProductionOrderPO order) {
        BigDecimal materialCost = order.getMaterialUsage().multiply(new BigDecimal("10"));
        BigDecimal energyCost = order.getEnergyConsumption().multiply(new BigDecimal("0.8"));
        BigDecimal laborCost = order.getLaborHours().multiply(new BigDecimal("50"));
        BigDecimal defectiveCost = new BigDecimal(order.getDefectiveQuantity()).multiply(new BigDecimal("100"));

        BigDecimal totalCost = materialCost.add(energyCost).add(laborCost).add(defectiveCost);
        order.setTotalCost(totalCost);
    }

    private void createCostRecord(ProductionOrderPO order) {
        ProductionCostPO cost = new ProductionCostPO();
        cost.setCostDate(LocalDateTime.now().toLocalDate());
        cost.setCategoryId(order.getCategoryId());
        cost.setOrderId(order.getId());
        cost.setMaterialCost(order.getMaterialUsage().multiply(new BigDecimal("10")));
        cost.setMaterialWaste(order.getMaterialWaste());
        cost.setEnergyConsumption(order.getEnergyConsumption());
        cost.setEnergyCost(order.getEnergyConsumption().multiply(new BigDecimal("0.8")));
        cost.setLaborHours(order.getLaborHours());
        cost.setLaborCost(order.getLaborHours().multiply(new BigDecimal("50")));
        cost.setDefectiveQuantity(order.getDefectiveQuantity());
        cost.setDefectiveCost(new BigDecimal(order.getDefectiveQuantity()).multiply(new BigDecimal("100")));
        cost.setTotalCost(order.getTotalCost());
        cost.setProductionQuantity(order.getActualQuantity());

        if (order.getActualQuantity() > 0) {
            cost.setUnitCost(order.getTotalCost().divide(
                new BigDecimal(order.getActualQuantity()), 2, RoundingMode.HALF_UP
            ));
        }

        productionCostMapper.insert(cost);
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean suspendOrder(Long orderId) {
        ProductionOrderPO order = getById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (order.getStatus() > 2) {
            throw new BusinessException("工单已开始生产，无法搁置");
        }
        order.setStatus(9);
        return updateById(order);
    }

    private String generateOrderNo() {
        return "WO-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    private void initProcesses(Long orderId) {
        String[][] processes = {
            {"SLITTING", "开平分条"},
            {"CUTTING", "精准裁切"},
            {"STACKING", "叠压成型"},
            {"GRINDING", "端面打磨"},
            {"COATING", "绝缘喷涂"},
            {"FINISHED", "成品入库"}
        };

        for (String[] p : processes) {
            OrderProcessPO process = new OrderProcessPO();
            process.setOrderId(orderId);
            process.setProcessCode(p[0]);
            process.setProcessName(p[1]);
            process.setStatus(1);
            process.setCreateTime(LocalDateTime.now());
            orderProcessMapper.insert(process);
        }
    }

    private int getProcessStatus(String processCode) {
        Map<String, Integer> statusMap = Map.of(
            "SLITTING", 3,
            "CUTTING", 4,
            "STACKING", 5,
            "GRINDING", 6,
            "COATING", 7,
            "FINISHED", 8
        );
        return statusMap.getOrDefault(processCode, 1);
    }

    private String getProcessName(String processCode) {
        Map<String, String> nameMap = Map.of(
            "SLITTING", "开平分条",
            "CUTTING", "精准裁切",
            "STACKING", "叠压成型",
            "GRINDING", "端面打磨",
            "COATING", "绝缘喷涂",
            "FINISHED", "成品入库"
        );
        return nameMap.getOrDefault(processCode, "未知工序");
    }

    private ProductionOrderVO convertToVO(ProductionOrderPO po) {
        ProductionOrderVO vo = new ProductionOrderVO();
        BeanUtils.copyProperties(po, vo);

        Map<Integer, String> statusMap = Map.of(
            1, "待排产",
            2, "已排产",
            3, "开平分条中",
            4, "精准裁切中",
            5, "叠压成型中",
            6, "端面打磨中",
            7, "绝缘喷涂中",
            8, "已完成",
            9, "已搁置"
        );
        vo.setStatusDesc(statusMap.getOrDefault(po.getStatus(), "未知"));

        Map<Integer, String> priorityMap = Map.of(1, "普通", 2, "紧急", 3, "特急");
        vo.setPriorityDesc(priorityMap.getOrDefault(po.getPriority(), "未知"));

        CoreCategoryPO category = coreCategoryMapper.selectById(po.getCategoryId());
        if (category != null) {
            vo.setCategoryName(category.getCategoryName());
        }

        MaterialPO material = materialMapper.selectById(po.getMaterialId());
        if (material != null) {
            vo.setMaterialName(material.getMaterialName());
            vo.setBatchCode(material.getBatchCode());
        }

        return vo;
    }

    private OrderProcessVO convertProcessToVO(OrderProcessPO po) {
        OrderProcessVO vo = new OrderProcessVO();
        BeanUtils.copyProperties(po, vo);
        vo.setStatusDesc(po.getStatus() == 1 ? "待开始" : po.getStatus() == 2 ? "进行中" : "已完成");
        return vo;
    }
}
