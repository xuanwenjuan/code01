package com.gear.mfg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.gear.mfg.entity.OrderProcess;
import com.gear.mfg.entity.ProductionOrder;
import com.gear.mfg.exception.BusinessException;
import com.gear.mfg.mapper.OrderProcessMapper;
import com.gear.mfg.mapper.ProductionOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionOrderService {

    private final ProductionOrderMapper productionOrderMapper;
    private final OrderProcessMapper orderProcessMapper;

    private static final List<String> PROCESS_NAMES = Arrays.asList(
            "坯料粗车成型", "基准孔定位", "数控滚齿加工",
            "齿面倒角修整", "渗碳淬火", "齿向精磨", "精度检测入库"
    );

    @Transactional(rollbackFor = Exception.class)
    public void createOrder(ProductionOrder order) {
        String orderNo = generateOrderNo();
        order.setOrderNo(orderNo);
        order.setOrderStatus(1);
        order.setCurrentProcess(1);
        order.setCreateTime(LocalDateTime.now());
        productionOrderMapper.insert(order);
        initOrderProcesses(order.getId(), orderNo);
    }

    private void initOrderProcesses(Long orderId, String orderNo) {
        for (int i = 0; i < PROCESS_NAMES.size(); i++) {
            OrderProcess process = new OrderProcess();
            process.setOrderId(orderId);
            process.setOrderNo(orderNo);
            process.setProcessNo(i + 1);
            process.setProcessName(PROCESS_NAMES.get(i));
            process.setProcessStatus(i == 0 ? 1 : 0);
            process.setCreateTime(LocalDateTime.now());
            orderProcessMapper.insert(process);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void startProcess(Long orderId, Integer processNo) {
        ProductionOrder order = productionOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (order.getOrderStatus() == 5) {
            throw new BusinessException("工单已暂停，无法开工");
        }
        if (!order.getCurrentProcess().equals(processNo)) {
            throw new BusinessException("当前工序不匹配");
        }

        OrderProcess process = getOrderProcess(orderId, processNo);
        if (process.getProcessStatus() != 0) {
            throw new BusinessException("工序状态不正确");
        }

        process.setProcessStatus(1);
        process.setStartTime(LocalDateTime.now());
        process.setUpdateTime(LocalDateTime.now());
        orderProcessMapper.updateById(process);

        order.setOrderStatus(2);
        order.setActualStartDate(LocalDateTime.now());
        productionOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void completeProcess(Long orderId, Integer processNo, String checkResult) {
        ProductionOrder order = productionOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        OrderProcess process = getOrderProcess(orderId, processNo);
        if (process.getProcessStatus() != 1) {
            throw new BusinessException("工序未开始");
        }

        process.setProcessStatus(2);
        process.setEndTime(LocalDateTime.now());
        process.setCheckResult(checkResult);
        process.setUpdateTime(LocalDateTime.now());
        orderProcessMapper.updateById(process);

        if (processNo < PROCESS_NAMES.size()) {
            OrderProcess nextProcess = getOrderProcess(orderId, processNo + 1);
            nextProcess.setProcessStatus(0);
            nextProcess.setUpdateTime(LocalDateTime.now());
            orderProcessMapper.updateById(nextProcess);

            order.setCurrentProcess(processNo + 1);
            order.setOrderStatus(3);
        } else {
            order.setCurrentProcess(0);
            order.setOrderStatus(4);
            order.setActualEndDate(LocalDateTime.now());
        }
        order.setUpdateTime(LocalDateTime.now());
        productionOrderMapper.updateById(order);
    }

    private OrderProcess getOrderProcess(Long orderId, Integer processNo) {
        OrderProcess process = orderProcessMapper.selectOne(
                new LambdaQueryWrapper<OrderProcess>()
                        .eq(OrderProcess::getOrderId, orderId)
                        .eq(OrderProcess::getProcessNo, processNo)
        );
        if (process == null) {
            throw new BusinessException("工序不存在");
        }
        return process;
    }

    public List<ProductionOrder> getOrderList(Integer orderStatus) {
        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();
        if (orderStatus != null) {
            wrapper.eq(ProductionOrder::getOrderStatus, orderStatus);
        }
        wrapper.orderByDesc(ProductionOrder::getCreateTime);
        return productionOrderMapper.selectList(wrapper);
    }

    public ProductionOrder getOrderById(Long id) {
        return productionOrderMapper.selectById(id);
    }

    public List<OrderProcess> getOrderProcesses(Long orderId) {
        return orderProcessMapper.selectList(
                new LambdaQueryWrapper<OrderProcess>()
                        .eq(OrderProcess::getOrderId, orderId)
                        .orderByAsc(OrderProcess::getProcessNo)
        );
    }

    @Transactional(rollbackFor = Exception.class)
    public void pauseTimeoutOrders() {
        LocalDateTime timeoutDate = LocalDateTime.now().minusDays(1);
        List<ProductionOrder> timeoutOrders = productionOrderMapper.selectList(
                new LambdaQueryWrapper<ProductionOrder>()
                        .eq(ProductionOrder::getOrderStatus, 1)
                        .le(ProductionOrder::getPlanStartDate, timeoutDate)
        );

        for (ProductionOrder order : timeoutOrders) {
            order.setOrderStatus(5);
            order.setUpdateTime(LocalDateTime.now());
            productionOrderMapper.updateById(order);
        }
    }

    private String generateOrderNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        Long count = productionOrderMapper.selectCount(
                new LambdaQueryWrapper<ProductionOrder>()
                        .likeRight(ProductionOrder::getOrderNo, "WO" + dateStr)
        );
        return "WO" + dateStr + String.format("%04d", count + 1);
    }
}