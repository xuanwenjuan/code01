package com.woodendoor.production.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.woodendoor.production.annotation.OperationLog;
import com.woodendoor.production.context.UserContext;
import com.woodendoor.production.entity.OrderProcess;
import com.woodendoor.production.entity.ProductionOrder;
import com.woodendoor.production.exception.BusinessException;
import com.woodendoor.production.mapper.OrderProcessMapper;
import com.woodendoor.production.mapper.ProductionOrderMapper;
import com.woodendoor.production.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class ProductionOrderService extends ServiceImpl<ProductionOrderMapper, ProductionOrder> {

    private final OrderProcessMapper orderProcessMapper;
    private final RedisUtil redisUtil;
    private final MaterialService materialService;

    private static final String ORDER_CACHE_KEY = "order:";
    private static final String PROCESS_CACHE_KEY = "order:process:";

    public String generateOrderNo() {
        String prefix = "WO";
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = String.format("%04d", new Random().nextInt(10000));
        return prefix + date + random;
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "生产工单", operation = "创建工单")
    public void createOrder(ProductionOrder order) {
        order.setOrderNo(generateOrderNo());
        order.setStatus(1);
        order.setCurrentProcess(0);
        order.setIsConfirmed(0);
        save(order);

        List<OrderProcess> processList = initProcessList(order);
        for (OrderProcess process : processList) {
            orderProcessMapper.insert(process);
        }

        clearOrderCache(order.getId());
    }

    private List<OrderProcess> initProcessList(ProductionOrder order) {
        List<OrderProcess> processList = new ArrayList<>();
        String[][] processes = {
                {"1", "原木开料裁切"},
                {"2", "刨光打磨"},
                {"3", "榫卯拼接"},
                {"4", "烤漆上色"},
                {"5", "五金组装"},
                {"6", "密封性检测"},
                {"7", "打包出库"}
        };

        for (int i = 0; i < processes.length; i++) {
            OrderProcess process = new OrderProcess();
            process.setOrderId(order.getId());
            process.setOrderNo(order.getOrderNo());
            process.setProcessType(Integer.parseInt(processes[i][0]));
            process.setProcessName(processes[i][1]);
            process.setSort(i + 1);
            process.setStatus(0);
            processList.add(process);
        }
        return processList;
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "生产工单", operation = "确认工单方案")
    public void confirmOrder(Long orderId) {
        ProductionOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (order.getIsConfirmed() == 1) {
            throw new BusinessException("工单方案已确认，不可重复确认");
        }
        if (order.getStatus() == 4) {
            throw new BusinessException("工单已暂停，无法确认");
        }

        if (order.getMaterialId() == null) {
            throw new BusinessException("请先选择原料");
        }
        if (order.getWoodQuantity() == null || order.getWoodQuantity().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new BusinessException("请填写正确的木材用量");
        }

        materialService.lockMaterial(orderId, order.getOrderNo(), order.getMaterialId(), 
                order.getWoodQuantity(), "工单方案确认锁定库存");

        order.setIsConfirmed(1);
        order.setConfirmTime(LocalDateTime.now());
        order.setConfirmUserId(UserContext.getUserId());
        order.setConfirmUserName(UserContext.getUser().getRealName());
        updateById(order);

        clearOrderCache(orderId);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "生产工单", operation = "取消工单确认")
    public void cancelConfirm(Long orderId) {
        ProductionOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (order.getIsConfirmed() == 0) {
            throw new BusinessException("工单尚未确认");
        }
        if (order.getCurrentProcess() > 0) {
            throw new BusinessException("工单已开始生产，无法取消确认");
        }

        materialService.unlockMaterial(orderId, null);

        order.setIsConfirmed(0);
        order.setConfirmTime(null);
        order.setConfirmUserId(null);
        order.setConfirmUserName(null);
        updateById(order);

        clearOrderCache(orderId);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "生产工单", operation = "开始工序")
    public void startProcess(Long orderId) {
        ProductionOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        if (order.getIsConfirmed() == 0) {
            throw new BusinessException("请先确认工单方案");
        }
        if (order.getStatus() == 3) {
            throw new BusinessException("工单已完成，不可操作");
        }
        if (order.getStatus() == 4) {
            throw new BusinessException("工单已暂停，请先恢复工单");
        }

        int currentProcess = order.getCurrentProcess();
        if (currentProcess > 0) {
            OrderProcess currentProc = orderProcessMapper.selectOne(new LambdaQueryWrapper<OrderProcess>()
                    .eq(OrderProcess::getOrderId, orderId)
                    .eq(OrderProcess::getProcessType, currentProcess));
            if (currentProc != null && currentProc.getStatus() == 1) {
                throw new BusinessException("当前工序正在进行中，请先完成");
            }
        }

        int nextProcess = currentProcess + 1;
        if (nextProcess > 7) {
            throw new BusinessException("所有工序已完成");
        }

        OrderProcess process = orderProcessMapper.selectOne(new LambdaQueryWrapper<OrderProcess>()
                .eq(OrderProcess::getOrderId, orderId)
                .eq(OrderProcess::getProcessType, nextProcess));

        if (process == null) {
            throw new BusinessException("没有下一个工序");
        }

        if (currentProcess == 0) {
            order.setActualStartDate(LocalDateTime.now());
        }

        process.setStatus(1);
        process.setOperatorId(UserContext.getUserId());
        process.setOperatorName(UserContext.getUser().getRealName());
        process.setStartTime(LocalDateTime.now());
        orderProcessMapper.updateById(process);

        order.setCurrentProcess(nextProcess);
        order.setStatus(2);
        updateById(order);

        clearOrderCache(orderId);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "生产工单", operation = "完成工序")
    public void completeProcess(Long orderId, String remark) {
        ProductionOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        if (order.getStatus() == 3) {
            throw new BusinessException("工单已完成，不可操作");
        }

        int currentProcess = order.getCurrentProcess();
        if (currentProcess == 0) {
            throw new BusinessException("请先开始第一个工序");
        }

        OrderProcess process = orderProcessMapper.selectOne(new LambdaQueryWrapper<OrderProcess>()
                .eq(OrderProcess::getOrderId, orderId)
                .eq(OrderProcess::getProcessType, currentProcess));

        if (process == null) {
            throw new BusinessException("工序不存在");
        }

        if (process.getStatus() == 2) {
            throw new BusinessException("该工序已完成");
        }

        process.setStatus(2);
        process.setEndTime(LocalDateTime.now());
        process.setRemark(remark);
        orderProcessMapper.updateById(process);

        if (currentProcess == 7) {
            order.setStatus(3);
            order.setActualEndDate(LocalDateTime.now());
            materialService.deductLockedMaterial(orderId, null);
        }
        updateById(order);

        clearOrderCache(orderId);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "生产工单", operation = "暂停工单")
    public void pauseOrder(Long orderId, String reason) {
        ProductionOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (order.getStatus() == 3) {
            throw new BusinessException("工单已完成，不可暂停");
        }
        if (order.getStatus() == 4) {
            throw new BusinessException("工单已暂停");
        }
        order.setStatus(4);
        order.setRemark(reason);
        updateById(order);
        clearOrderCache(orderId);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "生产工单", operation = "恢复工单")
    public void resumeOrder(Long orderId) {
        ProductionOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (order.getStatus() != 4) {
            throw new BusinessException("工单未暂停");
        }
        order.setStatus(order.getCurrentProcess() > 0 ? 2 : 1);
        updateById(order);
        clearOrderCache(orderId);
    }

    public Page<ProductionOrder> page(Integer pageNum, Integer pageSize, Integer status, Integer isConfirmed) {
        Page<ProductionOrder> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(ProductionOrder::getStatus, status);
        }
        if (isConfirmed != null) {
            wrapper.eq(ProductionOrder::getIsConfirmed, isConfirmed);
        }
        wrapper.orderByDesc(ProductionOrder::getCreateTime);
        return page(page, wrapper);
    }

    @SuppressWarnings("unchecked")
    public List<OrderProcess> getProcessList(Long orderId) {
        String cacheKey = PROCESS_CACHE_KEY + orderId;
        List<OrderProcess> cached = (List<OrderProcess>) redisUtil.get(cacheKey);
        if (cached != null) {
            return cached;
        }
        List<OrderProcess> list = orderProcessMapper.selectList(new LambdaQueryWrapper<OrderProcess>()
                .eq(OrderProcess::getOrderId, orderId)
                .orderByAsc(OrderProcess::getSort));
        redisUtil.set(cacheKey, list, 30, TimeUnit.MINUTES);
        return list;
    }

    private void clearOrderCache(Long orderId) {
        redisUtil.delete(ORDER_CACHE_KEY + orderId);
        redisUtil.delete(PROCESS_CACHE_KEY + orderId);
    }

    public String getProcessRole(Integer processType) {
        switch (processType) {
            case 1:
            case 2:
            case 3:
            case 5:
                return "leader";
            case 4:
                return "designer";
            case 6:
                return "quality";
            case 7:
                return "leader";
            default:
                return "admin";
        }
    }
}
