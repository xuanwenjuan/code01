package com.firecontrol.service.impl;

import cn.hutool.core.date.DateUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.firecontrol.common.PageQuery;
import com.firecontrol.common.ResultCode;
import com.firecontrol.common.constant.WorkOrderConstants;
import com.firecontrol.dto.ProcessOperationDTO;
import com.firecontrol.dto.WorkOrderDTO;
import com.firecontrol.dto.WorkOrderPickMaterialDTO;
import com.firecontrol.entity.*;
import com.firecontrol.exception.BusinessException;
import com.firecontrol.mapper.*;
import com.firecontrol.service.WorkOrderService;
import com.firecontrol.utils.UserContextUtil;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class WorkOrderServiceImpl implements WorkOrderService {

    @Resource
    private WorkOrderMapper workOrderMapper;

    @Resource
    private WorkOrderProcessMapper workOrderProcessMapper;

    @Resource
    private WorkOrderMaterialMapper workOrderMaterialMapper;

    @Resource
    private ProductCategoryMapper productCategoryMapper;

    @Resource
    private MaterialService materialService;

    @Resource
    private MaterialMapper materialMapper;

    @Resource
    private WorkOrderLaborMapper workOrderLaborMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public String createWorkOrder(WorkOrderDTO dto) {
        ProductCategory product = productCategoryMapper.selectById(dto.getProductId());
        if (product == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST.getCode(), "产品不存在");
        }
        if (product.getStatus() == 0) {
            throw new BusinessException("该产品已淘汰，停止排产");
        }

        String orderNo = generateOrderNo();

        WorkOrder workOrder = new WorkOrder();
        workOrder.setOrderNo(orderNo);
        workOrder.setProductId(dto.getProductId());
        workOrder.setProductName(product.getCategoryName());
        workOrder.setProductCode(product.getCategoryCode());
        workOrder.setSpecification(product.getSpecification());
        workOrder.setPlanQuantity(dto.getPlanQuantity());
        workOrder.setActualQuantity(BigDecimal.ZERO);
        workOrder.setQualifiedQuantity(BigDecimal.ZERO);
        workOrder.setScrapQuantity(BigDecimal.ZERO);
        workOrder.setStatus(WorkOrderConstants.STATUS_PENDING);
        workOrder.setPriority(dto.getPriority() != null ? dto.getPriority() : product.getPriority());
        workOrder.setPlanStartTime(dto.getPlanStartTime());
        workOrder.setPlanEndTime(dto.getPlanEndTime());
        workOrder.setIsEmergency(dto.getIsEmergency() != null ? dto.getIsEmergency() : 0);
        workOrder.setAutoPaused(0);
        workOrder.setRemark(dto.getRemark());
        workOrder.setProcessUserId(UserContextUtil.getUserId());
        workOrder.setProcessUserName(UserContextUtil.getUsername());

        workOrderMapper.insert(workOrder);

        if (dto.getMaterials() != null && !dto.getMaterials().isEmpty()) {
            for (var materialDTO : dto.getMaterials()) {
                Material material = materialMapper.selectById(materialDTO.getMaterialId());
                if (material == null) {
                    throw new BusinessException(ResultCode.DATA_NOT_EXIST.getCode(), "物资不存在：" + materialDTO.getMaterialId());
                }

                WorkOrderMaterial orderMaterial = new WorkOrderMaterial();
                orderMaterial.setWorkOrderId(workOrder.getId());
                orderMaterial.setOrderNo(orderNo);
                orderMaterial.setMaterialId(material.getId());
                orderMaterial.setMaterialCode(material.getMaterialCode());
                orderMaterial.setMaterialName(material.getMaterialName());
                orderMaterial.setSpecification(material.getSpecification());
                orderMaterial.setUnit(material.getUnit());
                orderMaterial.setRequiredQuantity(materialDTO.getRequiredQuantity());
                orderMaterial.setActualQuantity(BigDecimal.ZERO);
                orderMaterial.setReturnedQuantity(BigDecimal.ZERO);
                orderMaterial.setScrapQuantity(BigDecimal.ZERO);
                orderMaterial.setRemark(materialDTO.getRemark());
                workOrderMaterialMapper.insert(orderMaterial);
            }
        }

        initWorkOrderProcesses(workOrder.getId(), orderNo);

        return orderNo;
    }

    private String generateOrderNo() {
        String prefix = "WO" + DateUtil.format(DateUtil.date(), "yyyyMMdd");
        Long count = workOrderMapper.selectCount(
                new LambdaQueryWrapper<WorkOrder>()
                        .likeRight(WorkOrder::getOrderNo, prefix)
        );
        return prefix + String.format("%04d", count + 1);
    }

    private void initWorkOrderProcesses(Long workOrderId, String orderNo) {
        List<String> processes = WorkOrderConstants.PRODUCTION_PROCESSES;
        for (int i = 0; i < processes.size(); i++) {
            WorkOrderProcess process = new WorkOrderProcess();
            process.setWorkOrderId(workOrderId);
            process.setOrderNo(orderNo);
            process.setProcessCode(processes.get(i));
            process.setProcessName(WorkOrderConstants.getProcessName(processes.get(i)));
            process.setProcessSort(i + 1);
            process.setStatus(0);
            workOrderProcessMapper.insert(process);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateWorkOrder(WorkOrderDTO dto) {
        WorkOrder workOrder = workOrderMapper.selectById(dto.getId());
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (workOrder.getStatus() != WorkOrderConstants.STATUS_PENDING) {
            throw new BusinessException("只有待投产状态的工单可以修改");
        }

        if (dto.getProductId() != null && !dto.getProductId().equals(workOrder.getProductId())) {
            ProductCategory product = productCategoryMapper.selectById(dto.getProductId());
            if (product == null) {
                throw new BusinessException(ResultCode.DATA_NOT_EXIST.getCode(), "产品不存在");
            }
            workOrder.setProductId(dto.getProductId());
            workOrder.setProductName(product.getCategoryName());
            workOrder.setProductCode(product.getCategoryCode());
            workOrder.setSpecification(product.getSpecification());
        }

        if (dto.getPlanQuantity() != null) {
            workOrder.setPlanQuantity(dto.getPlanQuantity());
        }
        if (dto.getPriority() != null) {
            workOrder.setPriority(dto.getPriority());
        }
        if (dto.getIsEmergency() != null) {
            workOrder.setIsEmergency(dto.getIsEmergency());
        }
        if (dto.getPlanStartTime() != null) {
            workOrder.setPlanStartTime(dto.getPlanStartTime());
        }
        if (dto.getPlanEndTime() != null) {
            workOrder.setPlanEndTime(dto.getPlanEndTime());
        }
        if (dto.getRemark() != null) {
            workOrder.setRemark(dto.getRemark());
        }

        workOrderMapper.updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteWorkOrder(Long id) {
        WorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (workOrder.getStatus() != WorkOrderConstants.STATUS_PENDING && workOrder.getStatus() != WorkOrderConstants.STATUS_DRAFT) {
            throw new BusinessException("只有待投产或草稿状态的工单可以删除");
        }

        workOrderMaterialMapper.delete(
                new LambdaQueryWrapper<WorkOrderMaterial>()
                        .eq(WorkOrderMaterial::getWorkOrderId, id)
        );

        workOrderProcessMapper.delete(
                new LambdaQueryWrapper<WorkOrderProcess>()
                        .eq(WorkOrderProcess::getWorkOrderId, id)
        );

        workOrderMapper.deleteById(id);
    }

    @Override
    public WorkOrder getWorkOrderById(Long id) {
        return workOrderMapper.selectById(id);
    }

    @Override
    public IPage<WorkOrder> getWorkOrderPage(WorkOrder workOrder, PageQuery pageQuery) {
        Page<WorkOrder> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();

        if (StrUtil.isNotBlank(workOrder.getOrderNo())) {
            wrapper.like(WorkOrder::getOrderNo, workOrder.getOrderNo());
        }
        if (workOrder.getProductId() != null) {
            wrapper.eq(WorkOrder::getProductId, workOrder.getProductId());
        }
        if (workOrder.getStatus() != null) {
            wrapper.eq(WorkOrder::getStatus, workOrder.getStatus());
        }
        if (workOrder.getIsEmergency() != null) {
            wrapper.eq(WorkOrder::getIsEmergency, workOrder.getIsEmergency());
        }

        wrapper.orderByDesc(WorkOrder::getPriority, WorkOrder::getCreateTime);
        return workOrderMapper.selectPage(page, wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void startProcess(ProcessOperationDTO dto) {
        WorkOrder workOrder = workOrderMapper.selectById(dto.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (workOrder.getAutoPaused() == 1) {
            throw new BusinessException(ResultCode.WORK_ORDER_AUTO_PAUSED);
        }
        if (workOrder.getStatus() == WorkOrderConstants.STATUS_PAUSED) {
            throw new BusinessException("工单已暂停，请先恢复");
        }
        if (workOrder.getStatus() == WorkOrderConstants.STATUS_CANCELLED) {
            throw new BusinessException("工单已取消");
        }
        if (workOrder.getStatus() == WorkOrderConstants.STATUS_FINISHED) {
            throw new BusinessException("工单已完成");
        }

        WorkOrderProcess process = workOrderProcessMapper.selectOne(
                new LambdaQueryWrapper<WorkOrderProcess>()
                        .eq(WorkOrderProcess::getWorkOrderId, dto.getWorkOrderId())
                        .eq(WorkOrderProcess::getProcessCode, dto.getProcessCode())
        );
        if (process == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST.getCode(), "工序不存在");
        }
        if (process.getStatus() == 1) {
            throw new BusinessException("该工序已进行中");
        }
        if (process.getStatus() == 2) {
            throw new BusinessException("该工序已完成");
        }

        if (process.getProcessSort() > 1) {
            WorkOrderProcess prevProcess = workOrderProcessMapper.selectOne(
                    new LambdaQueryWrapper<WorkOrderProcess>()
                            .eq(WorkOrderProcess::getWorkOrderId, dto.getWorkOrderId())
                            .eq(WorkOrderProcess::getProcessSort, process.getProcessSort() - 1)
            );
            if (prevProcess != null && prevProcess.getStatus() != 2) {
                throw new BusinessException("上一道工序未完成");
            }
        }

        if (workOrder.getStatus() == WorkOrderConstants.STATUS_PENDING) {
            workOrder.setStatus(WorkOrderConstants.STATUS_IN_PRODUCTION);
            workOrder.setActualStartTime(LocalDateTime.now());
            workOrder.setProductionUserId(UserContextUtil.getUserId());
            workOrder.setProductionUserName(UserContextUtil.getUsername());
            workOrderMapper.updateById(workOrder);

            List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectList(
                    new LambdaQueryWrapper<WorkOrderMaterial>()
                            .eq(WorkOrderMaterial::getWorkOrderId, dto.getWorkOrderId())
            );
            for (WorkOrderMaterial mat : materials) {
                materialMapper.freezeStock(mat.getMaterialId(), mat.getRequiredQuantity());
            }
        }

        process.setStatus(1);
        process.setStartTime(LocalDateTime.now());
        process.setOperatorId(UserContextUtil.getUserId());
        process.setOperatorName(UserContextUtil.getUsername());
        process.setOperationContent(dto.getOperationContent());
        workOrderProcessMapper.updateById(process);

        workOrder.setCurrentProcess(process.getProcessName());
        workOrderMapper.updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void completeProcess(ProcessOperationDTO dto) {
        WorkOrder workOrder = workOrderMapper.selectById(dto.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        WorkOrderProcess process = workOrderProcessMapper.selectOne(
                new LambdaQueryWrapper<WorkOrderProcess>()
                        .eq(WorkOrderProcess::getWorkOrderId, dto.getWorkOrderId())
                        .eq(WorkOrderProcess::getProcessCode, dto.getProcessCode())
        );
        if (process == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST.getCode(), "工序不存在");
        }
        if (process.getStatus() != 1) {
            throw new BusinessException("该工序未开始或已完成");
        }

        process.setStatus(2);
        process.setEndTime(LocalDateTime.now());
        process.setInspectionResult(dto.getInspectionResult());
        process.setRemark(dto.getRemark());
        workOrderProcessMapper.updateById(process);

        if (dto.getQualifiedQuantity() != null) {
            workOrder.setQualifiedQuantity(workOrder.getQualifiedQuantity().add(dto.getQualifiedQuantity()));
        }
        if (dto.getScrapQuantity() != null) {
            workOrder.setScrapQuantity(workOrder.getScrapQuantity().add(dto.getScrapQuantity()));
        }

        boolean allCompleted = workOrderProcessMapper.selectCount(
                new LambdaQueryWrapper<WorkOrderProcess>()
                        .eq(WorkOrderProcess::getWorkOrderId, dto.getWorkOrderId())
                        .eq(WorkOrderProcess::getStatus, 2)
        ) == WorkOrderConstants.PRODUCTION_PROCESSES.size();

        if (allCompleted) {
            workOrder.setStatus(WorkOrderConstants.STATUS_FINISHED);
            workOrder.setActualEndTime(LocalDateTime.now());
            workOrder.setActualQuantity(workOrder.getQualifiedQuantity());
            workOrder.setQualityUserId(UserContextUtil.getUserId());
            workOrder.setQualityUserName(UserContextUtil.getUsername());
            workOrder.setCurrentProcess("已完成");

            List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectList(
                    new LambdaQueryWrapper<WorkOrderMaterial>()
                            .eq(WorkOrderMaterial::getWorkOrderId, dto.getWorkOrderId())
            );
            for (WorkOrderMaterial mat : materials) {
                materialMapper.unfreezeStock(mat.getMaterialId(), mat.getRequiredQuantity());
                materialMapper.reduceStock(mat.getMaterialId(), mat.getRequiredQuantity());
            }
        }

        workOrderMapper.updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void pauseWorkOrder(Long id, String reason) {
        WorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (workOrder.getStatus() != WorkOrderConstants.STATUS_IN_PRODUCTION) {
            throw new BusinessException("只有生产中的工单可以暂停");
        }

        workOrder.setStatus(WorkOrderConstants.STATUS_PAUSED);
        workOrder.setRemark(StrUtil.isNotBlank(reason) ? reason : "手动暂停");
        workOrderMapper.updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void resumeWorkOrder(Long id) {
        WorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (workOrder.getStatus() != WorkOrderConstants.STATUS_PAUSED) {
            throw new BusinessException("只有暂停状态的工单可以恢复");
        }

        workOrder.setStatus(WorkOrderConstants.STATUS_IN_PRODUCTION);
        workOrder.setAutoPaused(0);
        workOrderMapper.updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancelWorkOrder(Long id, String reason) {
        WorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (workOrder.getStatus() == WorkOrderConstants.STATUS_FINISHED) {
            throw new BusinessException("已完成的工单不能取消");
        }

        if (workOrder.getStatus() == WorkOrderConstants.STATUS_IN_PRODUCTION) {
            List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectList(
                    new LambdaQueryWrapper<WorkOrderMaterial>()
                            .eq(WorkOrderMaterial::getWorkOrderId, id)
            );
            for (WorkOrderMaterial mat : materials) {
                materialMapper.unfreezeStock(mat.getMaterialId(), mat.getRequiredQuantity());
            }
        }

        workOrder.setStatus(WorkOrderConstants.STATUS_CANCELLED);
        workOrder.setRemark(StrUtil.isNotBlank(reason) ? reason : "工单取消");
        workOrderMapper.updateById(workOrder);
    }

    @Override
    public List<WorkOrderProcess> getWorkOrderProcesses(Long workOrderId) {
        return workOrderProcessMapper.selectList(
                new LambdaQueryWrapper<WorkOrderProcess>()
                        .eq(WorkOrderProcess::getWorkOrderId, workOrderId)
                        .orderByAsc(WorkOrderProcess::getProcessSort)
        );
    }

    @Override
    public List<WorkOrderMaterial> getWorkOrderMaterials(Long workOrderId) {
        return workOrderMaterialMapper.selectList(
                new LambdaQueryWrapper<WorkOrderMaterial>()
                        .eq(WorkOrderMaterial::getWorkOrderId, workOrderId)
        );
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void autoPauseOverdueOrders() {
        LocalDateTime now = LocalDateTime.now();
        List<WorkOrder> pendingOrders = workOrderMapper.selectList(
                new LambdaQueryWrapper<WorkOrder>()
                        .eq(WorkOrder::getStatus, WorkOrderConstants.STATUS_PENDING)
                        .lt(WorkOrder::getPlanStartTime, now.minusDays(3))
        );

        for (WorkOrder order : pendingOrders) {
            order.setStatus(WorkOrderConstants.STATUS_PAUSED);
            order.setAutoPaused(1);
            order.setRemark("系统自动暂停：超出规定周期未投产");
            workOrderMapper.updateById(order);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void pickMaterial(WorkOrderPickMaterialDTO dto) {
        WorkOrder workOrder = workOrderMapper.selectById(dto.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (workOrder.getStatus() != WorkOrderConstants.STATUS_IN_PRODUCTION) {
            throw new BusinessException("只有生产中的工单可以领料");
        }

        WorkOrderMaterial workOrderMaterial = workOrderMaterialMapper.selectOne(
                new LambdaQueryWrapper<WorkOrderMaterial>()
                        .eq(WorkOrderMaterial::getWorkOrderId, dto.getWorkOrderId())
                        .eq(WorkOrderMaterial::getMaterialId, dto.getMaterialId())
        );
        if (workOrderMaterial == null) {
            throw new BusinessException("该工单未配置此物资");
        }

        BigDecimal pickedQuantity = workOrderMaterial.getPickedQuantity() != null
                ? workOrderMaterial.getPickedQuantity() : BigDecimal.ZERO;
        if (pickedQuantity.add(dto.getQuantity()).compareTo(workOrderMaterial.getRequiredQuantity()) > 0) {
            throw new BusinessException("领料数量超出工单需求");
        }

        materialService.stockOut(dto.getWorkOrderId(), dto.getMaterialId(), dto.getBatchId(), dto.getQuantity(), dto.getRemark());

        workOrderMaterial.setPickedQuantity(pickedQuantity.add(dto.getQuantity()));
        workOrderMaterialMapper.updateById(workOrderMaterial);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void returnMaterial(WorkOrderPickMaterialDTO dto) {
        WorkOrder workOrder = workOrderMapper.selectById(dto.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        WorkOrderMaterial workOrderMaterial = workOrderMaterialMapper.selectOne(
                new LambdaQueryWrapper<WorkOrderMaterial>()
                        .eq(WorkOrderMaterial::getWorkOrderId, dto.getWorkOrderId())
                        .eq(WorkOrderMaterial::getMaterialId, dto.getMaterialId())
        );
        if (workOrderMaterial == null) {
            throw new BusinessException("该工单未配置此物资");
        }

        BigDecimal pickedQuantity = workOrderMaterial.getPickedQuantity() != null
                ? workOrderMaterial.getPickedQuantity() : BigDecimal.ZERO;
        if (pickedQuantity.compareTo(dto.getQuantity()) < 0) {
            throw new BusinessException("退料数量超出已领料数量");
        }

        materialService.stockReturn(dto.getWorkOrderId(), dto.getMaterialId(), dto.getBatchId(), dto.getQuantity(), dto.getRemark());

        workOrderMaterial.setPickedQuantity(pickedQuantity.subtract(dto.getQuantity()));
        workOrderMaterialMapper.updateById(workOrderMaterial);
    }

    @Override
    public WorkOrderProgressVO getWorkOrderProgress(Long workOrderId) {
        WorkOrder workOrder = workOrderMapper.selectById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        List<WorkOrderProcess> processes = workOrderProcessMapper.selectList(
                new LambdaQueryWrapper<WorkOrderProcess>()
                        .eq(WorkOrderProcess::getWorkOrderId, workOrderId)
                        .orderByAsc(WorkOrderProcess::getProcessSort)
        );

        int totalProcesses = processes.size();
        int completedProcesses = (int) processes.stream().filter(p -> p.getStatus() == 2).count();

        WorkOrderProgressVO vo = new WorkOrderProgressVO();
        vo.setId(workOrder.getId());
        vo.setOrderNo(workOrder.getOrderNo());
        vo.setProductName(workOrder.getProductName());
        vo.setPlanQuantity(workOrder.getPlanQuantity());
        vo.setActualQuantity(workOrder.getActualQuantity());
        vo.setQualifiedQuantity(workOrder.getQualifiedQuantity());
        vo.setScrapQuantity(workOrder.getScrapQuantity());
        vo.setStatus(workOrder.getStatus());
        vo.setStatusName(getStatusName(workOrder.getStatus()));
        vo.setPlanStartTime(workOrder.getPlanStartTime());
        vo.setActualStartTime(workOrder.getActualStartTime());
        vo.setActualEndTime(workOrder.getActualEndTime());
        vo.setTotalProcesses(totalProcesses);
        vo.setCompletedProcesses(completedProcesses);

        if (totalProcesses > 0) {
            vo.setProgress(new BigDecimal(completedProcesses)
                    .divide(new BigDecimal(totalProcesses), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100)));
        } else {
            vo.setProgress(BigDecimal.ZERO);
        }

        vo.setCurrentProcess(workOrder.getCurrentProcess());

        List<WorkOrderProgressVO.ProcessProgressVO> processVOS = processes.stream().map(p -> {
            WorkOrderProgressVO.ProcessProgressVO pvo = new WorkOrderProgressVO.ProcessProgressVO();
            pvo.setId(p.getId());
            pvo.setProcessCode(p.getProcessCode());
            pvo.setProcessName(p.getProcessName());
            pvo.setSortOrder(p.getProcessSort());
            pvo.setStatus(p.getStatus());
            pvo.setStatusName(getProcessStatusName(p.getStatus()));
            pvo.setStartTime(p.getStartTime());
            pvo.setEndTime(p.getEndTime());
            pvo.setOperatorName(p.getOperatorName());
            pvo.setInspectionResult(p.getInspectionResult());
            return pvo;
        }).collect(Collectors.toList());

        vo.setProcesses(processVOS);
        return vo;
    }

    @Override
    public List<WorkOrder> searchWorkOrders(String keyword, Integer status, String productCategory) {
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();

        if (StrUtil.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(WorkOrder::getOrderNo, keyword)
                    .or().like(WorkOrder::getProductName, keyword));
        }
        if (status != null) {
            wrapper.eq(WorkOrder::getStatus, status);
        }
        if (StrUtil.isNotBlank(productCategory)) {
            wrapper.eq(WorkOrder::getCategoryId, productCategory);
        }

        wrapper.orderByDesc(WorkOrder::getCreateTime);
        return workOrderMapper.selectList(wrapper);
    }

    private String getStatusName(Integer status) {
        Map<Integer, String> statusMap = Map.of(
                WorkOrderConstants.STATUS_PENDING, "待排产",
                WorkOrderConstants.STATUS_IN_PRODUCTION, "生产中",
                WorkOrderConstants.STATUS_PAUSED, "已暂停",
                WorkOrderConstants.STATUS_FINISHED, "已完成",
                WorkOrderConstants.STATUS_CANCELLED, "已取消"
        );
        return statusMap.getOrDefault(status, "未知");
    }

    private String getProcessStatusName(Integer status) {
        Map<Integer, String> statusMap = Map.of(
                0, "未开始",
                1, "进行中",
                2, "已完成"
        );
        return statusMap.getOrDefault(status, "未知");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void approveWorkOrder(Long id, String remark) {
        WorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        if (workOrder.getAuditStatus() != null && workOrder.getAuditStatus() == WorkOrderConstants.AUDIT_STATUS_APPROVED) {
            throw new BusinessException("工单已审核通过，无需重复审核");
        }

        if (workOrder.getStatus() != WorkOrderConstants.STATUS_PENDING) {
            throw new BusinessException("只有待排产状态的工单可以审核");
        }

        List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectList(
                new LambdaQueryWrapper<WorkOrderMaterial>()
                        .eq(WorkOrderMaterial::getWorkOrderId, id)
        );

        if (materials.isEmpty()) {
            throw new BusinessException("工单未配置生产物料，无法审核通过");
        }

        for (WorkOrderMaterial mat : materials) {
            Material material = materialMapper.selectById(mat.getMaterialId());
            if (material == null) {
                throw new BusinessException("物料不存在：" + mat.getMaterialName());
            }

            BigDecimal availableStock = material.getAvailableStock() != null ? material.getAvailableStock() : BigDecimal.ZERO;
            BigDecimal requiredQuantity = mat.getRequiredQuantity() != null ? mat.getRequiredQuantity() : BigDecimal.ZERO;

            if (availableStock.compareTo(requiredQuantity) < 0) {
                throw new BusinessException("物料库存不足：" + mat.getMaterialName() +
                        "，可用库存：" + availableStock + mat.getUnit() +
                        "，需求：" + requiredQuantity + mat.getUnit());
            }

            materialMapper.freezeStock(mat.getMaterialId(), requiredQuantity);
        }

        workOrder.setAuditStatus(WorkOrderConstants.AUDIT_STATUS_APPROVED);
        workOrder.setAuditUserId(UserContextUtil.getUserId());
        workOrder.setAuditUserName(UserContextUtil.getUsername());
        workOrder.setAuditTime(LocalDateTime.now());
        workOrder.setAuditRemark(remark);
        workOrder.setStatus(WorkOrderConstants.STATUS_IN_PRODUCTION);
        workOrder.setActualStartTime(LocalDateTime.now());
        workOrder.setProductionUserId(UserContextUtil.getUserId());
        workOrder.setProductionUserName(UserContextUtil.getUsername());
        workOrderMapper.updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void rejectWorkOrder(Long id, String remark) {
        WorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        if (workOrder.getAuditStatus() != null && workOrder.getAuditStatus() == WorkOrderConstants.AUDIT_STATUS_APPROVED) {
            throw new BusinessException("工单已审核通过，无法驳回");
        }

        workOrder.setAuditStatus(WorkOrderConstants.AUDIT_STATUS_REJECTED);
        workOrder.setAuditUserId(UserContextUtil.getUserId());
        workOrder.setAuditUserName(UserContextUtil.getUsername());
        workOrder.setAuditTime(LocalDateTime.now());
        workOrder.setAuditRemark(remark);
        workOrderMapper.updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addLaborRecord(WorkOrderLabor labor) {
        WorkOrder workOrder = workOrderMapper.selectById(labor.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        if (labor.getWorkHours() == null || labor.getWorkHours().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("工时必须大于0");
        }
        if (labor.getHourlyRate() == null || labor.getHourlyRate().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("小时费率必须大于0");
        }

        BigDecimal laborCost = labor.getWorkHours().multiply(labor.getHourlyRate());
        labor.setLaborCost(laborCost);

        if (labor.getStartTime() == null) {
            labor.setStartTime(LocalDateTime.now());
        }
        if (labor.getEndTime() == null && labor.getWorkHours() != null) {
            labor.setEndTime(labor.getStartTime().plusMinutes(labor.getWorkHours().multiply(new BigDecimal(60)).longValue()));
        }

        workOrderLaborMapper.insert(labor);
    }

    @Override
    public List<WorkOrderLabor> getWorkOrderLabors(Long workOrderId) {
        return workOrderLaborMapper.selectList(
                new LambdaQueryWrapper<WorkOrderLabor>()
                        .eq(WorkOrderLabor::getWorkOrderId, workOrderId)
                        .orderByDesc(WorkOrderLabor::getCreateTime)
        );
    }
}
