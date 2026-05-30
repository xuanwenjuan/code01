package com.heritage.dye.service;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.heritage.dye.annotation.OperationLog;
import com.heritage.dye.annotation.RequireRole;
import com.heritage.dye.common.BusinessException;
import com.heritage.dye.context.UserContext;
import com.heritage.dye.dto.OrderStepDTO;
import com.heritage.dye.dto.ProductionOrderDTO;
import com.heritage.dye.mapper.*;
import com.heritage.dye.po.*;
import com.heritage.dye.vo.OrderStepVO;
import com.heritage.dye.vo.ProductionOrderVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductionOrderService extends ServiceImpl<ProductionOrderMapper, ProductionOrderPO> {

    @Autowired
    private OrderStepMapper orderStepMapper;

    @Autowired
    private DyeCategoryMapper dyeCategoryMapper;

    @Autowired
    private MaterialOriginMapper materialOriginMapper;

    @Autowired
    private MaterialOriginService materialOriginService;

    @Autowired
    private SupplyLedgerMapper supplyLedgerMapper;

    private static final List<String> STEP_NAMES = Arrays.asList(
            "原料精选浸泡", "熬煮提纯", "过滤沉淀", "浓缩成剂", "分装入库"
    );

    private static final BigDecimal RAW_MATERIAL_COST = new BigDecimal("50");
    private static final BigDecimal LABOR_COST_PER_STEP = new BigDecimal("20");

    @Transactional(rollbackFor = Exception.class)
    @RequireRole({"admin", "warehouse", "master"})
    @OperationLog(module = "生产工单", operation = "创建工单")
    public void create(ProductionOrderDTO dto) {
        DyeCategoryPO category = dyeCategoryMapper.selectById(dto.getDyeCategoryId());
        if (category == null || category.getStatus() == 0) {
            throw new BusinessException("染料类目不存在或已下架");
        }

        MaterialOriginPO origin = materialOriginMapper.selectById(dto.getMaterialOriginId());
        if (origin == null || origin.getStatus() == 0) {
            throw new BusinessException("原料产地不存在或已禁用");
        }

        if (origin.getCurrentStock().compareTo(dto.getMaterialQuantity()) < 0) {
            throw new BusinessException("原料库存不足");
        }

        boolean locked = materialOriginService.lockStock(dto.getMaterialOriginId(), dto.getMaterialQuantity());
        if (!locked) {
            throw new BusinessException("库存锁定失败，请重试");
        }

        String orderNo = "PO" + DateUtil.format(LocalDateTime.now(), "yyyyMMddHHmmss") +
                String.format("%04d", UserContext.getUserId() % 10000);

        ProductionOrderPO order = new ProductionOrderPO();
        BeanUtils.copyProperties(dto, order);
        order.setOrderNo(orderNo);
        order.setDyeCategoryName(category.getCategoryName());
        order.setMaterialOriginName(origin.getOriginName());
        order.setStatus(1);
        order.setCurrentStep(0);
        order.setPlanStartTime(LocalDateTime.now());
        order.setTotalLoss(BigDecimal.ZERO);
        order.setSoakLoss(BigDecimal.ZERO);
        order.setBoilLoss(BigDecimal.ZERO);
        order.setFilterLoss(BigDecimal.ZERO);
        order.setConcentrateLoss(BigDecimal.ZERO);
        order.setPackageLoss(BigDecimal.ZERO);
        baseMapper.insert(order);

        for (int i = 0; i < STEP_NAMES.size(); i++) {
            OrderStepPO step = new OrderStepPO();
            step.setOrderId(order.getId());
            step.setOrderNo(orderNo);
            step.setStepNo(i + 1);
            step.setStepName(STEP_NAMES.get(i));
            step.setStatus(0);
            step.setStepLoss(BigDecimal.ZERO);
            orderStepMapper.insert(step);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    @RequireRole({"admin", "master"})
    @OperationLog(module = "生产工单", operation = "开始工序")
    public void startStep(OrderStepDTO dto) {
        ProductionOrderPO order = baseMapper.selectById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (order.getStatus() == 9) {
            throw new BusinessException("工单已冻结，无法操作");
        }
        if (order.getStatus() == 3) {
            throw new BusinessException("工单已完成");
        }
        if (order.getCurrentStep() + 1 != dto.getStepNo()) {
            throw new BusinessException("请按顺序执行工序，当前应执行第" + (order.getCurrentStep() + 1) + "步");
        }

        LambdaQueryWrapper<OrderStepPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderStepPO::getOrderId, dto.getOrderId())
                .eq(OrderStepPO::getStepNo, dto.getStepNo());
        OrderStepPO step = orderStepMapper.selectOne(wrapper);
        if (step == null) {
            throw new BusinessException("工序不存在");
        }
        if (step.getStatus() == 1) {
            throw new BusinessException("该工序正在进行中");
        }
        if (step.getStatus() == 2) {
            throw new BusinessException("该工序已完成");
        }

        step.setStartTime(LocalDateTime.now());
        step.setOperator(UserContext.getUsername());
        step.setStatus(1);
        orderStepMapper.updateById(step);

        order.setCurrentStep(dto.getStepNo());
        order.setStatus(2);
        order.setActualStartTime(dto.getStepNo() == 1 ? LocalDateTime.now() : order.getActualStartTime());
        baseMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    @RequireRole({"admin", "master"})
    @OperationLog(module = "生产工单", operation = "完成工序")
    public void completeStep(OrderStepDTO dto) {
        ProductionOrderPO order = baseMapper.selectById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (order.getStatus() == 9) {
            throw new BusinessException("工单已冻结，无法操作");
        }
        if (order.getStatus() == 3) {
            throw new BusinessException("工单已完成");
        }
        if (order.getCurrentStep() != dto.getStepNo()) {
            throw new BusinessException("该工序尚未开始");
        }

        LambdaQueryWrapper<OrderStepPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderStepPO::getOrderId, dto.getOrderId())
                .eq(OrderStepPO::getStepNo, dto.getStepNo());
        OrderStepPO step = orderStepMapper.selectOne(wrapper);
        if (step == null || step.getStatus() != 1) {
            throw new BusinessException("该工序不在进行中");
        }

        BigDecimal stepLoss = dto.getStepLoss() != null ? dto.getStepLoss() : BigDecimal.ZERO;
        step.setEndTime(LocalDateTime.now());
        step.setStatus(2);
        step.setRemark(dto.getRemark());
        step.setStepLoss(stepLoss);
        orderStepMapper.updateById(step);

        updateOrderLoss(order, dto.getStepNo(), stepLoss);

        if (dto.getStepNo() == STEP_NAMES.size()) {
            completeOrder(order);
        } else {
            order.setStatus(2);
            baseMapper.updateById(order);
        }
    }

    private void updateOrderLoss(ProductionOrderPO order, int stepNo, BigDecimal stepLoss) {
        BigDecimal totalLoss = order.getTotalLoss().add(stepLoss);
        order.setTotalLoss(totalLoss);

        switch (stepNo) {
            case 1:
                order.setSoakLoss(stepLoss);
                break;
            case 2:
                order.setBoilLoss(stepLoss);
                break;
            case 3:
                order.setFilterLoss(stepLoss);
                break;
            case 4:
                order.setConcentrateLoss(stepLoss);
                break;
            case 5:
                order.setPackageLoss(stepLoss);
                break;
        }
    }

    private void completeOrder(ProductionOrderPO order) {
        BigDecimal actualOutput = order.getMaterialQuantity().subtract(order.getTotalLoss());
        order.setActualOutput(actualOutput.compareTo(BigDecimal.ZERO) > 0 ? actualOutput : BigDecimal.ZERO);
        order.setStatus(3);
        order.setActualEndTime(LocalDateTime.now());

        BigDecimal totalMaterialCost = order.getMaterialQuantity().multiply(RAW_MATERIAL_COST);
        BigDecimal totalLaborCost = new BigDecimal(STEP_NAMES.size()).multiply(LABOR_COST_PER_STEP);
        BigDecimal totalCost = totalMaterialCost.add(totalLaborCost);

        BigDecimal unitCost = actualOutput.compareTo(BigDecimal.ZERO) > 0
                ? totalCost.divide(actualOutput, 4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        order.setTotalCost(totalCost);
        order.setUnitCost(unitCost);
        baseMapper.updateById(order);

        materialOriginService.deductLockedStock(order.getMaterialOriginId(), order.getMaterialQuantity());

        generateSupplyLedger(order);
    }

    private void generateSupplyLedger(ProductionOrderPO order) {
        String ledgerNo = "SL" + DateUtil.format(order.getActualEndTime(), "yyyyMMdd") +
                String.format("%04d", order.getDyeCategoryId()) +
                String.format("%04d", order.getMaterialOriginId());

        LambdaQueryWrapper<SupplyLedgerPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SupplyLedgerPO::getLedgerNo, ledgerNo);
        SupplyLedgerPO existing = supplyLedgerMapper.selectOne(wrapper);

        if (existing != null) {
            existing.setMaterialConsumption(existing.getMaterialConsumption().add(order.getMaterialQuantity()));
            existing.setProductOutput(existing.getProductOutput().add(order.getActualOutput()));
            existing.setTotalLoss(existing.getTotalLoss().add(order.getTotalLoss()));
            existing.setSoakLoss(existing.getSoakLoss().add(order.getSoakLoss()));
            existing.setBoilLoss(existing.getBoilLoss().add(order.getBoilLoss()));
            existing.setFilterLoss(existing.getFilterLoss().add(order.getFilterLoss()));
            existing.setConcentrateLoss(existing.getConcentrateLoss().add(order.getConcentrateLoss()));
            existing.setPackageLoss(existing.getPackageLoss().add(order.getPackageLoss()));
            existing.setTotalCost(existing.getTotalCost().add(order.getTotalCost()));
            supplyLedgerMapper.updateById(existing);
        } else {
            SupplyLedgerPO ledger = new SupplyLedgerPO();
            ledger.setLedgerNo(ledgerNo);
            ledger.setDyeCategoryId(order.getDyeCategoryId());
            ledger.setDyeCategoryName(order.getDyeCategoryName());
            ledger.setMaterialOriginId(order.getMaterialOriginId());
            ledger.setMaterialOriginName(order.getMaterialOriginName());
            ledger.setStatisticsDate(order.getActualEndTime().toLocalDate());
            ledger.setMaterialConsumption(order.getMaterialQuantity());
            ledger.setProductOutput(order.getActualOutput());
            ledger.setTotalLoss(order.getTotalLoss());
            ledger.setSoakLoss(order.getSoakLoss());
            ledger.setBoilLoss(order.getBoilLoss());
            ledger.setFilterLoss(order.getFilterLoss());
            ledger.setConcentrateLoss(order.getConcentrateLoss());
            ledger.setPackageLoss(order.getPackageLoss());
            ledger.setUnitCost(order.getUnitCost());
            ledger.setTotalCost(order.getTotalCost());
            ledger.setSalesRevenue(BigDecimal.ZERO);
            supplyLedgerMapper.insert(ledger);
        }
    }

    public ProductionOrderVO getById(Long id) {
        ProductionOrderPO order = baseMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        return convertToVO(order);
    }

    public Page<ProductionOrderVO> page(Integer pageNum, Integer pageSize, Integer status,
                                         String keyword, Long dyeCategoryId, Long materialOriginId) {
        Page<ProductionOrderPO> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<ProductionOrderPO> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(ProductionOrderPO::getStatus, status);
        }
        if (dyeCategoryId != null) {
            wrapper.eq(ProductionOrderPO::getDyeCategoryId, dyeCategoryId);
        }
        if (materialOriginId != null) {
            wrapper.eq(ProductionOrderPO::getMaterialOriginId, materialOriginId);
        }
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(ProductionOrderPO::getOrderNo, keyword)
                    .or().like(ProductionOrderPO::getDyeCategoryName, keyword)
                    .or().like(ProductionOrderPO::getMasterName, keyword));
        }
        wrapper.orderByDesc(ProductionOrderPO::getCreateTime);
        Page<ProductionOrderPO> result = baseMapper.selectPage(page, wrapper);
        Page<ProductionOrderVO> voPage = new Page<>(result.getCurrent(), result.getSize(), result.getTotal());
        voPage.setRecords(result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList()));
        return voPage;
    }

    private ProductionOrderVO convertToVO(ProductionOrderPO order) {
        ProductionOrderVO vo = new ProductionOrderVO();
        BeanUtils.copyProperties(order, vo);
        vo.setStatusText(getStatusText(order.getStatus()));
        vo.setStepText(order.getCurrentStep() == 0 ? "未开始" : STEP_NAMES.get(order.getCurrentStep() - 1));
        LambdaQueryWrapper<OrderStepPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderStepPO::getOrderId, order.getId())
                .orderByAsc(OrderStepPO::getStepNo);
        List<OrderStepPO> steps = orderStepMapper.selectList(wrapper);
        vo.setSteps(steps.stream().map(s -> {
            OrderStepVO stepVO = new OrderStepVO();
            BeanUtils.copyProperties(s, stepVO);
            stepVO.setStatusText(getStepStatusText(s.getStatus()));
            return stepVO;
        }).collect(Collectors.toList()));
        return vo;
    }

    private String getStatusText(Integer status) {
        switch (status) {
            case 1:
                return "待生产";
            case 2:
                return "生产中";
            case 3:
                return "已完成";
            case 9:
                return "已冻结";
            default:
                return "未知";
        }
    }

    private String getStepStatusText(Integer status) {
        switch (status) {
            case 0:
                return "未开始";
            case 1:
                return "进行中";
            case 2:
                return "已完成";
            default:
                return "未知";
        }
    }

    @Transactional(rollbackFor = Exception.class)
    @RequireRole({"admin"})
    @OperationLog(module = "生产工单", operation = "取消工单")
    public void cancelOrder(Long orderId) {
        ProductionOrderPO order = baseMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (order.getStatus() == 3) {
            throw new BusinessException("已完成工单不能取消");
        }

        if (order.getStatus() == 1 || order.getStatus() == 2) {
            materialOriginService.unlockStock(order.getMaterialOriginId(), order.getMaterialQuantity());
        }

        order.setStatus(9);
        baseMapper.updateById(order);
    }

    public List<String> getStepNames() {
        return STEP_NAMES;
    }

    @Transactional(rollbackFor = Exception.class)
    public void freezeTimeoutOrders() {
        LocalDateTime timeout = LocalDateTime.now().minusDays(7);
        LambdaQueryWrapper<ProductionOrderPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(ProductionOrderPO::getStatus, 1, 2)
                .lt(ProductionOrderPO::getPlanStartTime, timeout);
        List<ProductionOrderPO> orders = baseMapper.selectList(wrapper);
        for (ProductionOrderPO order : orders) {
            order.setStatus(9);
            baseMapper.updateById(order);
        }
    }
}
