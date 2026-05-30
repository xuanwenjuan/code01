package com.fan.impeller.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fan.impeller.common.Constants;
import com.fan.impeller.common.PageQuery;
import com.fan.impeller.context.UserContext;
import com.fan.impeller.dto.WorkOrderCreateDTO;
import com.fan.impeller.dto.WorkOrderQueryDTO;
import com.fan.impeller.entity.Material;
import com.fan.impeller.entity.MaterialStockLog;
import com.fan.impeller.entity.WorkOrder;
import com.fan.impeller.entity.WorkOrderMaterial;
import com.fan.impeller.exception.BusinessException;
import com.fan.impeller.mapper.MaterialStockLogMapper;
import com.fan.impeller.mapper.WorkOrderMapper;
import com.fan.impeller.mapper.WorkOrderMaterialMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkOrderService extends ServiceImpl<WorkOrderMapper, WorkOrder> {

    private final WorkOrderMaterialMapper workOrderMaterialMapper;
    private final MaterialStockLogMapper stockLogMapper;
    private final MaterialService materialService;

    @Cacheable(value = "workOrderPage", key = "#query.pageNum + '-' + #query.pageSize + '-' + #dto.hashCode()", unless = "#result == null")
    public Page<WorkOrder> queryPage(PageQuery query, WorkOrderQueryDTO dto) {
        return lambdaQuery()
                .like(dto.getOrderNo() != null, WorkOrder::getOrderNo, dto.getOrderNo())
                .like(dto.getProductName() != null, WorkOrder::getProductName, dto.getProductName())
                .eq(dto.getStatus() != null, WorkOrder::getStatus, dto.getStatus())
                .eq(dto.getCurrentStep() != null, WorkOrder::getCurrentStep, dto.getCurrentStep())
                .eq(dto.getOperatorId() != null, WorkOrder::getOperatorId, dto.getOperatorId())
                .ge(dto.getStartTime() != null, WorkOrder::getCreateTime, dto.getStartTime())
                .le(dto.getEndTime() != null, WorkOrder::getCreateTime, dto.getEndTime())
                .orderByDesc(WorkOrder::getCreateTime)
                .page(new Page<>(query.getPageNum(), query.getPageSize()));
    }

    public Page<WorkOrder> page(PageQuery query, Integer status) {
        return lambdaQuery()
                .eq(status != null, WorkOrder::getStatus, status)
                .orderByDesc(WorkOrder::getCreateTime)
                .page(new Page<>(query.getPageNum(), query.getPageSize()));
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = {"workOrderPage", "workOrderDetail"}, allEntries = true)
    public void createWorkOrder(WorkOrderCreateDTO dto) {
        String orderNo = generateOrderNo();

        for (WorkOrderCreateDTO.WorkOrderMaterialDTO material : dto.getMaterials()) {
            materialService.lockMaterial(
                    material.getMaterialId(),
                    material.getQuantity(),
                    null,
                    orderNo,
                    UserContext.getUserId(),
                    UserContext.getUsername()
            );
        }

        WorkOrder workOrder = new WorkOrder();
        workOrder.setOrderNo(orderNo);
        workOrder.setProductId(dto.getProductId());
        workOrder.setProductName(dto.getProductName());
        workOrder.setQuantity(dto.getQuantity());
        workOrder.setPlanStartTime(dto.getPlanStartTime());
        workOrder.setPlanEndTime(dto.getPlanEndTime());
        workOrder.setRemark(dto.getRemark());
        workOrder.setStatus(Constants.WORKORDER_STATUS_PENDING);
        workOrder.setCurrentStep(0);
        workOrder.setOperatorId(UserContext.getUserId());
        workOrder.setOperatorName(UserContext.getUsername());
        save(workOrder);

        for (WorkOrderCreateDTO.WorkOrderMaterialDTO materialDTO : dto.getMaterials()) {
            WorkOrderMaterial material = new WorkOrderMaterial();
            material.setWorkOrderId(workOrder.getId());
            material.setWorkOrderNo(orderNo);
            material.setMaterialId(materialDTO.getMaterialId());
            material.setMaterialName(materialDTO.getMaterialName());
            material.setBatchNo(materialDTO.getBatchNo());
            material.setQuantity(materialDTO.getQuantity());
            material.setUnit(materialDTO.getUnit());
            material.setUnitPrice(materialDTO.getUnitPrice());
            material.setTotalAmount(materialDTO.getQuantity().multiply(materialDTO.getUnitPrice()));
            workOrderMaterialMapper.insert(material);

            Material mat = materialService.getById(materialDTO.getMaterialId());
            if (mat != null) {
                BigDecimal beforeQuantity = mat.getQuantity();
                BigDecimal afterQuantity = beforeQuantity.subtract(materialDTO.getQuantity());

                MaterialStockLog log = new MaterialStockLog();
                log.setMaterialId(mat.getId());
                log.setMaterialName(mat.getMaterialName());
                log.setBatchNo(mat.getBatchNo());
                log.setType(2);
                log.setBeforeQuantity(beforeQuantity);
                log.setChangeQuantity(materialDTO.getQuantity());
                log.setAfterQuantity(afterQuantity);
                log.setOperatorId(UserContext.getUserId());
                log.setOperatorName(UserContext.getUsername());
                log.setWorkOrderId(workOrder.getId());
                log.setWorkOrderNo(orderNo);
                log.setRemark("工单领料");
                stockLogMapper.insert(log);

                mat.setQuantity(afterQuantity);
                materialService.updateMaterial(mat);
            }
        }

        materialService.unlockMaterial(workOrder.getId());
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = {"workOrderPage", "workOrderDetail"}, allEntries = true)
    public void createWorkOrder(WorkOrder workOrder, List<WorkOrderMaterial> materials) {
        String orderNo = generateOrderNo();
        workOrder.setOrderNo(orderNo);
        workOrder.setStatus(Constants.WORKORDER_STATUS_PENDING);
        workOrder.setCurrentStep(0);
        workOrder.setOperatorId(UserContext.getUserId());
        workOrder.setOperatorName(UserContext.getUsername());
        save(workOrder);

        for (WorkOrderMaterial material : materials) {
            material.setWorkOrderId(workOrder.getId());
            material.setWorkOrderNo(orderNo);
            if (material.getQuantity() != null && material.getUnitPrice() != null) {
                material.setTotalAmount(material.getQuantity().multiply(material.getUnitPrice()));
            }
            workOrderMaterialMapper.insert(material);

            Material mat = materialService.getById(material.getMaterialId());
            if (mat != null) {
                if (mat.getQuantity().compareTo(material.getQuantity()) < 0) {
                    throw new BusinessException("原料【" + mat.getMaterialName() + "】库存不足，当前库存：" + mat.getQuantity());
                }
                BigDecimal beforeQuantity = mat.getQuantity();
                BigDecimal afterQuantity = beforeQuantity.subtract(material.getQuantity());

                MaterialStockLog log = new MaterialStockLog();
                log.setMaterialId(mat.getId());
                log.setMaterialName(mat.getMaterialName());
                log.setBatchNo(mat.getBatchNo());
                log.setType(2);
                log.setBeforeQuantity(beforeQuantity);
                log.setChangeQuantity(material.getQuantity());
                log.setAfterQuantity(afterQuantity);
                log.setOperatorId(UserContext.getUserId());
                log.setOperatorName(UserContext.getUsername());
                log.setWorkOrderId(workOrder.getId());
                log.setWorkOrderNo(orderNo);
                log.setRemark("工单领料");
                stockLogMapper.insert(log);

                mat.setQuantity(afterQuantity);
                materialService.updateMaterial(mat);
            }
        }
    }

    private String generateOrderNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return "WO" + dateStr + uuid;
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = {"workOrderPage", "workOrderDetail"}, allEntries = true)
    public void startProduction(Long id) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (workOrder.getStatus() != Constants.WORKORDER_STATUS_PENDING) {
            throw new BusinessException("工单状态不正确");
        }
        workOrder.setStatus(Constants.WORKORDER_STATUS_IN_PRODUCTION);
        workOrder.setCurrentStep(Constants.WORKORDER_STEP_MELTING);
        workOrder.setActualStartTime(LocalDateTime.now());
        updateById(workOrder);
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = {"workOrderPage", "workOrderDetail"}, allEntries = true)
    public void nextStep(Long id, Integer step, String records) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (workOrder.getStatus() != Constants.WORKORDER_STATUS_IN_PRODUCTION) {
            throw new BusinessException("工单未在生产中");
        }

        switch (step) {
            case 1:
                workOrder.setMeltingRecords(records);
                break;
            case 2:
                workOrder.setCastingRecords(records);
                break;
            case 3:
                workOrder.setCoolingRecords(records);
                break;
            case 4:
                workOrder.setTrimmingRecords(records);
                break;
            case 5:
                workOrder.setBalancingRecords(records);
                break;
            case 6:
                workOrder.setSurfaceTreatmentRecords(records);
                break;
            case 7:
                workOrder.setStorageRecords(records);
                workOrder.setStatus(Constants.WORKORDER_STATUS_COMPLETED);
                workOrder.setActualEndTime(LocalDateTime.now());
                break;
            default:
                throw new BusinessException("工序不正确");
        }

        workOrder.setCurrentStep(step);
        updateById(workOrder);
    }

    @Transactional(rollbackFor = Exception.class)
    public void suspendTimeoutOrders() {
        LocalDateTime threshold = LocalDateTime.now().minusHours(24);
        List<WorkOrder> timeoutOrders = list(new LambdaQueryWrapper<WorkOrder>()
                .eq(WorkOrder::getStatus, Constants.WORKORDER_STATUS_PENDING)
                .lt(WorkOrder::getCreateTime, threshold));

        for (WorkOrder order : timeoutOrders) {
            order.setStatus(Constants.WORKORDER_STATUS_SUSPENDED);
            updateById(order);
            materialService.releaseMaterialLock(order.getId());
        }
    }

    @Cacheable(value = "workOrderMaterials", key = "#workOrderId", unless = "#result == null")
    public List<WorkOrderMaterial> getWorkOrderMaterials(Long workOrderId) {
        return workOrderMaterialMapper.selectList(new LambdaQueryWrapper<WorkOrderMaterial>()
                .eq(WorkOrderMaterial::getWorkOrderId, workOrderId));
    }

    @Cacheable(value = "workOrderDetail", key = "#id", unless = "#result == null")
    public WorkOrder getDetailById(Long id) {
        return getById(id);
    }
}
