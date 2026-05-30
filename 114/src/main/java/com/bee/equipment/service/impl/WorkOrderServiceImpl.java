package com.bee.equipment.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.bee.equipment.common.Constants;
import com.bee.equipment.common.ResultCodeEnum;
import com.bee.equipment.dto.MaterialLossDTO;
import com.bee.equipment.dto.WorkOrderDTO;
import com.bee.equipment.dto.WorkOrderFinishDTO;
import com.bee.equipment.entity.EquipmentCategory;
import com.bee.equipment.entity.Material;
import com.bee.equipment.entity.WorkOrder;
import com.bee.equipment.entity.WorkOrderMaterial;
import com.bee.equipment.exception.BusinessException;
import com.bee.equipment.mapper.WorkOrderMapper;
import com.bee.equipment.service.EquipmentCategoryService;
import com.bee.equipment.service.MaterialService;
import com.bee.equipment.service.WorkOrderMaterialService;
import com.bee.equipment.service.WorkOrderService;
import com.bee.equipment.vo.WorkOrderMaterialVO;
import com.bee.equipment.vo.WorkOrderVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class WorkOrderServiceImpl extends ServiceImpl<WorkOrderMapper, WorkOrder> implements WorkOrderService {

    @Autowired
    private MaterialService materialService;

    @Autowired
    private WorkOrderMaterialService workOrderMaterialService;

    @Autowired
    private EquipmentCategoryService equipmentCategoryService;

    @Override
    public Page<WorkOrderVO> listWithPage(int page, int size, String status) {
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            wrapper.eq(WorkOrder::getStatus, status);
        }
        wrapper.orderByDesc(WorkOrder::getCreateTime);
        Page<WorkOrder> pageResult = page(new Page<>(page, size), wrapper);

        Page<WorkOrderVO> voPage = new Page<>(pageResult.getCurrent(), pageResult.getSize(), pageResult.getTotal());
        List<WorkOrderVO> voList = new ArrayList<>();

        for (WorkOrder workOrder : pageResult.getRecords()) {
            voList.add(convertToVO(workOrder));
        }

        voPage.setRecords(voList);
        return voPage;
    }

    @Override
    public WorkOrderVO getDetail(Long id) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCodeEnum.WORK_ORDER_NOT_EXIST);
        }
        return convertToVO(workOrder);
    }

    private WorkOrderVO convertToVO(WorkOrder workOrder) {
        WorkOrderVO vo = new WorkOrderVO();
        BeanUtils.copyProperties(workOrder, vo);

        if (workOrder.getEquipmentCategoryId() != null) {
            EquipmentCategory category = equipmentCategoryService.getById(workOrder.getEquipmentCategoryId());
            if (category != null) {
                vo.setEquipmentCategoryName(category.getName());
            }
        }

        vo.setStatusDesc(getStatusDesc(workOrder.getStatus()));

        List<WorkOrderMaterial> materials = workOrderMaterialService.lambdaQuery()
                .eq(WorkOrderMaterial::getWorkOrderId, workOrder.getId())
                .list();

        List<WorkOrderMaterialVO> materialVOList = materials.stream().map(m -> {
            WorkOrderMaterialVO mvo = new WorkOrderMaterialVO();
            BeanUtils.copyProperties(m, mvo);

            Material material = materialService.getById(m.getMaterialId());
            if (material != null) {
                mvo.setMaterialName(material.getName());
                mvo.setMaterialSpec(material.getSpec());
                mvo.setMaterialUnit(material.getUnit());
                mvo.setUnitPrice(material.getPrice());
                if (m.getActualQuantity() != null) {
                    mvo.setTotalPrice(m.getActualQuantity().multiply(material.getPrice()).setScale(2, RoundingMode.HALF_UP));
                }
                if (m.getActualQuantity() != null && m.getRequiredQuantity() != null) {
                    BigDecimal loss = m.getActualQuantity().subtract(m.getRequiredQuantity());
                    mvo.setLossQuantity(loss);
                    if (m.getRequiredQuantity().compareTo(BigDecimal.ZERO) > 0) {
                        mvo.setLossRate(loss.divide(m.getRequiredQuantity(), 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)));
                    }
                }
            }
            return mvo;
        }).collect(Collectors.toList());

        vo.setMaterials(materialVOList);

        BigDecimal totalMaterialCost = materialVOList.stream()
                .filter(m -> m.getTotalPrice() != null)
                .map(WorkOrderMaterialVO::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        vo.setTotalMaterialCost(totalMaterialCost.setScale(2, RoundingMode.HALF_UP));

        vo.setLaborCost(calculateLaborCost(workOrder.getQuantity(), workOrder.getEquipmentCategoryId()));
        vo.setTotalCost(vo.getTotalMaterialCost().add(vo.getLaborCost()).setScale(2, RoundingMode.HALF_UP));

        return vo;
    }

    private String getStatusDesc(String status) {
        switch (status) {
            case Constants.WORK_ORDER_STATUS_PENDING:
                return "待领料";
            case Constants.WORK_ORDER_STATUS_PICKED:
                return "已领料";
            case Constants.WORK_ORDER_STATUS_ASSEMBLING:
                return "组装中";
            case Constants.WORK_ORDER_STATUS_FINISHED:
                return "已完成";
            case Constants.WORK_ORDER_STATUS_INSPECTING:
                return "质检中";
            case Constants.WORK_ORDER_STATUS_DELIVERED:
                return "已配发";
            case Constants.WORK_ORDER_STATUS_SUSPENDED:
                return "已暂停";
            default:
                return "未知";
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createWorkOrder(WorkOrderDTO workOrderDTO) {
        if (!equipmentCategoryService.isCategoryEnabled(workOrderDTO.getEquipmentCategoryId())) {
            throw new BusinessException(ResultCodeEnum.CATEGORY_NOT_EXIST.getCode(), "所选器具类目已下架或不存在");
        }

        for (var materialDTO : workOrderDTO.getMaterials()) {
            Material material = materialService.getById(materialDTO.getMaterialId());
            if (material == null) {
                throw new BusinessException(ResultCodeEnum.MATERIAL_NOT_EXIST);
            }
            if (Constants.MATERIAL_STATUS_STOP.equals(material.getStatus())) {
                throw new BusinessException("物料[" + material.getName() + "]已停止采购");
            }
        }

        WorkOrder workOrder = new WorkOrder();
        BeanUtils.copyProperties(workOrderDTO, workOrder);
        workOrder.setOrderNo("WO-" + System.currentTimeMillis());
        workOrder.setStatus(Constants.WORK_ORDER_STATUS_PENDING);
        workOrder.setCreateTime(LocalDateTime.now());
        workOrder.setUpdateTime(LocalDateTime.now());
        save(workOrder);

        if (workOrderDTO.getMaterials() != null) {
            for (var materialDTO : workOrderDTO.getMaterials()) {
                WorkOrderMaterial workOrderMaterial = new WorkOrderMaterial();
                BeanUtils.copyProperties(materialDTO, workOrderMaterial);
                workOrderMaterial.setWorkOrderId(workOrder.getId());
                workOrderMaterial.setCreateTime(LocalDateTime.now());
                workOrderMaterialService.save(workOrderMaterial);
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void pickMaterial(Long workOrderId, Long userId) {
        WorkOrder workOrder = getById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException(ResultCodeEnum.WORK_ORDER_NOT_EXIST);
        }
        if (!Constants.WORK_ORDER_STATUS_PENDING.equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCodeEnum.WORK_ORDER_STATUS_ERROR.getCode(), "当前工单状态不支持领料");
        }

        List<WorkOrderMaterial> materials = workOrderMaterialService.lambdaQuery()
                .eq(WorkOrderMaterial::getWorkOrderId, workOrderId)
                .list();

        for (WorkOrderMaterial woMaterial : materials) {
            materialService.lockStock(woMaterial.getMaterialId(), woMaterial.getRequiredQuantity(), workOrderId);
            woMaterial.setActualQuantity(woMaterial.getRequiredQuantity());
            workOrderMaterialService.updateById(woMaterial);
        }

        workOrder.setStatus(Constants.WORK_ORDER_STATUS_PICKED);
        workOrder.setAssemblerId(userId);
        workOrder.setPickTime(LocalDateTime.now());
        updateById(workOrder);
    }

    @Override
    public void startAssembly(Long workOrderId) {
        WorkOrder workOrder = getById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException(ResultCodeEnum.WORK_ORDER_NOT_EXIST);
        }
        if (!Constants.WORK_ORDER_STATUS_PICKED.equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCodeEnum.WORK_ORDER_STATUS_ERROR.getCode(), "当前工单状态不支持开始组装");
        }

        workOrder.setStatus(Constants.WORK_ORDER_STATUS_ASSEMBLING);
        updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> finishAssembly(WorkOrderFinishDTO finishDTO) {
        WorkOrder workOrder = getById(finishDTO.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException(ResultCodeEnum.WORK_ORDER_NOT_EXIST);
        }
        if (!Constants.WORK_ORDER_STATUS_ASSEMBLING.equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCodeEnum.WORK_ORDER_STATUS_ERROR.getCode(), "当前工单状态不支持完成组装");
        }

        List<WorkOrderMaterial> materials = workOrderMaterialService.lambdaQuery()
                .eq(WorkOrderMaterial::getWorkOrderId, finishDTO.getWorkOrderId())
                .list();

        Map<Long, WorkOrderMaterial> materialMap = materials.stream()
                .collect(Collectors.toMap(WorkOrderMaterial::getMaterialId, m -> m));

        for (MaterialLossDTO lossDTO : finishDTO.getMaterialLosses()) {
            WorkOrderMaterial woMaterial = materialMap.get(lossDTO.getMaterialId());
            if (woMaterial == null) {
                throw new BusinessException("物料ID[" + lossDTO.getMaterialId() + "]不属于当前工单");
            }

            if (lossDTO.getActualQuantity().compareTo(lossDTO.getStandardQuantity()) < 0) {
                BigDecimal returnQuantity = lossDTO.getStandardQuantity().subtract(lossDTO.getActualQuantity());
                materialService.unlockStock(lossDTO.getMaterialId(), returnQuantity, finishDTO.getWorkOrderId());
            }

            woMaterial.setActualQuantity(lossDTO.getActualQuantity());
            workOrderMaterialService.updateById(woMaterial);
        }

        workOrder.setStatus(Constants.WORK_ORDER_STATUS_FINISHED);
        workOrder.setFinishTime(LocalDateTime.now());
        workOrder.setRemark(finishDTO.getRemark());
        workOrder.setQuantity(finishDTO.getActualQuantity());
        updateById(workOrder);

        BigDecimal materialLossCost = calculateMaterialLossCost(finishDTO);
        BigDecimal laborCost = calculateLaborCost(finishDTO.getActualQuantity(), workOrder.getEquipmentCategoryId());

        Map<String, Object> result = new HashMap<>();
        result.put("workOrderId", finishDTO.getWorkOrderId());
        result.put("materialLossCost", materialLossCost);
        result.put("laborCost", laborCost);
        result.put("totalCost", materialLossCost.add(laborCost).setScale(2, RoundingMode.HALF_UP));
        result.put("actualQuantity", finishDTO.getActualQuantity());

        return result;
    }

    @Override
    public void startInspection(Long workOrderId) {
        WorkOrder workOrder = getById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException(ResultCodeEnum.WORK_ORDER_NOT_EXIST);
        }
        if (!Constants.WORK_ORDER_STATUS_FINISHED.equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCodeEnum.WORK_ORDER_STATUS_ERROR.getCode(), "当前工单状态不支持质检");
        }

        workOrder.setStatus(Constants.WORK_ORDER_STATUS_INSPECTING);
        updateById(workOrder);
    }

    @Override
    public void deliver(Long workOrderId) {
        WorkOrder workOrder = getById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException(ResultCodeEnum.WORK_ORDER_NOT_EXIST);
        }
        if (!Constants.WORK_ORDER_STATUS_INSPECTING.equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCodeEnum.WORK_ORDER_STATUS_ERROR.getCode(), "当前工单状态不支持配发");
        }

        workOrder.setStatus(Constants.WORK_ORDER_STATUS_DELIVERED);
        updateById(workOrder);
    }

    @Override
    public void suspendTimeoutOrders() {
        LocalDateTime threshold = LocalDateTime.now().minusHours(Constants.WORK_ORDER_TIMEOUT_HOURS);
        lambdaUpdate()
                .set(WorkOrder::getStatus, Constants.WORK_ORDER_STATUS_SUSPENDED)
                .eq(WorkOrder::getStatus, Constants.WORK_ORDER_STATUS_PENDING)
                .lt(WorkOrder::getCreateTime, threshold)
                .update();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void resumeWorkOrder(Long workOrderId) {
        WorkOrder workOrder = getById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException(ResultCodeEnum.WORK_ORDER_NOT_EXIST);
        }
        if (!Constants.WORK_ORDER_STATUS_SUSPENDED.equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCodeEnum.WORK_ORDER_STATUS_ERROR.getCode(), "只有暂停状态的工单才能恢复");
        }

        workOrder.setStatus(Constants.WORK_ORDER_STATUS_PENDING);
        workOrder.setCreateTime(LocalDateTime.now());
        updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancelWorkOrder(Long workOrderId) {
        WorkOrder workOrder = getById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException(ResultCodeEnum.WORK_ORDER_NOT_EXIST);
        }
        if (Constants.WORK_ORDER_STATUS_DELIVERED.equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCodeEnum.WORK_ORDER_STATUS_ERROR.getCode(), "已配发的工单无法取消");
        }

        if (Constants.WORK_ORDER_STATUS_PICKED.equals(workOrder.getStatus()) ||
                Constants.WORK_ORDER_STATUS_ASSEMBLING.equals(workOrder.getStatus())) {
            List<WorkOrderMaterial> materials = workOrderMaterialService.lambdaQuery()
                    .eq(WorkOrderMaterial::getWorkOrderId, workOrderId)
                    .list();
            for (WorkOrderMaterial woMaterial : materials) {
                if (woMaterial.getActualQuantity() != null) {
                    materialService.unlockStock(woMaterial.getMaterialId(), woMaterial.getActualQuantity(), workOrderId);
                }
            }
        }

        workOrderMaterialService.lambdaUpdate()
                .eq(WorkOrderMaterial::getWorkOrderId, workOrderId)
                .remove();
        removeById(workOrderId);
    }

    @Override
    public BigDecimal calculateLaborCost(Integer quantity, Long categoryId) {
        if (quantity == null || quantity <= 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal unitCost;
        if (categoryId == null) {
            unitCost = BigDecimal.valueOf(50);
        } else {
            EquipmentCategory category = equipmentCategoryService.getById(categoryId);
            if (category != null && category.getName() != null && category.getName().contains("标准")) {
                unitCost = BigDecimal.valueOf(60);
            } else {
                unitCost = BigDecimal.valueOf(50);
            }
        }

        return unitCost.multiply(BigDecimal.valueOf(quantity)).setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public BigDecimal calculateMaterialLossCost(WorkOrderFinishDTO finishDTO) {
        BigDecimal totalLossCost = BigDecimal.ZERO;

        for (MaterialLossDTO lossDTO : finishDTO.getMaterialLosses()) {
            Material material = materialService.getById(lossDTO.getMaterialId());
            if (material != null) {
                BigDecimal loss = lossDTO.getActualQuantity().subtract(lossDTO.getStandardQuantity());
                if (loss.compareTo(BigDecimal.ZERO) > 0) {
                    totalLossCost = totalLossCost.add(loss.multiply(material.getPrice()));
                }
            }
        }

        return totalLossCost.setScale(2, RoundingMode.HALF_UP);
    }
}
