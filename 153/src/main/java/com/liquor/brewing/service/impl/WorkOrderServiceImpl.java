package com.liquor.brewing.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.liquor.brewing.common.Constants;
import com.liquor.brewing.common.PageQuery;
import com.liquor.brewing.common.ResultCode;
import com.liquor.brewing.dto.WorkOrderMaterialPickDTO;
import com.liquor.brewing.dto.WorkOrderQueryDTO;
import com.liquor.brewing.entity.MaterialBatch;
import com.liquor.brewing.entity.WorkOrder;
import com.liquor.brewing.entity.WorkOrderMaterial;
import com.liquor.brewing.entity.WorkOrderProcess;
import com.liquor.brewing.exception.BusinessException;
import com.liquor.brewing.mapper.MaterialBatchMapper;
import com.liquor.brewing.mapper.WorkOrderMapper;
import com.liquor.brewing.mapper.WorkOrderMaterialMapper;
import com.liquor.brewing.mapper.WorkOrderProcessMapper;
import com.liquor.brewing.service.MaterialReservationService;
import com.liquor.brewing.service.WorkOrderService;
import com.liquor.brewing.util.CodeGenerator;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
public class WorkOrderServiceImpl extends ServiceImpl<WorkOrderMapper, WorkOrder> implements WorkOrderService {

    @Resource
    private CodeGenerator codeGenerator;

    @Resource
    private WorkOrderMaterialMapper workOrderMaterialMapper;

    @Resource
    private WorkOrderProcessMapper workOrderProcessMapper;

    @Resource
    private MaterialBatchMapper materialBatchMapper;

    @Resource
    private MaterialReservationService reservationService;

    @Value("${liquor.auto-freeze-days:7}")
    private Integer autoFreezeDays;

    private static final List<Integer> PROCESS_TYPES = Arrays.asList(10, 20, 30, 40, 50, 60, 70);
    private static final List<String> PROCESS_NAMES = Arrays.asList(
            "原料浸泡发酵", "基酒调配勾调", "酒体静置陈放",
            "无菌过滤除菌", "自动化灌装", "封口贴标", "酒水质检"
    );

    @Override
    public IPage<WorkOrder> page(String keyword, Long categoryId, Integer status, PageQuery pageQuery) {
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(WorkOrder::getOrderName, keyword)
                    .or().like(WorkOrder::getOrderNo, keyword));
        }
        if (categoryId != null) {
            wrapper.eq(WorkOrder::getCategoryId, categoryId);
        }
        if (status != null) {
            wrapper.eq(WorkOrder::getStatus, status);
        }
        wrapper.orderByDesc(WorkOrder::getPriority, WorkOrder::getCreateTime);
        return baseMapper.selectWorkOrderPage(new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()), wrapper);
    }

    @Override
    public IPage<WorkOrder> pageByCondition(WorkOrderQueryDTO query, PageQuery pageQuery) {
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(query.getKeyword())) {
            wrapper.and(w -> w.like(WorkOrder::getOrderName, query.getKeyword())
                    .or().like(WorkOrder::getOrderNo, query.getKeyword()));
        }
        if (query.getCategoryId() != null) {
            wrapper.eq(WorkOrder::getCategoryId, query.getCategoryId());
        }
        if (query.getFormulaId() != null) {
            wrapper.eq(WorkOrder::getFormulaId, query.getFormulaId());
        }
        if (query.getStatus() != null) {
            wrapper.eq(WorkOrder::getStatus, query.getStatus());
        }
        if (query.getBrewerId() != null) {
            wrapper.eq(WorkOrder::getBrewerId, query.getBrewerId());
        }
        if (query.getSupervisorId() != null) {
            wrapper.eq(WorkOrder::getSupervisorId, query.getSupervisorId());
        }
        if (query.getInspectorId() != null) {
            wrapper.eq(WorkOrder::getInspectorId, query.getInspectorId());
        }
        if (query.getPriority() != null) {
            wrapper.eq(WorkOrder::getPriority, query.getPriority());
        }
        if (query.getStartDate() != null) {
            wrapper.ge(WorkOrder::getCreateTime, query.getStartDate().atStartOfDay());
        }
        if (query.getEndDate() != null) {
            wrapper.le(WorkOrder::getCreateTime, query.getEndDate().atTime(23, 59, 59));
        }
        wrapper.orderByDesc(WorkOrder::getPriority, WorkOrder::getCreateTime);
        return baseMapper.selectWorkOrderPage(new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()), wrapper);
    }

    @Override
    public WorkOrder detail(Long id) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        workOrder.setMaterials(workOrderMaterialMapper.selectList(new LambdaQueryWrapper<WorkOrderMaterial>()
                .eq(WorkOrderMaterial::getWorkOrderId, id)));
        workOrder.setProcesses(workOrderProcessMapper.selectList(new LambdaQueryWrapper<WorkOrderProcess>()
                .eq(WorkOrderProcess::getWorkOrderId, id)
                .orderByAsc(WorkOrderProcess::getProcessType)));
        return workOrder;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void create(WorkOrder workOrder) {
        workOrder.setOrderNo(codeGenerator.generateWorkOrderCode());
        workOrder.setStatus(Constants.WorkOrderStatus.CREATED);
        save(workOrder);

        for (int i = 0; i < PROCESS_TYPES.size(); i++) {
            WorkOrderProcess process = new WorkOrderProcess();
            process.setWorkOrderId(workOrder.getId());
            process.setProcessType(PROCESS_TYPES.get(i));
            process.setProcessName(PROCESS_NAMES.get(i));
            process.setStatus(0);
            workOrderProcessMapper.insert(process);
        }

        if (workOrder.getMaterials() != null) {
            for (WorkOrderMaterial material : workOrder.getMaterials()) {
                material.setWorkOrderId(workOrder.getId());
                workOrderMaterialMapper.insert(material);

                if (material.getPlanQuantity() != null && material.getBatchId() != null) {
                    try {
                        reservationService.reserveMaterial(
                                workOrder.getId(),
                                material.getMaterialId(),
                                material.getBatchId(),
                                material.getPlanQuantity(),
                                "工单创建自动预占物料"
                        );
                    } catch (Exception e) {
                        log.warn("工单[{}]物料[{}]预占失败：{}", workOrder.getId(), material.getMaterialId(), e.getMessage());
                    }
                }
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void startProcess(Long id, Integer processType) {
        WorkOrder workOrder = getById(id);
        checkWorkOrderStatus(workOrder);

        int processIndex = PROCESS_TYPES.indexOf(processType);
        if (processIndex == -1) {
            throw new BusinessException("工序类型错误");
        }

        WorkOrderProcess process = workOrderProcessMapper.selectOne(new LambdaQueryWrapper<WorkOrderProcess>()
                .eq(WorkOrderProcess::getWorkOrderId, id)
                .eq(WorkOrderProcess::getProcessType, processType));
        if (process == null) {
            throw new BusinessException("工序不存在");
        }
        if (process.getStatus() != 0) {
            throw new BusinessException("工序已开始或已完成");
        }

        if (processIndex > 0) {
            WorkOrderProcess prevProcess = workOrderProcessMapper.selectOne(new LambdaQueryWrapper<WorkOrderProcess>()
                    .eq(WorkOrderProcess::getWorkOrderId, id)
                    .eq(WorkOrderProcess::getProcessType, PROCESS_TYPES.get(processIndex - 1)));
            if (prevProcess == null || prevProcess.getStatus() != 2) {
                throw new BusinessException("上一道工序未完成");
            }
        }

        process.setStatus(1);
        process.setStartTime(LocalDateTime.now());
        workOrderProcessMapper.updateById(process);

        workOrder.setStatus(processType);
        if (workOrder.getActualStartTime() == null) {
            workOrder.setActualStartTime(LocalDateTime.now());
        }
        updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void finishProcess(Long id, Integer processType, WorkOrderProcess processData) {
        WorkOrder workOrder = getById(id);
        checkWorkOrderStatus(workOrder);

        WorkOrderProcess process = workOrderProcessMapper.selectOne(new LambdaQueryWrapper<WorkOrderProcess>()
                .eq(WorkOrderProcess::getWorkOrderId, id)
                .eq(WorkOrderProcess::getProcessType, processType));
        if (process == null) {
            throw new BusinessException("工序不存在");
        }
        if (process.getStatus() != 1) {
            throw new BusinessException("工序未开始");
        }

        process.setStatus(2);
        process.setEndTime(LocalDateTime.now());
        process.setProcessResult(processData.getProcessResult());
        process.setProcessParams(processData.getProcessParams());
        process.setRemark(processData.getRemark());
        if (process.getStartTime() != null) {
            process.setDuration((int) Duration.between(process.getStartTime(), process.getEndTime()).toMinutes());
        }
        workOrderProcessMapper.updateById(process);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void start(Long id) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (!Constants.WorkOrderStatus.CREATED.equals(workOrder.getStatus())) {
            throw new BusinessException("工单状态错误，只有已创建的工单可以开始");
        }
        startProcess(id, PROCESS_TYPES.get(0));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void finish(Long id) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (!Constants.WorkOrderStatus.INSPECTING.equals(workOrder.getStatus())) {
            throw new BusinessException("工单状态错误，只有质检中的工单可以完成");
        }

        workOrder.setStatus(Constants.WorkOrderStatus.FINISHED);
        workOrder.setActualEndTime(LocalDateTime.now());
        updateById(workOrder);

        List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectList(
                new LambdaQueryWrapper<WorkOrderMaterial>().eq(WorkOrderMaterial::getWorkOrderId, id));
        for (WorkOrderMaterial material : materials) {
            try {
                reservationService.confirmReservation(id, material.getMaterialId());
            } catch (Exception e) {
                log.warn("工单[{}]物料[{}]预占确认失败：{}", id, material.getMaterialId(), e.getMessage());
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void freeze(Long id) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (Constants.WorkOrderStatus.FINISHED.equals(workOrder.getStatus())
                || Constants.WorkOrderStatus.CANCELLED.equals(workOrder.getStatus())) {
            throw new BusinessException("工单已完成或已取消，无法冻结");
        }
        workOrder.setStatus(Constants.WorkOrderStatus.FROZEN);
        updateById(workOrder);

        List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectList(
                new LambdaQueryWrapper<WorkOrderMaterial>().eq(WorkOrderMaterial::getWorkOrderId, id));
        for (WorkOrderMaterial material : materials) {
            try {
                reservationService.releaseReservation(id, material.getMaterialId());
            } catch (Exception e) {
                log.warn("工单[{}]物料[{}]预占释放失败：{}", id, material.getMaterialId(), e.getMessage());
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void unfreeze(Long id) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (!Constants.WorkOrderStatus.FROZEN.equals(workOrder.getStatus())) {
            throw new BusinessException("工单未冻结，无法解冻");
        }

        List<WorkOrderProcess> processes = workOrderProcessMapper.selectList(new LambdaQueryWrapper<WorkOrderProcess>()
                .eq(WorkOrderProcess::getWorkOrderId, id)
                .orderByDesc(WorkOrderProcess::getProcessType));

        int status = Constants.WorkOrderStatus.CREATED;
        for (WorkOrderProcess process : processes) {
            if (process.getStatus() == 1) {
                status = process.getProcessType();
                break;
            }
            if (process.getStatus() == 2) {
                int nextIndex = PROCESS_TYPES.indexOf(process.getProcessType()) + 1;
                if (nextIndex < PROCESS_TYPES.size()) {
                    status = PROCESS_TYPES.get(nextIndex);
                } else {
                    status = Constants.WorkOrderStatus.INSPECTING;
                }
                break;
            }
        }
        workOrder.setStatus(status);
        updateById(workOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancel(Long id) {
        WorkOrder workOrder = getById(id);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (Constants.WorkOrderStatus.FINISHED.equals(workOrder.getStatus())) {
            throw new BusinessException("工单已完成，无法取消");
        }
        workOrder.setStatus(Constants.WorkOrderStatus.CANCELLED);
        updateById(workOrder);

        List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectList(
                new LambdaQueryWrapper<WorkOrderMaterial>().eq(WorkOrderMaterial::getWorkOrderId, id));
        for (WorkOrderMaterial material : materials) {
            try {
                reservationService.releaseReservation(id, material.getMaterialId());
            } catch (Exception e) {
                log.warn("工单[{}]物料[{}]预占释放失败：{}", id, material.getMaterialId(), e.getMessage());
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void autoFreezeWorkOrders() {
        LocalDateTime freezeTime = LocalDateTime.now().minusDays(autoFreezeDays);
        List<WorkOrder> orders = list(new LambdaQueryWrapper<WorkOrder>()
                .eq(WorkOrder::getStatus, Constants.WorkOrderStatus.CREATED)
                .lt(WorkOrder::getCreateTime, freezeTime));
        for (WorkOrder order : orders) {
            order.setStatus(Constants.WorkOrderStatus.FROZEN);
            updateById(order);
        }
    }

    private void checkWorkOrderStatus(WorkOrder workOrder) {
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (Constants.WorkOrderStatus.FROZEN.equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCode.WORK_ORDER_ALREADY_FROZEN);
        }
        if (Constants.WorkOrderStatus.FINISHED.equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCode.WORK_ORDER_ALREADY_FINISHED);
        }
        if (Constants.WorkOrderStatus.CANCELLED.equals(workOrder.getStatus())) {
            throw new BusinessException("工单已取消");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void pickMaterial(WorkOrderMaterialPickDTO dto) {
        WorkOrder workOrder = getById(dto.getWorkOrderId());
        checkWorkOrderStatus(workOrder);

        MaterialBatch batch = materialBatchMapper.selectById(dto.getBatchId());
        if (batch == null) {
            throw new BusinessException("物料批次不存在");
        }
        if (!batch.getMaterialId().equals(dto.getMaterialId())) {
            throw new BusinessException("批次与物料不匹配");
        }
        if (batch.getStatus() != 1) {
            throw new BusinessException("批次已作废");
        }
        if (batch.getExpireDate() != null && batch.getExpireDate().isBefore(LocalDate.now())) {
            throw new BusinessException("物料已过期");
        }
        if (batch.getQuantity().compareTo(dto.getQuantity()) < 0) {
            throw new BusinessException("库存不足，当前库存：" + batch.getQuantity());
        }

        WorkOrderMaterial orderMaterial = workOrderMaterialMapper.selectOne(new LambdaQueryWrapper<WorkOrderMaterial>()
                .eq(WorkOrderMaterial::getWorkOrderId, dto.getWorkOrderId())
                .eq(WorkOrderMaterial::getMaterialId, dto.getMaterialId()));

        if (orderMaterial == null) {
            orderMaterial = new WorkOrderMaterial();
            orderMaterial.setWorkOrderId(dto.getWorkOrderId());
            orderMaterial.setMaterialId(dto.getMaterialId());
            orderMaterial.setBatchId(dto.getBatchId());
            orderMaterial.setActualQuantity(dto.getQuantity());
            orderMaterial.setUnit(batch.getUnit());
            orderMaterial.setUnitPrice(batch.getUnitPrice());
            orderMaterial.setTotalPrice(batch.getUnitPrice().multiply(dto.getQuantity()));
            workOrderMaterialMapper.insert(orderMaterial);
        } else {
            BigDecimal newActual = orderMaterial.getActualQuantity() != null
                    ? orderMaterial.getActualQuantity().add(dto.getQuantity())
                    : dto.getQuantity();
            orderMaterial.setActualQuantity(newActual);
            if (orderMaterial.getUnitPrice() == null) {
                orderMaterial.setUnitPrice(batch.getUnitPrice());
            }
            orderMaterial.setTotalPrice(orderMaterial.getUnitPrice().multiply(newActual));
            workOrderMaterialMapper.updateById(orderMaterial);
        }

        BigDecimal remaining = batch.getQuantity().subtract(dto.getQuantity());
        if (remaining.compareTo(BigDecimal.ZERO) == 0) {
            batch.setStatus(0);
        }
        batch.setQuantity(remaining);
        materialBatchMapper.updateById(batch);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void returnMaterial(WorkOrderMaterialPickDTO dto) {
        WorkOrder workOrder = getById(dto.getWorkOrderId());
        checkWorkOrderStatus(workOrder);

        WorkOrderMaterial orderMaterial = workOrderMaterialMapper.selectOne(new LambdaQueryWrapper<WorkOrderMaterial>()
                .eq(WorkOrderMaterial::getWorkOrderId, dto.getWorkOrderId())
                .eq(WorkOrderMaterial::getMaterialId, dto.getMaterialId()));

        if (orderMaterial == null) {
            throw new BusinessException("工单中不存在该物料");
        }
        if (orderMaterial.getActualQuantity() == null || orderMaterial.getActualQuantity().compareTo(dto.getQuantity()) < 0) {
            throw new BusinessException("退料数量超过已领料数量");
        }

        orderMaterial.setActualQuantity(orderMaterial.getActualQuantity().subtract(dto.getQuantity()));
        if (orderMaterial.getUnitPrice() != null) {
            orderMaterial.setTotalPrice(orderMaterial.getUnitPrice().multiply(orderMaterial.getActualQuantity()));
        }
        workOrderMaterialMapper.updateById(orderMaterial);

        MaterialBatch batch = materialBatchMapper.selectById(dto.getBatchId());
        if (batch != null) {
            batch.setQuantity(batch.getQuantity().add(dto.getQuantity()));
            if (batch.getStatus() == 0) {
                batch.setStatus(1);
            }
            materialBatchMapper.updateById(batch);
        }
    }

    @Override
    public List<WorkOrderMaterial> getOrderMaterials(Long workOrderId) {
        return workOrderMaterialMapper.selectList(new LambdaQueryWrapper<WorkOrderMaterial>()
                .eq(WorkOrderMaterial::getWorkOrderId, workOrderId));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateActualQuantity(Long workOrderId, Long materialId, BigDecimal actualQuantity) {
        WorkOrderMaterial orderMaterial = workOrderMaterialMapper.selectOne(new LambdaQueryWrapper<WorkOrderMaterial>()
                .eq(WorkOrderMaterial::getWorkOrderId, workOrderId)
                .eq(WorkOrderMaterial::getMaterialId, materialId));

        if (orderMaterial == null) {
            throw new BusinessException("工单中不存在该物料");
        }

        orderMaterial.setActualQuantity(actualQuantity);
        if (orderMaterial.getUnitPrice() != null) {
            orderMaterial.setTotalPrice(orderMaterial.getUnitPrice().multiply(actualQuantity));
        }
        workOrderMaterialMapper.updateById(orderMaterial);
    }
}
