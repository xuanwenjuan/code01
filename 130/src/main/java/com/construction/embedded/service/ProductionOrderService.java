package com.construction.embedded.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.construction.embedded.dto.ProductionOrderDTO;
import com.construction.embedded.entity.ProductionOrder;
import com.construction.embedded.exception.BusinessException;
import com.construction.embedded.mapper.ProductionOrderMapper;
import com.construction.embedded.util.UserContext;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class ProductionOrderService {

    @Autowired
    private ProductionOrderMapper productionOrderMapper;

    @Autowired
    private ProductionLogService productionLogService;

    @Autowired
    private ProductCategoryService productCategoryService;

    @Autowired
    private MaterialLockService materialLockService;

    @Autowired
    private ProductionLossService productionLossService;

    public IPage<ProductionOrder> list(String status, Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            wrapper.eq(ProductionOrder::getStatus, status);
        }
        wrapper.orderByDesc(ProductionOrder::getCreateTime);
        return productionOrderMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    public ProductionOrder getById(Long id) {
        return productionOrderMapper.selectById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void createOrder(ProductionOrderDTO dto) {
        productCategoryService.validateCategoryAvailable(dto.getCategoryId());

        ProductionOrder order = new ProductionOrder();
        BeanUtils.copyProperties(dto, order);
        String orderNo = generateOrderNo();
        order.setOrderNo(orderNo);
        order.setStatus("PENDING");
        order.setIsTimeoutSuspended(0);
        order.setCreateBy(UserContext.getUserId());
        if (order.getTimeoutHours() == null) {
            order.setTimeoutHours(24);
        }
        productionOrderMapper.insert(order);

        productionLogService.saveLog(order.getId(), "CREATE", 
            "创建生产工单", null, "PENDING");
    }

    private String generateOrderNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "PO-" + dateStr + "-" + uuid;
    }

    @Transactional(rollbackFor = Exception.class)
    public void startProduction(Long id) {
        ProductionOrder order = getOrder(id);
        if (!"MATERIAL_LOCKED".equals(order.getStatus()) && !"SUSPENDED".equals(order.getStatus())) {
            throw new BusinessException("请先锁定原料再开始生产");
        }
        String beforeStatus = order.getStatus();
        order.setStatus("CUTTING");
        order.setActualStartTime(LocalDateTime.now());
        order.setIsTimeoutSuspended(0);
        productionOrderMapper.updateById(order);

        materialLockService.consumeLockedMaterials(id);

        productionLogService.saveLog(id, "START", 
            "开始生产 - 型材裁切工序", beforeStatus, "CUTTING");
    }

    @Transactional(rollbackFor = Exception.class)
    public void nextStatus(Long id) {
        ProductionOrder order = getOrder(id);
        String currentStatus = order.getStatus();
        String nextStatus = getNextStatus(currentStatus);
        if (nextStatus == null) {
            throw new BusinessException("工单已完成，无法继续流转");
        }
        order.setStatus(nextStatus);
        if ("FINISHED".equals(nextStatus)) {
            order.setFinishTime(LocalDateTime.now());
            if (order.getActualQuantity() == null || order.getActualQuantity() == 0) {
                order.setActualQuantity(order.getPlanQuantity());
            }
            productionLossService.collectLossOnCompletion(id);
        }
        productionOrderMapper.updateById(order);

        String operationContent = getStatusDescription(currentStatus, nextStatus);
        productionLogService.saveLog(id, "STATUS_CHANGE", 
            operationContent, currentStatus, nextStatus);
    }

    private String getStatusDescription(String currentStatus, String nextStatus) {
        return switch (currentStatus) {
            case "CUTTING" -> "完成型材裁切，进入折弯冲孔成型工序";
            case "FORMING" -> "完成折弯冲孔成型，进入螺纹滚丝加工工序";
            case "THREADING" -> "完成螺纹滚丝加工，进入表面镀锌防腐工序";
            case "COATING" -> "完成表面镀锌防腐，进入尺寸复检校准工序";
            case "INSPECTING" -> "完成尺寸复检校准，进入打包入库工序";
            case "PACKING" -> "完成打包入库，生产全部完成";
            default -> "状态从 " + currentStatus + " 流转至 " + nextStatus;
        };
    }

    private String getNextStatus(String currentStatus) {
        return switch (currentStatus) {
            case "CUTTING" -> "FORMING";
            case "FORMING" -> "THREADING";
            case "THREADING" -> "COATING";
            case "COATING" -> "INSPECTING";
            case "INSPECTING" -> "PACKING";
            case "PACKING" -> "FINISHED";
            default -> null;
        };
    }

    @Transactional(rollbackFor = Exception.class)
    public void suspendOrder(Long id, String reason) {
        ProductionOrder order = getOrder(id);
        if ("FINISHED".equals(order.getStatus())) {
            throw new BusinessException("已完成的工单无法暂停");
        }
        String beforeStatus = order.getStatus();
        order.setStatus("SUSPENDED");
        productionOrderMapper.updateById(order);

        productionLogService.saveLog(id, "SUSPEND", 
            "暂停工单：" + reason, beforeStatus, "SUSPENDED");
    }

    @Transactional(rollbackFor = Exception.class)
    public void resumeOrder(Long id) {
        ProductionOrder order = getOrder(id);
        if (!"SUSPENDED".equals(order.getStatus())) {
            throw new BusinessException("只有暂停状态的工单可以恢复");
        }
        String beforeStatus = order.getStatus();
        order.setStatus("CUTTING");
        order.setIsTimeoutSuspended(0);
        productionOrderMapper.updateById(order);

        productionLogService.saveLog(id, "RESUME", 
            "恢复生产，进入型材裁切工序", beforeStatus, "CUTTING");
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateActualQuantity(Long id, Integer actualQuantity, Integer defectiveQuantity) {
        ProductionOrder order = getOrder(id);
        order.setActualQuantity(actualQuantity);
        order.setDefectiveQuantity(defectiveQuantity != null ? defectiveQuantity : 0);
        productionOrderMapper.updateById(order);

        productionLogService.saveLog(id, "UPDATE_QUANTITY", 
            "更新实际产量：" + actualQuantity + "，不合格数量：" + order.getDefectiveQuantity(), 
            null, null);
    }

    @Transactional(rollbackFor = Exception.class)
    public void checkTimeoutOrders() {
        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionOrder::getStatus, "PENDING")
               .eq(ProductionOrder::getIsTimeoutSuspended, 0)
               .isNotNull(ProductionOrder::getPlanStartTime);
        var pendingOrders = productionOrderMapper.selectList(wrapper);

        LocalDateTime now = LocalDateTime.now();
        for (ProductionOrder order : pendingOrders) {
            if (order.getPlanStartTime() != null && order.getTimeoutHours() != null) {
                LocalDateTime timeoutTime = order.getPlanStartTime().plusHours(order.getTimeoutHours());
                if (now.isAfter(timeoutTime)) {
                    String beforeStatus = order.getStatus();
                    order.setStatus("SUSPENDED");
                    order.setIsTimeoutSuspended(1);
                    productionOrderMapper.updateById(order);

                    productionLogService.saveLog(order.getId(), "TIMEOUT_SUSPEND", 
                        "超期未投产自动暂停", beforeStatus, "SUSPENDED");
                }
            }
        }
    }

    private ProductionOrder getOrder(Long id) {
        ProductionOrder order = productionOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        return order;
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateOrder(ProductionOrderDTO dto) {
        ProductionOrder existing = getOrder(dto.getId());
        if ("FINISHED".equals(existing.getStatus())) {
            throw new BusinessException("已完成的工单无法修改");
        }
        if (dto.getCategoryId() != null && !dto.getCategoryId().equals(existing.getCategoryId())) {
            productCategoryService.validateCategoryAvailable(dto.getCategoryId());
        }
        ProductionOrder order = new ProductionOrder();
        BeanUtils.copyProperties(dto, order);
        productionOrderMapper.updateById(order);

        productionLogService.saveLog(dto.getId(), "UPDATE", 
            "修改工单信息", null, null);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteOrder(Long id) {
        ProductionOrder order = getOrder(id);
        if (!"PENDING".equals(order.getStatus()) && !"SUSPENDED".equals(order.getStatus())) {
            throw new BusinessException("只有待投产或暂停状态的工单可以删除");
        }
        productionOrderMapper.deleteById(id);

        productionLogService.saveLog(id, "DELETE", 
            "删除工单", order.getStatus(), null);
    }
}
