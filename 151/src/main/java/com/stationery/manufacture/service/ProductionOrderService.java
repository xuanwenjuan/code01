package com.stationery.manufacture.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.stationery.manufacture.common.BusinessException;
import com.stationery.manufacture.common.ErrorCode;
import com.stationery.manufacture.common.UserContext;
import com.stationery.manufacture.entity.OrderMaterial;
import com.stationery.manufacture.entity.OrderProcess;
import com.stationery.manufacture.entity.ProductionOrder;
import com.stationery.manufacture.mapper.MaterialStockMapper;
import com.stationery.manufacture.mapper.OrderMaterialMapper;
import com.stationery.manufacture.mapper.OrderProcessMapper;
import com.stationery.manufacture.mapper.ProductionOrderMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class ProductionOrderService {

    private final ProductionOrderMapper orderMapper;
    private final OrderProcessMapper processMapper;
    private final OrderMaterialMapper materialMapper;
    private final MaterialStockMapper stockMapper;
    private final StringRedisTemplate redisTemplate;

    private static final List<String> DEFAULT_PROCESSES = Arrays.asList(
            "原料裁切加工", "图案印花组装", "油墨灌注", "装帧装订",
            "瑕疵检验", "塑封包装", "成品入库"
    );

    public ProductionOrderService(ProductionOrderMapper orderMapper,
                                  OrderProcessMapper processMapper,
                                  OrderMaterialMapper materialMapper,
                                  MaterialStockMapper stockMapper,
                                  StringRedisTemplate redisTemplate) {
        this.orderMapper = orderMapper;
        this.processMapper = processMapper;
        this.materialMapper = materialMapper;
        this.stockMapper = stockMapper;
        this.redisTemplate = redisTemplate;
    }

    @Transactional(rollbackFor = Exception.class)
    public void createOrder(ProductionOrder order) {
        order.setOrderNo(generateOrderNo());
        order.setOrderStatus(0);
        order.setCreateTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());

        if (order.getPriority() == null) {
            order.setPriority(1);
        }
        if (order.getQualifiedQuantity() == null) {
            order.setQualifiedQuantity(0);
        }
        if (order.getDefectiveQuantity() == null) {
            order.setDefectiveQuantity(0);
        }

        orderMapper.insert(order);
        initOrderProcesses(order.getId());
    }

    private void initOrderProcesses(Long orderId) {
        for (int i = 0; i < DEFAULT_PROCESSES.size(); i++) {
            OrderProcess process = new OrderProcess();
            process.setOrderId(orderId);
            process.setProcessCode("PROC_" + (i + 1));
            process.setProcessName(DEFAULT_PROCESSES.get(i));
            process.setProcessSort(i + 1);
            process.setProcessStatus(0);
            process.setCreateTime(LocalDateTime.now());
            process.setUpdateTime(LocalDateTime.now());
            processMapper.insert(process);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateOrder(ProductionOrder order) {
        ProductionOrder exist = orderMapper.selectById(order.getId());
        if (exist == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }
        if (exist.getOrderStatus() > 1) {
            throw new BusinessException("工单已开始生产，无法修改");
        }
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteOrder(Long id) {
        ProductionOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }
        if (order.getOrderStatus() > 1) {
            throw new BusinessException("工单已开始生产，无法删除");
        }
        orderMapper.deleteById(id);
        processMapper.delete(new LambdaQueryWrapper<OrderProcess>().eq(OrderProcess::getOrderId, id));
        materialMapper.delete(new LambdaQueryWrapper<OrderMaterial>().eq(OrderMaterial::getOrderId, id));
    }

    public ProductionOrder getOrderById(Long id) {
        ProductionOrder order = orderMapper.selectById(id);
        if (order != null) {
            order.setProcesses(processMapper.selectList(new LambdaQueryWrapper<OrderProcess>()
                    .eq(OrderProcess::getOrderId, id)
                    .orderByAsc(OrderProcess::getProcessSort)));
            order.setMaterials(materialMapper.selectList(new LambdaQueryWrapper<OrderMaterial>()
                    .eq(OrderMaterial::getOrderId, id)));
        }
        return order;
    }

    public Page<ProductionOrder> getOrderPage(Integer pageNum, Integer pageSize,
                                              Integer orderStatus, String productName,
                                              Long categoryId, Integer priority) {
        Page<ProductionOrder> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();

        if (orderStatus != null) {
            wrapper.eq(ProductionOrder::getOrderStatus, orderStatus);
        }
        if (StringUtils.hasText(productName)) {
            wrapper.like(ProductionOrder::getProductName, productName);
        }
        if (categoryId != null) {
            wrapper.eq(ProductionOrder::getCategoryId, categoryId);
        }
        if (priority != null) {
            wrapper.eq(ProductionOrder::getPriority, priority);
        }

        wrapper.orderByDesc(ProductionOrder::getPriority)
                .orderByDesc(ProductionOrder::getCreateTime);
        return orderMapper.selectPage(page, wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    public void startProduction(Long id) {
        ProductionOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }
        if (order.getOrderStatus() != 0 && order.getOrderStatus() != 9) {
            throw new BusinessException(ErrorCode.STATUS_ERROR);
        }

        order.setOrderStatus(1);
        order.setActualStartTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.updateById(order);

        startNextProcess(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void completeProcess(Long orderId, Long processId, BigDecimal workingHours, String remark) {
        OrderProcess process = processMapper.selectById(processId);
        if (process == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }
        if (process.getProcessStatus() != 1) {
            throw new BusinessException(ErrorCode.STATUS_ERROR);
        }

        process.setProcessStatus(2);
        process.setEndTime(LocalDateTime.now());
        process.setWorkingHours(workingHours);
        process.setProcessRemark(remark);
        process.setOperatorId(UserContext.getCurrentUserId());
        process.setOperatorName(UserContext.getCurrentUsername());
        process.setUpdateTime(LocalDateTime.now());
        processMapper.updateById(process);

        boolean hasNext = startNextProcess(orderId);
        if (!hasNext) {
            completeOrder(orderId);
        }
    }

    private boolean startNextProcess(Long orderId) {
        List<OrderProcess> processes = processMapper.selectList(new LambdaQueryWrapper<OrderProcess>()
                .eq(OrderProcess::getOrderId, orderId)
                .orderByAsc(OrderProcess::getProcessSort));

        for (OrderProcess process : processes) {
            if (process.getProcessStatus() == 0) {
                process.setProcessStatus(1);
                process.setStartTime(LocalDateTime.now());
                process.setUpdateTime(LocalDateTime.now());
                processMapper.updateById(process);

                updateOrderStatus(orderId, processes);
                return true;
            }
        }
        return false;
    }

    private void updateOrderStatus(Long orderId, List<OrderProcess> processes) {
        long completed = processes.stream().filter(p -> p.getProcessStatus() == 2).count();
        long total = processes.size();
        int newStatus;

        if (completed == 0) {
            newStatus = 1;
        } else if (completed < total) {
            newStatus = 2;
        } else {
            newStatus = 3;
        }

        orderMapper.update(null, new LambdaUpdateWrapper<ProductionOrder>()
                .eq(ProductionOrder::getId, orderId)
                .set(ProductionOrder::getOrderStatus, newStatus)
                .set(ProductionOrder::getUpdateTime, LocalDateTime.now()));
    }

    private void completeOrder(Long orderId) {
        orderMapper.update(null, new LambdaUpdateWrapper<ProductionOrder>()
                .eq(ProductionOrder::getId, orderId)
                .set(ProductionOrder::getOrderStatus, 4)
                .set(ProductionOrder::getActualEndTime, LocalDateTime.now())
                .set(ProductionOrder::getUpdateTime, LocalDateTime.now()));
    }

    @Transactional(rollbackFor = Exception.class)
    public void qualityInspection(Long orderId, Integer qualified, Integer defective) {
        ProductionOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }
        if (order.getOrderStatus() != 4) {
            throw new BusinessException(ErrorCode.STATUS_ERROR);
        }

        order.setQualifiedQuantity(qualified);
        order.setDefectiveQuantity(defective);
        order.setInspectionUserId(UserContext.getCurrentUserId());
        order.setInspectionUserName(UserContext.getCurrentUsername());
        order.setOrderStatus(5);
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void finishOrder(Long id) {
        ProductionOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }
        if (order.getOrderStatus() != 5) {
            throw new BusinessException(ErrorCode.STATUS_ERROR);
        }

        order.setOrderStatus(6);
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void addMaterial(OrderMaterial material) {
        material.setTotalPrice(material.getPlannedQuantity().multiply(material.getUnitPrice()));
        material.setCreateTime(LocalDateTime.now());
        material.setUpdateTime(LocalDateTime.now());
        materialMapper.insert(material);
    }

    @Transactional(rollbackFor = Exception.class)
    public void removeMaterial(Long id) {
        materialMapper.deleteById(id);
    }

    private String generateOrderNo() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String key = "order:no:" + date;
        Long increment = redisTemplate.opsForValue().increment(key, 1);
        redisTemplate.expire(key, 1, TimeUnit.DAYS);
        return "PO" + date + String.format("%05d", increment);
    }

    @Transactional(rollbackFor = Exception.class)
    public void suspendOverdueOrders() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(7);
        List<ProductionOrder> orders = orderMapper.selectList(new LambdaQueryWrapper<ProductionOrder>()
                .in(ProductionOrder::getOrderStatus, 0, 9)
                .lt(ProductionOrder::getCreateTime, threshold));

        for (ProductionOrder order : orders) {
            order.setOrderStatus(9);
            order.setUpdateTime(LocalDateTime.now());
            orderMapper.updateById(order);
        }
    }
}
