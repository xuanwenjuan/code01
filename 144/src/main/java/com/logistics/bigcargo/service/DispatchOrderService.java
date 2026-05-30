package com.logistics.bigcargo.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.logistics.bigcargo.dto.*;
import com.logistics.bigcargo.entity.DispatchOrder;
import com.logistics.bigcargo.entity.Inventory;
import com.logistics.bigcargo.entity.User;
import com.logistics.bigcargo.entity.Vehicle;
import com.logistics.bigcargo.enums.OrderStatusEnum;
import com.logistics.bigcargo.enums.RoleEnum;
import com.logistics.bigcargo.enums.StockStatusEnum;
import com.logistics.bigcargo.enums.VehicleStatusEnum;
import com.logistics.bigcargo.exception.BusinessException;
import com.logistics.bigcargo.mapper.DispatchOrderMapper;
import com.logistics.bigcargo.mapper.InventoryMapper;
import com.logistics.bigcargo.mapper.UserMapper;
import com.logistics.bigcargo.mapper.VehicleMapper;
import com.logistics.bigcargo.util.OperationLogUtil;
import com.logistics.bigcargo.vo.DispatchStatisticsVO;
import com.logistics.bigcargo.vo.VehicleMatchResultVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class DispatchOrderService {

    @Autowired
    private DispatchOrderMapper dispatchOrderMapper;

    @Autowired
    private InventoryMapper inventoryMapper;

    @Autowired
    private VehicleMapper vehicleMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private OperationLogUtil operationLogUtil;

    @Autowired
    private InventoryService inventoryService;

    @Transactional(rollbackFor = Exception.class)
    public void createOrder(DispatchOrderDTO dto, Long operatorId, String operatorName) {
        String orderNo = generateOrderNo();

        DispatchOrder order = new DispatchOrder();
        order.setOrderNo(orderNo);
        order.setInventoryId(dto.getInventoryId());
        order.setCategoryId(dto.getCategoryId());
        order.setCustomerName(dto.getCustomerName());
        order.setCustomerPhone(dto.getCustomerPhone());
        order.setPickupAddress(dto.getPickupAddress());
        order.setDeliveryAddress(dto.getDeliveryAddress());
        order.setDistance(dto.getDistance());
        order.setVehicleId(dto.getVehicleId());
        order.setDriverId(dto.getDriverId());
        order.setSorterId(dto.getSorterId());
        order.setOrderStatus(OrderStatusEnum.PENDING_STOCK_IN.getCode());
        order.setPriority(dto.getPriority());
        order.setExpectArriveTime(dto.getExpectArriveTime());
        order.setRemark(dto.getRemark());

        if (dto.getInventoryId() != null) {
            Inventory inventory = inventoryMapper.selectById(dto.getInventoryId());
            if (inventory != null) {
                order.setCategoryId(inventory.getCategoryId());
                inventory.setStockStatus(StockStatusEnum.PENDING_SORT.getCode());
                inventoryMapper.updateById(inventory);
            }
        }

        dispatchOrderMapper.insert(order);

        operationLogUtil.log("创建工单", orderNo, "DISPATCH_ORDER",
                operatorId, operatorName, "创建调度工单，配送地址：" + dto.getDeliveryAddress());
    }

    @Transactional(rollbackFor = Exception.class)
    public void mergeSort(MergeSortDTO dto, Long operatorId, String operatorName) {
        User sorter = userMapper.selectById(dto.getSorterId());
        if (sorter == null || !RoleEnum.SORTER.getCode().equals(sorter.getRole())) {
            throw new BusinessException("分拣员不存在或角色不正确");
        }

        for (Long orderId : dto.getOrderIds()) {
            DispatchOrder order = dispatchOrderMapper.selectById(orderId);
            if (order == null) {
                continue;
            }
            if (!OrderStatusEnum.PENDING_SORT.getCode().equals(order.getOrderStatus())) {
                throw new BusinessException("工单[" + order.getOrderNo() + "]状态不支持分拣");
            }

            order.setSorterId(dto.getSorterId());
            order.setOrderStatus(OrderStatusEnum.SORTING.getCode());
            dispatchOrderMapper.updateById(order);

            if (order.getInventoryId() != null) {
                Inventory inventory = inventoryMapper.selectById(order.getInventoryId());
                if (inventory != null) {
                    inventory.setStockStatus(StockStatusEnum.SORTING.getCode());
                    inventoryMapper.updateById(inventory);
                }
            }
        }

        operationLogUtil.log("合并分拣", "BATCH", "DISPATCH_ORDER",
                operatorId, operatorName, "合并分拣" + dto.getOrderIds().size() + "个工单，分拣员：" + sorter.getRealName() +
                        (dto.getSortRemark() != null ? "，备注：" + dto.getSortRemark() : ""));
    }

    @Transactional(rollbackFor = Exception.class)
    public void completeSort(Long orderId, Long operatorId, String operatorName) {
        DispatchOrder order = dispatchOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatusEnum.SORTING.getCode().equals(order.getOrderStatus())) {
            throw new BusinessException("工单状态不支持完成分拣");
        }

        order.setOrderStatus(OrderStatusEnum.PENDING_DISPATCH.getCode());
        dispatchOrderMapper.updateById(order);

        if (order.getInventoryId() != null) {
            Inventory inventory = inventoryMapper.selectById(order.getInventoryId());
            if (inventory != null) {
                inventory.setStockStatus(StockStatusEnum.PENDING_SORT.getCode());
                inventoryMapper.updateById(inventory);
            }
        }

        operationLogUtil.log("完成分拣", order.getOrderNo(), "DISPATCH_ORDER",
                operatorId, operatorName, "工单分拣完成，等待派单");
    }

    public VehicleMatchResultVO smartMatchVehicle(VehicleMatchDTO dto) {
        DispatchOrder order = dispatchOrderMapper.selectById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        BigDecimal weight = dto.getTotalWeight();
        BigDecimal volume = dto.getTotalVolume();

        if (weight == null && order.getInventoryId() != null) {
            Inventory inventory = inventoryMapper.selectById(order.getInventoryId());
            if (inventory != null) {
                weight = inventory.getWeight();
                volume = inventory.getVolume();
            }
        }

        List<Vehicle> allVehicles = vehicleMapper.selectList(new LambdaQueryWrapper<Vehicle>()
                .eq(Vehicle::getStatus, VehicleStatusEnum.IDLE.getCode()));

        List<Vehicle> matchedVehicles = new ArrayList<>();
        Vehicle bestMatch = null;

        for (Vehicle vehicle : allVehicles) {
            boolean weightOk = weight == null || vehicle.getLoadCapacity().compareTo(weight) >= 0;
            boolean volumeOk = volume == null || vehicle.getVolumeCapacity().compareTo(volume) >= 0;

            if (weightOk && volumeOk) {
                matchedVehicles.add(vehicle);
            }
        }

        if (!matchedVehicles.isEmpty()) {
            bestMatch = matchedVehicles.stream()
                    .min(Comparator.comparing(v -> v.getLoadCapacity().add(v.getVolumeCapacity())))
                    .orElse(null);
        }

        VehicleMatchResultVO result = new VehicleMatchResultVO();
        result.setMatchedVehicles(matchedVehicles);
        result.setBestMatch(bestMatch);
        if (bestMatch != null) {
            result.setMatchReason("最佳匹配车辆：" + bestMatch.getPlateNo() + "，载重" + bestMatch.getLoadCapacity() + "吨，容积" + bestMatch.getVolumeCapacity() + "方");
        } else {
            result.setMatchReason("暂无合适车辆");
        }

        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateTransitTrack(TransitTrackDTO dto, Long operatorId, String operatorName) {
        DispatchOrder order = dispatchOrderMapper.selectById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatusEnum.IN_TRANSIT.getCode().equals(order.getOrderStatus())) {
            throw new BusinessException("工单不在运输中状态");
        }

        operationLogUtil.log("在途追踪", order.getOrderNo(), "DISPATCH_ORDER",
                operatorId, operatorName, "当前位置：" + dto.getCurrentLocation() +
                        (dto.getTrackRemark() != null ? "，备注：" + dto.getTrackRemark() : ""));
    }

    @Transactional(rollbackFor = Exception.class)
    public void signVerify(SignVerifyDTO dto, Long operatorId, String operatorName) {
        DispatchOrder order = dispatchOrderMapper.selectById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatusEnum.PENDING_SIGN.getCode().equals(order.getOrderStatus())) {
            throw new BusinessException("工单状态不支持签收");
        }

        if (dto.getAbnormalFlag()) {
            order.setOrderStatus(OrderStatusEnum.PENDING_SIGN.getCode());
        } else {
            order.setOrderStatus(OrderStatusEnum.COMPLETED.getCode());
            order.setActualArriveTime(LocalDateTime.now());

            if (order.getVehicleId() != null) {
                Vehicle vehicle = vehicleMapper.selectById(order.getVehicleId());
                if (vehicle != null) {
                    vehicle.setStatus(VehicleStatusEnum.IDLE.getCode());
                    vehicleMapper.updateById(vehicle);
                }
            }

            if (order.getInventoryId() != null) {
                Inventory inventory = inventoryMapper.selectById(order.getInventoryId());
                if (inventory != null) {
                    inventory.setStockStatus(StockStatusEnum.DISPATCHED.getCode());
                    inventoryMapper.updateById(inventory);
                }
            }
        }

        dispatchOrderMapper.updateById(order);

        String signStatus = dto.getAbnormalFlag() ? "异常" : "正常";
        operationLogUtil.log("签收核验", order.getOrderNo(), "DISPATCH_ORDER",
                operatorId, operatorName, "签收人：" + dto.getSignerName() + "，签收状态：" + signStatus +
                        (dto.getAbnormalFlag() && dto.getAbnormalDesc() != null ? "，异常描述：" + dto.getAbnormalDesc() : "") +
                        (dto.getSignRemark() != null ? "，备注：" + dto.getSignRemark() : ""));
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateOrderStatus(Long orderId, Integer targetStatus, Long operatorId, String operatorName) {
        DispatchOrder order = dispatchOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        Integer currentStatus = order.getOrderStatus();
        if (!OrderStatusEnum.isValidTransition(currentStatus, targetStatus)) {
            throw new BusinessException("无效的工单状态流转");
        }

        order.setOrderStatus(targetStatus);

        if (OrderStatusEnum.COMPLETED.getCode().equals(targetStatus)) {
            order.setActualArriveTime(LocalDateTime.now());
            if (order.getVehicleId() != null) {
                Vehicle vehicle = vehicleMapper.selectById(order.getVehicleId());
                if (vehicle != null) {
                    vehicle.setStatus(VehicleStatusEnum.IDLE.getCode());
                    vehicleMapper.updateById(vehicle);
                }
            }
            if (order.getInventoryId() != null) {
                Inventory inventory = inventoryMapper.selectById(order.getInventoryId());
                if (inventory != null) {
                    inventory.setStockStatus(StockStatusEnum.DISPATCHED.getCode());
                    inventoryMapper.updateById(inventory);
                }
            }
        }

        if (OrderStatusEnum.IN_TRANSIT.getCode().equals(targetStatus) && order.getVehicleId() != null) {
            Vehicle vehicle = vehicleMapper.selectById(order.getVehicleId());
            if (vehicle != null) {
                vehicle.setStatus(VehicleStatusEnum.IN_TRANSIT.getCode());
                vehicleMapper.updateById(vehicle);
            }
        }

        dispatchOrderMapper.updateById(order);

        operationLogUtil.log("状态流转", order.getOrderNo(), "DISPATCH_ORDER",
                operatorId, operatorName, "工单状态变更为：" + OrderStatusEnum.getDesc(targetStatus));
    }

    @Transactional(rollbackFor = Exception.class)
    public void assignVehicle(Long orderId, Long vehicleId, Long driverId, Long operatorId, String operatorName) {
        DispatchOrder order = dispatchOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        if (!OrderStatusEnum.PENDING_DISPATCH.getCode().equals(order.getOrderStatus())) {
            throw new BusinessException("工单状态不支持派单");
        }

        Vehicle vehicle = vehicleMapper.selectById(vehicleId);
        if (vehicle == null || !VehicleStatusEnum.IDLE.getCode().equals(vehicle.getStatus())) {
            throw new BusinessException("车辆不可用");
        }

        if (order.getInventoryId() != null) {
            Inventory inventory = inventoryMapper.selectById(order.getInventoryId());
            if (inventory != null) {
                boolean locked = inventoryService.lockInventoryStock(
                        order.getInventoryId(),
                        inventory.getQuantity(),
                        "工单派单：" + order.getOrderNo()
                );
                if (!locked) {
                    throw new BusinessException("库存锁定失败，请稍后重试");
                }
            }
        }

        order.setVehicleId(vehicleId);
        order.setDriverId(driverId);
        order.setOrderStatus(OrderStatusEnum.DISPATCHED.getCode());
        dispatchOrderMapper.updateById(order);

        operationLogUtil.log("派单", order.getOrderNo(), "DISPATCH_ORDER",
                operatorId, operatorName, "指派车辆：" + vehicle.getPlateNo() + "，司机ID：" + driverId);
    }

    @Transactional(rollbackFor = Exception.class)
    public void assignSorter(Long orderId, Long sorterId, Long operatorId, String operatorName) {
        DispatchOrder order = dispatchOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        order.setSorterId(sorterId);
        order.setOrderStatus(OrderStatusEnum.SORTING.getCode());
        dispatchOrderMapper.updateById(order);

        operationLogUtil.log("分拣指派", order.getOrderNo(), "DISPATCH_ORDER",
                operatorId, operatorName, "指派分拣员ID：" + sorterId);
    }

    public DispatchOrder getOrderById(Long id) {
        return dispatchOrderMapper.selectById(id);
    }

    public Page<DispatchOrder> getOrderPage(Integer pageNum, Integer pageSize,
                                            Integer orderStatus, Long driverId, Long categoryId,
                                            Long sorterId, String customerName, String orderNo) {
        LambdaQueryWrapper<DispatchOrder> wrapper = new LambdaQueryWrapper<>();
        if (orderStatus != null) {
            wrapper.eq(DispatchOrder::getOrderStatus, orderStatus);
        }
        if (driverId != null) {
            wrapper.eq(DispatchOrder::getDriverId, driverId);
        }
        if (categoryId != null) {
            wrapper.eq(DispatchOrder::getCategoryId, categoryId);
        }
        if (sorterId != null) {
            wrapper.eq(DispatchOrder::getSorterId, sorterId);
        }
        if (customerName != null && !customerName.isEmpty()) {
            wrapper.like(DispatchOrder::getCustomerName, customerName);
        }
        if (orderNo != null && !orderNo.isEmpty()) {
            wrapper.like(DispatchOrder::getOrderNo, orderNo);
        }
        wrapper.orderByDesc(DispatchOrder::getPriority)
                .orderByDesc(DispatchOrder::getCreateTime);

        return dispatchOrderMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    public List<DispatchOrder> getTimeoutOrders() {
        LocalDateTime twoHoursAgo = LocalDateTime.now().minusHours(2);
        return dispatchOrderMapper.selectList(new LambdaQueryWrapper<DispatchOrder>()
                .in(DispatchOrder::getOrderStatus,
                        OrderStatusEnum.PENDING_STOCK_IN.getCode(),
                        OrderStatusEnum.PENDING_SORT.getCode(),
                        OrderStatusEnum.PENDING_DISPATCH.getCode())
                .lt(DispatchOrder::getCreateTime, twoHoursAgo));
    }

    @Transactional(rollbackFor = Exception.class)
    public void timeoutHandle() {
        List<DispatchOrder> timeoutOrders = getTimeoutOrders();
        for (DispatchOrder order : timeoutOrders) {
            order.setOrderStatus(OrderStatusEnum.SHELVED.getCode());
            dispatchOrderMapper.updateById(order);
            operationLogUtil.log("超时搁置", order.getOrderNo(), "DISPATCH_ORDER",
                    0L, "系统", "工单超时未处理，自动搁置");
        }
    }

    public DispatchStatisticsVO getStatistics() {
        DispatchStatisticsVO vo = new DispatchStatisticsVO();

        vo.setTotalOrders(dispatchOrderMapper.selectCount(new LambdaQueryWrapper<>()));
        vo.setPendingStockIn(dispatchOrderMapper.selectCount(new LambdaQueryWrapper<DispatchOrder>()
                .eq(DispatchOrder::getOrderStatus, OrderStatusEnum.PENDING_STOCK_IN.getCode())));
        vo.setPendingSort(dispatchOrderMapper.selectCount(new LambdaQueryWrapper<DispatchOrder>()
                .eq(DispatchOrder::getOrderStatus, OrderStatusEnum.PENDING_SORT.getCode())));
        vo.setPendingDispatch(dispatchOrderMapper.selectCount(new LambdaQueryWrapper<DispatchOrder>()
                .eq(DispatchOrder::getOrderStatus, OrderStatusEnum.PENDING_DISPATCH.getCode())));
        vo.setInTransit(dispatchOrderMapper.selectCount(new LambdaQueryWrapper<DispatchOrder>()
                .eq(DispatchOrder::getOrderStatus, OrderStatusEnum.IN_TRANSIT.getCode())));
        vo.setCompleted(dispatchOrderMapper.selectCount(new LambdaQueryWrapper<DispatchOrder>()
                .eq(DispatchOrder::getOrderStatus, OrderStatusEnum.COMPLETED.getCode())));
        vo.setShelved(dispatchOrderMapper.selectCount(new LambdaQueryWrapper<DispatchOrder>()
                .eq(DispatchOrder::getOrderStatus, OrderStatusEnum.SHELVED.getCode())));

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime tomorrowStart = LocalDate.now().plusDays(1).atStartOfDay();

        vo.setTodayNew(dispatchOrderMapper.selectCount(new LambdaQueryWrapper<DispatchOrder>()
                .ge(DispatchOrder::getCreateTime, todayStart)
                .lt(DispatchOrder::getCreateTime, tomorrowStart)));
        vo.setTodayCompleted(dispatchOrderMapper.selectCount(new LambdaQueryWrapper<DispatchOrder>()
                .eq(DispatchOrder::getOrderStatus, OrderStatusEnum.COMPLETED.getCode())
                .ge(DispatchOrder::getActualArriveTime, todayStart)
                .lt(DispatchOrder::getActualArriveTime, tomorrowStart)));

        return vo;
    }

    public Page<DispatchOrder> queryOrderPage(DispatchOrderQueryDTO dto) {
        LambdaQueryWrapper<DispatchOrder> wrapper = new LambdaQueryWrapper<>();

        if (dto.getOrderNo() != null && !dto.getOrderNo().isEmpty()) {
            wrapper.like(DispatchOrder::getOrderNo, dto.getOrderNo());
        }
        if (dto.getOrderStatus() != null) {
            wrapper.eq(DispatchOrder::getOrderStatus, dto.getOrderStatus());
        }
        if (dto.getOrderStatuses() != null && !dto.getOrderStatuses().isEmpty()) {
            wrapper.in(DispatchOrder::getOrderStatus, dto.getOrderStatuses());
        }
        if (dto.getCategoryId() != null) {
            wrapper.eq(DispatchOrder::getCategoryId, dto.getCategoryId());
        }
        if (dto.getDriverId() != null) {
            wrapper.eq(DispatchOrder::getDriverId, dto.getDriverId());
        }
        if (dto.getSorterId() != null) {
            wrapper.eq(DispatchOrder::getSorterId, dto.getSorterId());
        }
        if (dto.getVehicleId() != null) {
            wrapper.eq(DispatchOrder::getVehicleId, dto.getVehicleId());
        }
        if (dto.getCustomerName() != null && !dto.getCustomerName().isEmpty()) {
            wrapper.like(DispatchOrder::getCustomerName, dto.getCustomerName());
        }
        if (dto.getCustomerPhone() != null && !dto.getCustomerPhone().isEmpty()) {
            wrapper.like(DispatchOrder::getCustomerPhone, dto.getCustomerPhone());
        }
        if (dto.getDeliveryAddress() != null && !dto.getDeliveryAddress().isEmpty()) {
            wrapper.like(DispatchOrder::getDeliveryAddress, dto.getDeliveryAddress());
        }
        if (dto.getMinDistance() != null) {
            wrapper.ge(DispatchOrder::getDistance, dto.getMinDistance());
        }
        if (dto.getMaxDistance() != null) {
            wrapper.le(DispatchOrder::getDistance, dto.getMaxDistance());
        }
        if (dto.getPriority() != null) {
            wrapper.ge(DispatchOrder::getPriority, dto.getPriority());
        }
        if (dto.getStartTime() != null) {
            wrapper.ge(DispatchOrder::getCreateTime, dto.getStartTime());
        }
        if (dto.getEndTime() != null) {
            wrapper.le(DispatchOrder::getCreateTime, dto.getEndTime());
        }
        if (dto.getExpectArriveStartTime() != null) {
            wrapper.ge(DispatchOrder::getExpectArriveTime, dto.getExpectArriveStartTime());
        }
        if (dto.getExpectArriveEndTime() != null) {
            wrapper.le(DispatchOrder::getExpectArriveTime, dto.getExpectArriveEndTime());
        }

        wrapper.orderByDesc(DispatchOrder::getPriority)
                .orderByDesc(DispatchOrder::getCreateTime);

        return dispatchOrderMapper.selectPage(new Page<>(dto.getPageNum(), dto.getPageSize()), wrapper);
    }

    private String generateOrderNo() {
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        Long count = dispatchOrderMapper.selectCount(new LambdaQueryWrapper<DispatchOrder>()
                .like(DispatchOrder::getOrderNo, "DD" + datePrefix));
        String sequence = String.format("%04d", count + 1);
        return "DD" + datePrefix + sequence;
    }
}
