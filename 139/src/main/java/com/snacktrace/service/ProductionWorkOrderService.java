package com.snacktrace.service;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.snacktrace.annotation.RequireRole;
import com.snacktrace.dto.WorkOrderCreateDTO;
import com.snacktrace.dto.WorkOrderMaterialDTO;
import com.snacktrace.entity.*;
import com.snacktrace.enums.RoleEnum;
import com.snacktrace.enums.WorkOrderStatusEnum;
import com.snacktrace.exception.BusinessException;
import com.snacktrace.mapper.ProductionWorkOrderMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProductionWorkOrderService extends ServiceImpl<ProductionWorkOrderMapper, ProductionWorkOrder> {

    @Autowired
    private WorkOrderMaterialService workOrderMaterialService;

    @Autowired
    private WorkOrderProcessService processService;

    @Autowired
    private ProductionCostService costService;

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;

    public List<ProductionWorkOrder> getOrderList(Long productId, Integer status) {
        LambdaQueryWrapper<ProductionWorkOrder> wrapper = new LambdaQueryWrapper<>();
        if (productId != null) {
            wrapper.eq(ProductionWorkOrder::getProductId, productId);
        }
        if (status != null) {
            wrapper.eq(ProductionWorkOrder::getStatus, status);
        }
        wrapper.orderByDesc(ProductionWorkOrder::getPriority)
               .orderByDesc(ProductionWorkOrder::getCreateTime);
        return list(wrapper);
    }

    @Transactional
    @RequireRole({RoleEnum.ADMIN, RoleEnum.R_D})
    public boolean createOrder(WorkOrderCreateDTO dto) {
        String orderNo = "WO" + IdUtil.getSnowflakeNextIdStr();

        ProductionWorkOrder order = new ProductionWorkOrder();
        order.setOrderNo(orderNo);
        order.setProductId(dto.getProductId());
        order.setPlanQuantity(dto.getPlanQuantity());
        order.setActualQuantity(BigDecimal.ZERO);
        order.setPriority(dto.getPriority() != null ? dto.getPriority() : 0);
        order.setStatus(WorkOrderStatusEnum.PENDING.getCode());
        order.setTeamLeaderId(dto.getTeamLeaderId());
        order.setPlanStartTime(dto.getPlanStartTime());
        order.setRemark(dto.getRemark());
        order.setCreateTime(LocalDateTime.now());

        boolean saved = save(order);

        if (saved && dto.getMaterials() != null) {
            for (WorkOrderMaterialDTO materialDTO : dto.getMaterials()) {
                WorkOrderMaterial material = new WorkOrderMaterial();
                material.setWorkOrderId(order.getId());
                material.setMaterialId(materialDTO.getMaterialId());
                material.setMaterialName(materialDTO.getMaterialName());
                material.setPlanQuantity(materialDTO.getPlanQuantity());
                material.setActualQuantity(BigDecimal.ZERO);
                material.setUnitPrice(materialDTO.getUnitPrice());
                material.setTotalCost(BigDecimal.ZERO);
                material.setCreateTime(LocalDateTime.now());
                workOrderMaterialService.save(material);
            }
        }

        return saved;
    }

    @Transactional
    @RequireRole({RoleEnum.ADMIN, RoleEnum.TEAM_LEADER})
    public boolean startNextProcess(Long workOrderId, String remark) {
        ProductionWorkOrder order = getById(workOrderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        Integer currentStatus = order.getStatus();
        if (currentStatus.equals(WorkOrderStatusEnum.COMPLETED.getCode()) ||
            currentStatus.equals(WorkOrderStatusEnum.SHELVED.getCode())) {
            throw new BusinessException("工单已完成或搁置，不能继续");
        }

        if (currentStatus > 1) {
            processService.endProcess(workOrderId, currentStatus, remark);
        }

        WorkOrderStatusEnum nextStatus = WorkOrderStatusEnum.getNextStatus(currentStatus);
        if (nextStatus == null) {
            return completeOrder(workOrderId);
        }

        Long operatorId = null;
        String operatorName = null;
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                operatorId = (Long) request.getAttribute("userId");
                operatorName = (String) request.getAttribute("username");
            }
        } catch (Exception e) {
        }

        processService.startProcess(workOrderId, nextStatus.getCode(), operatorId, operatorName);

        order.setStatus(nextStatus.getCode());
        if (currentStatus.equals(WorkOrderStatusEnum.PENDING.getCode())) {
            order.setActualStartTime(LocalDateTime.now());
        }

        return updateById(order);
    }

    @Transactional
    @RequireRole({RoleEnum.ADMIN, RoleEnum.TEAM_LEADER})
    public boolean addOrderMaterial(Long workOrderId, Long materialId, Long batchId,
                                     String materialName, String batchCode,
                                     BigDecimal quantity, BigDecimal unitPrice) {
        WorkOrderMaterial material = new WorkOrderMaterial();
        material.setWorkOrderId(workOrderId);
        material.setMaterialId(materialId);
        material.setBatchId(batchId);
        material.setMaterialName(materialName);
        material.setBatchCode(batchCode);
        material.setActualQuantity(quantity);
        material.setUnitPrice(unitPrice);
        material.setTotalCost(quantity.multiply(unitPrice));

        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                Long userId = (Long) request.getAttribute("userId");
                String username = (String) request.getAttribute("username");
                material.setOperatorId(userId);
                material.setOperatorName(username);
            }
        } catch (Exception e) {
        }

        material.setCreateTime(LocalDateTime.now());
        return workOrderMaterialService.save(material);
    }

    @Transactional
    @RequireRole({RoleEnum.ADMIN, RoleEnum.TEAM_LEADER})
    public boolean completeOrder(Long id) {
        ProductionWorkOrder order = getById(id);
        if (order == null) {
            return false;
        }

        processService.endProcess(id, order.getStatus(), "工单完成");

        order.setStatus(WorkOrderStatusEnum.COMPLETED.getCode());
        order.setCompleteTime(LocalDateTime.now());
        order.setActualQuantity(order.getPlanQuantity());
        updateById(order);

        Product product = productService.getById(order.getProductId());
        BigDecimal materialCost = workOrderMaterialService.getTotalMaterialCost(id);

        ProductionCost cost = new ProductionCost();
        cost.setWorkOrderId(id);
        cost.setProductId(order.getProductId());
        cost.setCategoryId(product != null ? product.getCategoryId() : null);
        cost.setMaterialCost(materialCost);
        cost.setEquipmentCost(BigDecimal.ZERO);
        cost.setPackagingCost(BigDecimal.ZERO);
        cost.setLaborCost(BigDecimal.ZERO);
        cost.setDefectCost(BigDecimal.ZERO);
        cost.setTotalCost(materialCost);
        cost.setCostDate(LocalDateTime.now().toLocalDate());
        cost.setCreateTime(LocalDateTime.now());
        costService.save(cost);

        return true;
    }

    public List<WorkOrderMaterial> getOrderMaterials(Long workOrderId) {
        LambdaQueryWrapper<WorkOrderMaterial> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrderMaterial::getWorkOrderId, workOrderId);
        return workOrderMaterialService.list(wrapper);
    }

    public List<WorkOrderProcess> getOrderProcesses(Long workOrderId) {
        return processService.getProcessList(workOrderId);
    }

    @Transactional
    @RequireRole({RoleEnum.ADMIN, RoleEnum.TEAM_LEADER})
    public boolean shelveOrder(Long id, String remark) {
        ProductionWorkOrder order = getById(id);
        if (order == null) {
            return false;
        }

        processService.endProcess(id, order.getStatus(), remark);
        order.setStatus(WorkOrderStatusEnum.SHELVED.getCode());
        order.setRemark(remark);

        return updateById(order);
    }
}
