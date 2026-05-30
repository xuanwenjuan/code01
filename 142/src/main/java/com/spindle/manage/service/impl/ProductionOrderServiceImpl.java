package com.spindle.manage.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.spindle.manage.dto.OrderMaterialDetailDTO;
import com.spindle.manage.dto.ProductionOrderQueryDTO;
import com.spindle.manage.dto.QualityCheckDTO;
import com.spindle.manage.entity.*;
import com.spindle.manage.exception.BusinessException;
import com.spindle.manage.mapper.*;
import com.spindle.manage.service.MaterialInventoryService;
import com.spindle.manage.service.ProductionOrderService;
import com.spindle.manage.utils.UserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductionOrderServiceImpl extends ServiceImpl<ProductionOrderMapper, ProductionOrder> implements ProductionOrderService {

    private final OrderProcessRecordMapper orderProcessRecordMapper;
    private final OrderMaterialDetailMapper orderMaterialDetailMapper;
    private final ProductionLossRecordMapper productionLossRecordMapper;
    private final InventoryLockRecordMapper inventoryLockRecordMapper;
    private final MaterialInventoryMapper materialInventoryMapper;
    private final MaterialInventoryService materialInventoryService;

    private static final List<Integer> PROCESS_LIST = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8);
    private static final List<String> PROCESS_NAME_LIST = Arrays.asList(
            "原料切断下料", "粗车外圆", "精车台阶", "磨削成型",
            "热处理硬化", "精度检测", "轴承装配", "成品入库"
    );

    @Override
    public IPage<ProductionOrder> getOrderPage(Page<ProductionOrder> page, String orderNo, Integer orderStatus, Long categoryId) {
        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(orderNo)) {
            wrapper.like(ProductionOrder::getOrderNo, orderNo);
        }
        if (orderStatus != null) {
            wrapper.eq(ProductionOrder::getOrderStatus, orderStatus);
        }
        if (categoryId != null) {
            wrapper.eq(ProductionOrder::getCategoryId, categoryId);
        }
        wrapper.orderByDesc(ProductionOrder::getCreateTime);
        return this.page(page, wrapper);
    }

    @Override
    public IPage<ProductionOrder> queryByConditions(Page<ProductionOrder> page, ProductionOrderQueryDTO dto) {
        List<ProductionOrder> list = this.baseMapper.queryByConditions(dto);
        page.setRecords(list);
        page.setTotal(list.size());
        return page;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean createOrder(ProductionOrder order) {
        order.setOrderNo(generateOrderNo());
        order.setCurrentProcess(0);
        order.setOrderStatus(1);
        order.setMaterialPrepareStatus(0);
        order.setQualityCheckStatus(0);
        boolean result = this.save(order);

        for (int i = 0; i < PROCESS_LIST.size(); i++) {
            OrderProcessRecord record = new OrderProcessRecord();
            record.setOrderId(order.getId());
            record.setProcessCode(PROCESS_LIST.get(i));
            record.setProcessName(PROCESS_NAME_LIST.get(i));
            record.setProcessStatus(0);
            orderProcessRecordMapper.insert(record);
        }

        log.info("创建工单{}成功", order.getOrderNo());
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean startProcess(Long orderId, Integer processCode, Long operatorId) {
        ProductionOrder order = this.getById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        if (order.getOrderStatus() == 3) {
            throw new BusinessException("工单已暂停，无法开始工序");
        }
        if (order.getOrderStatus() == 4) {
            throw new BusinessException("工单已完成，无法开始工序");
        }

        if (order.getMaterialPrepareStatus() == null || order.getMaterialPrepareStatus() != 2) {
            throw new BusinessException("工单未完成备料，无法开始生产");
        }

        int processIndex = PROCESS_LIST.indexOf(processCode);
        if (processIndex == -1) {
            throw new BusinessException("工序不存在");
        }
        if (order.getCurrentProcess() != processIndex) {
            throw new BusinessException("请按顺序执行工序，当前应执行：" + PROCESS_NAME_LIST.get(order.getCurrentProcess()));
        }

        LambdaQueryWrapper<OrderProcessRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderProcessRecord::getOrderId, orderId)
                .eq(OrderProcessRecord::getProcessCode, processCode);
        OrderProcessRecord record = orderProcessRecordMapper.selectOne(wrapper);

        if (record == null) {
            throw new BusinessException("工序记录不存在");
        }
        if (record.getProcessStatus() != 0) {
            throw new BusinessException("工序已开始或已完成");
        }

        record.setProcessStatus(1);
        record.setStartTime(LocalDateTime.now());
        record.setOperatorId(operatorId);
        record.setOperatorName(UserContext.getUsername());
        orderProcessRecordMapper.updateById(record);

        if (order.getActualStartTime() == null) {
            order.setActualStartTime(LocalDateTime.now());
        }
        order.setOrderStatus(2);
        this.updateById(order);

        log.info("工单{}开始工序{}成功", order.getOrderNo(), record.getProcessName());
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean completeProcess(Long orderId, Integer processCode, Long operatorId, String remark) {
        ProductionOrder order = this.getById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        LambdaQueryWrapper<OrderProcessRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderProcessRecord::getOrderId, orderId)
                .eq(OrderProcessRecord::getProcessCode, processCode);
        OrderProcessRecord record = orderProcessRecordMapper.selectOne(wrapper);

        if (record == null) {
            throw new BusinessException("工序记录不存在");
        }
        if (record.getProcessStatus() != 1) {
            throw new BusinessException("工序未开始，无法完成");
        }

        record.setProcessStatus(2);
        record.setEndTime(LocalDateTime.now());
        if (record.getStartTime() != null) {
            long minutes = ChronoUnit.MINUTES.between(record.getStartTime(), LocalDateTime.now());
            record.setProcessDuration(minutes);
        }
        record.setRemark(remark);
        orderProcessRecordMapper.updateById(record);

        int nextProcess = order.getCurrentProcess() + 1;
        order.setCurrentProcess(nextProcess);

        if (nextProcess >= PROCESS_LIST.size()) {
            order.setOrderStatus(4);
            order.setActualEndTime(LocalDateTime.now());
            materialInventoryService.releaseInventory(orderId, null);
            log.info("工单{}所有工序已完成", order.getOrderNo());
        }
        this.updateById(order);

        log.info("工单{}完成工序{}成功", order.getOrderNo(), record.getProcessName());
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean qualityCheck(QualityCheckDTO dto) {
        ProductionOrder order = this.getById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        LambdaQueryWrapper<OrderProcessRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderProcessRecord::getOrderId, dto.getOrderId())
                .eq(OrderProcessRecord::getProcessCode, dto.getProcessCode());
        OrderProcessRecord record = orderProcessRecordMapper.selectOne(wrapper);

        if (record == null) {
            throw new BusinessException("工序记录不存在");
        }
        if (record.getProcessStatus() != 2) {
            throw new BusinessException("工序未完成，无法质检");
        }

        record.setQualityResult(dto.getQualityResult());
        record.setQualityRemark(dto.getQualityRemark());
        orderProcessRecordMapper.updateById(record);

        if ("FAIL".equals(dto.getQualityResult())) {
            record.setProcessStatus(4);
            orderProcessRecordMapper.updateById(record);
            order.setCurrentProcess(order.getCurrentProcess() - 1);
            this.updateById(order);
            log.warn("工单{}工序{}质检不通过，需要返工", order.getOrderNo(), record.getProcessName());
            throw new BusinessException("质检不通过，需要返工");
        }

        log.info("工单{}工序{}质检通过", order.getOrderNo(), record.getProcessName());
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean recordProductionLoss(Long orderId, Integer processCode, String lossType, String materialName,
                                         BigDecimal lossQuantity, BigDecimal lossAmount, String remark) {
        ProductionOrder order = this.getById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        String processName = PROCESS_NAME_LIST.get(processCode - 1);

        ProductionLossRecord lossRecord = new ProductionLossRecord();
        lossRecord.setOrderId(orderId);
        lossRecord.setOrderNo(order.getOrderNo());
        lossRecord.setProcessCode(processCode);
        lossRecord.setProcessName(processName);
        lossRecord.setLossType(lossType);
        lossRecord.setLossQuantity(lossQuantity);
        lossRecord.setLossAmount(lossAmount);
        lossRecord.setMaterialName(materialName);
        lossRecord.setRemark(remark);
        lossRecord.setOperatorId(UserContext.getUserId());
        lossRecord.setOperatorName(UserContext.getUsername());
        lossRecord.setCreateTime(LocalDateTime.now());
        productionLossRecordMapper.insert(lossRecord);

        log.info("工单{}记录生产损耗成功：{}，数量：{}，金额：{}", order.getOrderNo(), materialName, lossQuantity, lossAmount);
        return true;
    }

    @Override
    public List<OrderProcessRecord> getProcessRecords(Long orderId) {
        LambdaQueryWrapper<OrderProcessRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderProcessRecord::getOrderId, orderId)
                .orderByAsc(OrderProcessRecord::getProcessCode);
        return orderProcessRecordMapper.selectList(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean pauseOrder(Long orderId, String reason) {
        ProductionOrder order = this.getById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (order.getOrderStatus() != 2) {
            throw new BusinessException("只有生产中的工单可以暂停");
        }

        order.setOrderStatus(3);
        order.setRemark(reason);
        this.updateById(order);

        log.info("工单{}已暂停，原因：{}", order.getOrderNo(), reason);
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean resumeOrder(Long orderId) {
        ProductionOrder order = this.getById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (order.getOrderStatus() != 3) {
            throw new BusinessException("只有已暂停的工单可以恢复");
        }

        order.setOrderStatus(2);
        this.updateById(order);

        log.info("工单{}已恢复生产", order.getOrderNo());
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean cancelOrder(Long orderId, String reason) {
        ProductionOrder order = this.getById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (order.getOrderStatus() == 4) {
            throw new BusinessException("已完成的工单不能取消");
        }

        order.setOrderStatus(5);
        order.setRemark(reason);
        this.updateById(order);

        materialInventoryService.releaseInventory(orderId, null);

        log.info("工单{}已取消，原因：{}", order.getOrderNo(), reason);
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean finalQualityCheck(Long orderId, String result, String remark) {
        ProductionOrder order = this.getById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (order.getOrderStatus() != 4) {
            throw new BusinessException("只有已完成的工单可以进行成品质检");
        }

        if ("PASS".equals(result)) {
            order.setQualityCheckStatus(2);
            log.info("工单{}成品质检通过", order.getOrderNo());
        } else {
            order.setQualityCheckStatus(3);
            order.setOrderStatus(2);
            log.warn("工单{}成品质检不通过，需要返工", order.getOrderNo());
        }
        order.setRemark(remark);
        this.updateById(order);

        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean addOrderMaterialDetail(OrderMaterialDetailDTO dto) {
        ProductionOrder order = this.getById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        MaterialInventory material = materialInventoryMapper.selectById(dto.getMaterialId());
        if (material == null) {
            throw new BusinessException("物料不存在");
        }

        OrderMaterialDetail detail = new OrderMaterialDetail();
        detail.setOrderId(dto.getOrderId());
        detail.setMaterialId(dto.getMaterialId());
        detail.setMaterialName(dto.getMaterialName());
        detail.setBatchNo(dto.getBatchNo());
        detail.setMaterialType(dto.getMaterialType());
        detail.setQuantity(dto.getQuantity());
        detail.setUnit(dto.getUnit());
        detail.setUnitPrice(dto.getUnitPrice());
        if (dto.getUnitPrice() != null && dto.getQuantity() != null) {
            detail.setTotalPrice(dto.getUnitPrice().multiply(dto.getQuantity()));
        }
        detail.setReceiveTime(LocalDateTime.now());
        detail.setReceiverId(UserContext.getUserId());
        detail.setReceiverName(UserContext.getUsername());
        detail.setRemark(dto.getRemark());
        orderMaterialDetailMapper.insert(detail);

        log.info("工单{}添加用料明细成功：{}，数量：{}", order.getOrderNo(), dto.getMaterialName(), dto.getQuantity());
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchAddOrderMaterialDetail(List<OrderMaterialDetailDTO> list) {
        for (OrderMaterialDetailDTO dto : list) {
            addOrderMaterialDetail(dto);
        }
        log.info("批量添加工单用料明细成功，共{}条", list.size());
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void checkAndPauseOverdueOrders() {
        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionOrder::getOrderStatus, 1)
                .lt(ProductionOrder::getPlanStartTime, LocalDateTime.now().minusDays(1));
        List<ProductionOrder> overdueOrders = this.list(wrapper);

        for (ProductionOrder order : overdueOrders) {
            order.setOrderStatus(3);
            order.setRemark("超期未投产自动暂停");
            this.updateById(order);
            log.warn("工单{}因超期未投产已自动暂停", order.getOrderNo());
        }
    }

    private String generateOrderNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        Random random = new Random();
        int randomNum = random.nextInt(10000);
        return "WO" + dateStr + String.format("%04d", randomNum);
    }

}
