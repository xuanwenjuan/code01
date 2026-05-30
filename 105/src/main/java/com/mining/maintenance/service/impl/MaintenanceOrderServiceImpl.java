package com.mining.maintenance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mining.maintenance.constant.OrderStatusConstant;
import com.mining.maintenance.dto.MaintenanceOrderDTO;
import com.mining.maintenance.entity.*;
import com.mining.maintenance.exception.BusinessException;
import com.mining.maintenance.mapper.*;
import com.mining.maintenance.service.EquipmentAssetService;
import com.mining.maintenance.service.MaintenanceOrderService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
public class MaintenanceOrderServiceImpl extends ServiceImpl<MaintenanceOrderMapper, MaintenanceOrder> implements MaintenanceOrderService {

    private static final String TECHNICIAN_LOCK_KEY = "technician:lock:";

    @Autowired
    private MaintenanceOrderLogMapper logMapper;
    @Autowired
    private EquipmentAssetService equipmentAssetService;
    @Autowired
    private TechnicianScheduleMapper scheduleMapper;
    @Autowired
    private MaintenanceCostMapper costMapper;
    @Autowired
    private MaterialUsageRecordMapper usageRecordMapper;
    @Autowired
    private SysUserMapper sysUserMapper;
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void reportOrder(MaintenanceOrderDTO dto) {
        EquipmentAsset asset = equipmentAssetService.getById(dto.getEquipmentId());
        if (asset == null) {
            throw new BusinessException("设备不存在");
        }

        MaintenanceOrder order = new MaintenanceOrder();
        BeanUtils.copyProperties(dto, order);
        order.setOrderNo(generateOrderNo());
        order.setEquipmentCode(asset.getEquipmentCode());
        order.setReportTime(LocalDateTime.now());
        order.setStatus(OrderStatusConstant.REPORTED);
        order.setAcceptFlag(0);
        order.setReassignCount(0);
        save(order);

        asset.setStatus("FAULT");
        equipmentAssetService.updateById(asset);

        saveLog(order.getId(), order.getOrderNo(), "REPORT", "上报故障",
                dto.getReportUserId(), "上报人", null, OrderStatusConstant.REPORTED);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void assignOrder(Long id, Long technicianId) {
        MaintenanceOrder order = getById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatusConstant.REPORTED.equals(order.getStatus()) && !OrderStatusConstant.REOPENED.equals(order.getStatus())) {
            throw new BusinessException("工单状态不正确，无法派工");
        }

        String lockKey = TECHNICIAN_LOCK_KEY + technicianId;
        Boolean locked = redisTemplate.opsForValue().setIfAbsent(lockKey, id, 2, TimeUnit.HOURS);
        if (!Boolean.TRUE.equals(locked)) {
            throw new BusinessException("该技师当前有未完成的工单，请选择其他技师");
        }

        LambdaQueryWrapper<TechnicianSchedule> scheduleWrapper = new LambdaQueryWrapper<>();
        scheduleWrapper.eq(TechnicianSchedule::getTechnicianId, technicianId)
                .eq(TechnicianSchedule::getStatus, "ACTIVE");
        if (scheduleMapper.selectCount(scheduleWrapper) > 0) {
            redisTemplate.delete(lockKey);
            throw new BusinessException("该技师档期已满，请选择其他技师");
        }

        SysUser technician = sysUserMapper.selectById(technicianId);
        if (technician == null) {
            redisTemplate.delete(lockKey);
            throw new BusinessException("技师不存在");
        }

        String fromStatus = order.getStatus();
        order.setAssignedTechnicianId(technicianId);
        order.setAssignedTime(LocalDateTime.now());
        order.setStatus(OrderStatusConstant.ASSIGNED);
        updateById(order);

        TechnicianSchedule schedule = new TechnicianSchedule();
        schedule.setTechnicianId(technicianId);
        schedule.setTechnicianName(technician.getRealName());
        schedule.setOrderId(id);
        schedule.setOrderNo(order.getOrderNo());
        schedule.setMiningArea(order.getMiningArea());
        schedule.setStartTime(LocalDateTime.now());
        schedule.setStatus("ACTIVE");
        scheduleMapper.insert(schedule);

        saveLog(id, order.getOrderNo(), "ASSIGN", "指派维保技师", technicianId, "技师", fromStatus, OrderStatusConstant.ASSIGNED);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void acceptOrder(Long id) {
        MaintenanceOrder order = getById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatusConstant.ASSIGNED.equals(order.getStatus())) {
            throw new BusinessException("工单状态不正确");
        }

        String fromStatus = order.getStatus();
        order.setAcceptFlag(1);
        order.setAcceptTime(LocalDateTime.now());
        order.setStatus(OrderStatusConstant.ACCEPTED);
        updateById(order);

        saveLog(id, order.getOrderNo(), "ACCEPT", "接单", order.getAssignedTechnicianId(), "技师", fromStatus, OrderStatusConstant.ACCEPTED);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void startMaintenance(Long id) {
        MaintenanceOrder order = getById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatusConstant.ACCEPTED.equals(order.getStatus())) {
            throw new BusinessException("工单状态不正确");
        }

        String fromStatus = order.getStatus();
        order.setStartTime(LocalDateTime.now());
        order.setStatus(OrderStatusConstant.IN_PROGRESS);
        updateById(order);

        EquipmentAsset asset = equipmentAssetService.getById(order.getEquipmentId());
        if (asset != null) {
            asset.setStatus("MAINTENANCE");
            equipmentAssetService.updateById(asset);
        }

        saveLog(id, order.getOrderNo(), "START", "开始维修", order.getAssignedTechnicianId(), "技师", fromStatus, OrderStatusConstant.IN_PROGRESS);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void completeMaintenance(Long id, String content, String partsUsed, BigDecimal laborHours) {
        MaintenanceOrder order = getById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatusConstant.IN_PROGRESS.equals(order.getStatus())) {
            throw new BusinessException("工单状态不正确");
        }

        String fromStatus = order.getStatus();
        order.setMaintenanceContent(content);
        order.setPartsUsed(partsUsed);
        order.setLaborHours(laborHours);
        order.setCompleteTime(LocalDateTime.now());
        order.setStatus(OrderStatusConstant.COMPLETED);
        updateById(order);

        saveLog(id, order.getOrderNo(), "COMPLETE", "完成维修", order.getAssignedTechnicianId(), "技师", fromStatus, OrderStatusConstant.COMPLETED);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void checkOrder(Long id, Long checkerId, String checkOpinion, boolean passed) {
        MaintenanceOrder order = getById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatusConstant.COMPLETED.equals(order.getStatus())) {
            throw new BusinessException("工单状态不正确");
        }

        String fromStatus = order.getStatus();
        order.setCheckerId(checkerId);
        order.setCheckTime(LocalDateTime.now());
        order.setCheckOpinion(checkOpinion);

        if (passed) {
            order.setStatus(OrderStatusConstant.ACCEPTED_OK);
            EquipmentAsset asset = equipmentAssetService.getById(order.getEquipmentId());
            if (asset != null) {
                asset.setStatus("NORMAL");
                equipmentAssetService.updateById(asset);
            }
            equipmentAssetService.refreshMaintenanceDate(order.getEquipmentId());

            collectMaintenanceCost(order);
            releaseTechnicianSchedule(order.getAssignedTechnicianId(), order.getId());
            releaseTechnicianLock(order.getAssignedTechnicianId());
        } else {
            order.setStatus(OrderStatusConstant.REOPENED);
        }
        updateById(order);

        saveLog(id, order.getOrderNo(), "CHECK", passed ? "验收通过" : "验收不通过",
                checkerId, "验收人", fromStatus, passed ? OrderStatusConstant.ACCEPTED_OK : OrderStatusConstant.REOPENED);
    }

    private void collectMaintenanceCost(MaintenanceOrder order) {
        MaintenanceCost cost = new MaintenanceCost();
        cost.setOrderId(order.getId());
        cost.setOrderNo(order.getOrderNo());
        cost.setEquipmentId(order.getEquipmentId());
        cost.setEquipmentCode(order.getEquipmentCode());
        cost.setMiningArea(order.getMiningArea());
        cost.setTechnicianId(order.getAssignedTechnicianId());

        SysUser technician = sysUserMapper.selectById(order.getAssignedTechnicianId());
        if (technician != null) {
            cost.setTechnicianName(technician.getRealName());
        }

        EquipmentAsset asset = equipmentAssetService.getById(order.getEquipmentId());
        if (asset != null) {
            cost.setCategoryId(asset.getCategoryId());
        }

        LambdaQueryWrapper<MaterialUsageRecord> usageWrapper = new LambdaQueryWrapper<>();
        usageWrapper.eq(MaterialUsageRecord::getOrderId, order.getId());
        List<MaterialUsageRecord> usageRecords = usageRecordMapper.selectList(usageWrapper);
        BigDecimal partsCost = usageRecords.stream()
                .map(MaterialUsageRecord::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        cost.setPartsCost(partsCost);

        BigDecimal hourlyRate = new BigDecimal("150");
        BigDecimal laborCost = order.getLaborHours() != null
                ? order.getLaborHours().multiply(hourlyRate)
                : BigDecimal.ZERO;
        cost.setLaborCost(laborCost);

        long durationHours = 0;
        if (order.getStartTime() != null && order.getCompleteTime() != null) {
            durationHours = ChronoUnit.HOURS.between(order.getStartTime(), order.getCompleteTime());
        }
        cost.setFaultDurationHours((int) durationHours);

        BigDecimal downtimeLossPerHour = new BigDecimal("500");
        BigDecimal downtimeLoss = BigDecimal.valueOf(durationHours).multiply(downtimeLossPerHour);
        cost.setDowntimeLoss(downtimeLoss);

        cost.setTotalCost(partsCost.add(laborCost).add(downtimeLoss));
        cost.setMaintenanceDate(LocalDate.now());
        costMapper.insert(cost);
    }

    private void releaseTechnicianSchedule(Long technicianId, Long orderId) {
        LambdaQueryWrapper<TechnicianSchedule> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TechnicianSchedule::getTechnicianId, technicianId)
                .eq(TechnicianSchedule::getOrderId, orderId)
                .eq(TechnicianSchedule::getStatus, "ACTIVE");
        TechnicianSchedule schedule = scheduleMapper.selectOne(wrapper);
        if (schedule != null) {
            schedule.setEndTime(LocalDateTime.now());
            schedule.setStatus("COMPLETED");
            scheduleMapper.updateById(schedule);
        }
    }

    private void releaseTechnicianLock(Long technicianId) {
        String lockKey = TECHNICIAN_LOCK_KEY + technicianId;
        redisTemplate.delete(lockKey);
    }

    @Override
    public Page<MaintenanceOrder> pageQuery(int page, int size, String miningArea, String status, Long technicianId) {
        Page<MaintenanceOrder> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<MaintenanceOrder> wrapper = new LambdaQueryWrapper<>();
        if (miningArea != null && !miningArea.isEmpty()) {
            wrapper.eq(MaintenanceOrder::getMiningArea, miningArea);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(MaintenanceOrder::getStatus, status);
        }
        if (technicianId != null) {
            wrapper.eq(MaintenanceOrder::getAssignedTechnicianId, technicianId);
        }
        wrapper.orderByDesc(MaintenanceOrder::getCreateTime);
        return page(pageParam, wrapper);
    }

    @Override
    public List<MaintenanceOrderLog> getOrderLogs(Long orderId) {
        LambdaQueryWrapper<MaintenanceOrderLog> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaintenanceOrderLog::getOrderId, orderId)
                .orderByAsc(MaintenanceOrderLog::getOperationTime);
        return logMapper.selectList(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void reassignTimeoutOrders() {
        LocalDateTime timeoutTime = LocalDateTime.now().minusMinutes(30);
        LambdaQueryWrapper<MaintenanceOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaintenanceOrder::getStatus, OrderStatusConstant.ASSIGNED)
                .eq(MaintenanceOrder::getAcceptFlag, 0)
                .le(MaintenanceOrder::getAssignedTime, timeoutTime);
        List<MaintenanceOrder> timeoutOrders = list(wrapper);

        for (MaintenanceOrder order : timeoutOrders) {
            releaseTechnicianLock(order.getAssignedTechnicianId());
            order.setStatus(OrderStatusConstant.REPORTED);
            order.setAssignedTechnicianId(null);
            order.setAssignedTime(null);
            order.setReassignCount(order.getReassignCount() + 1);
            updateById(order);
            saveLog(order.getId(), order.getOrderNo(), "REASSIGN", "超时未接单，重新派单",
                    null, "系统", OrderStatusConstant.ASSIGNED, OrderStatusConstant.REPORTED);
        }
    }

    private String generateOrderNo() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = String.format("%04d", new Random().nextInt(10000));
        return "WO" + date + random;
    }

    private void saveLog(Long orderId, String orderNo, String operationType, String operationContent,
                         Long operatorId, String operatorName, String fromStatus, String toStatus) {
        MaintenanceOrderLog log = new MaintenanceOrderLog();
        log.setOrderId(orderId);
        log.setOrderNo(orderNo);
        log.setOperationType(operationType);
        log.setOperationContent(operationContent);
        log.setOperatorId(operatorId);
        log.setOperatorName(operatorName);
        log.setOperationTime(LocalDateTime.now());
        log.setFromStatus(fromStatus);
        log.setToStatus(toStatus);
        log.setCreateTime(LocalDateTime.now());
        logMapper.insert(log);
    }
}