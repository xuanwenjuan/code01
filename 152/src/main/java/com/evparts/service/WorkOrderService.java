package com.evparts.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.evparts.common.PageResult;
import com.evparts.common.ResultCode;
import com.evparts.dto.*;
import com.evparts.entity.*;
import com.evparts.exception.BusinessException;
import com.evparts.mapper.*;
import com.evparts.utils.CodeGenerator;
import com.evparts.utils.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
public class WorkOrderService {

    @Autowired
    private WorkOrderMapper workOrderMapper;

    @Autowired
    private WorkOrderProcessMapper processMapper;

    @Autowired
    private WorkOrderMaterialMapper materialMapper;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private MaterialMapper materialMapperRef;

    @Autowired
    private MaterialStockMapper materialStockMapper;

    @Autowired
    private SysUserMapper userMapper;

    @Autowired
    private CodeGenerator codeGenerator;

    @Autowired
    private MaterialLockLogMapper lockLogMapper;

    private static final List<String[]> PROCESSES = Arrays.asList(
            new String[]{"CUTTING", "原料裁切成型", "裁切工序"},
            new String[]{"STAMPING", "精密冲压", "冲压工序"},
            new String[]{"WINDING", "线圈绕制", "绕制工序"},
            new String[]{"ASSEMBLY", "组装装配", "组装工序"},
            new String[]{"TESTING", "通电检测", "检测工序"},
            new String[]{"DURABILITY", "耐久测试", "测试工序"},
            new String[]{"FINISHED", "成品入库", "入库工序"}
    );

    public PageResult<WorkOrder> getDetailPage(Integer pageNum, Integer pageSize,
                                               String orderNo, String productName,
                                               Long categoryId, String orderStatus,
                                               String workshop, Long operatorId,
                                               String startDate, String endDate) {
        Page<WorkOrder> page = new Page<>(pageNum, pageSize);
        IPage<WorkOrder> resultPage = workOrderMapper.getWorkOrderDetailPage(
                page, orderNo, productName, categoryId, orderStatus, workshop, operatorId, startDate, endDate
        );
        return PageResult.of(resultPage);
    }

    public PageResult<WorkOrder> getPage(WorkOrderQueryDTO queryDTO) {
        return getDetailPage(
                queryDTO.getPageNum(),
                queryDTO.getPageSize(),
                queryDTO.getOrderNo(),
                null,
                null,
                queryDTO.getOrderStatus(),
                null,
                null,
                queryDTO.getStartDate(),
                queryDTO.getEndDate()
        );
    }

    public WorkOrder getById(Long id) {
        WorkOrder order = workOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(ResultCode.WORK_ORDER_NOT_EXIST);
        }

        Product product = productMapper.selectById(order.getProductId());
        if (product != null) {
            order.setProductName(product.getProductName());
            order.setProductCode(product.getProductCode());
            order.setSpecification(product.getSpecification());
        }
        if (order.getOperatorId() != null) {
            SysUser user = userMapper.selectById(order.getOperatorId());
            if (user != null) {
                order.setOperatorName(user.getRealName());
            }
        }

        List<WorkOrderProcess> processes = workOrderMapper.getWorkOrderProcesses(id);
        order.setProcesses(processes);

        List<WorkOrderMaterial> materials = workOrderMapper.getWorkOrderMaterials(id);
        order.setMaterials(materials);

        return order;
    }

    @Transactional(rollbackFor = Exception.class)
    public void create(WorkOrderDTO dto) {
        Product product = productMapper.selectById(dto.getProductId());
        if (product == null) {
            throw new BusinessException(ResultCode.PRODUCT_NOT_EXIST);
        }
        if (product.getStatus() == 0) {
            throw new BusinessException("该产品已停产，无法创建工单");
        }

        WorkOrder order = new WorkOrder();
        order.setOrderNo(codeGenerator.generateWorkOrderNo());
        order.setProductId(dto.getProductId());
        order.setPlanQuantity(dto.getPlanQuantity());
        order.setActualQuantity(0);
        order.setBadQuantity(0);
        order.setPriority(dto.getPriority());
        order.setOrderStatus("PENDING");
        order.setPlanStartDate(dto.getPlanStartDate());
        order.setPlanEndDate(dto.getPlanEndDate());
        order.setWorkshop(dto.getWorkshop());
        order.setLine(dto.getLine());
        order.setOperatorId(dto.getOperatorId());
        order.setRemark(dto.getRemark());
        order.setCreateBy(UserContext.getUserId());
        workOrderMapper.insert(order);

        for (int i = 0; i < PROCESSES.size(); i++) {
            String[] processInfo = PROCESSES.get(i);
            WorkOrderProcess process = new WorkOrderProcess();
            process.setWorkOrderId(order.getId());
            process.setProcessCode(processInfo[0]);
            process.setProcessName(processInfo[1]);
            process.setProcessType(processInfo[0]);
            process.setSortOrder(i + 1);
            process.setProcessStatus("PENDING");
            process.setQualifiedQuantity(0);
            process.setBadQuantity(0);
            processMapper.insert(process);
        }

        if (dto.getMaterials() != null && !dto.getMaterials().isEmpty()) {
            for (WorkOrderMaterialDTO materialDTO : dto.getMaterials()) {
                Material material = materialMapperRef.selectById(materialDTO.getMaterialId());
                if (material == null) {
                    throw new BusinessException(ResultCode.MATERIAL_NOT_EXIST);
                }
                WorkOrderMaterial orderMaterial = new WorkOrderMaterial();
                orderMaterial.setWorkOrderId(order.getId());
                orderMaterial.setMaterialId(materialDTO.getMaterialId());
                orderMaterial.setPlanQuantity(materialDTO.getPlanQuantity());
                orderMaterial.setUnitPrice(materialDTO.getUnitPrice());
                orderMaterial.setTotalPrice(materialDTO.getPlanQuantity().multiply(
                        materialDTO.getUnitPrice() != null ? materialDTO.getUnitPrice() : BigDecimal.ZERO
                ));
                orderMaterial.setActualQuantity(BigDecimal.ZERO);
                orderMaterial.setRemark(materialDTO.getRemark());
                materialMapper.insert(orderMaterial);
            }
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(WorkOrderDTO dto) {
        WorkOrder order = workOrderMapper.selectById(dto.getId());
        if (order == null) {
            throw new BusinessException(ResultCode.WORK_ORDER_NOT_EXIST);
        }
        if (!"PENDING".equals(order.getOrderStatus())) {
            throw new BusinessException(ResultCode.WORK_ORDER_STATUS_ERROR);
        }
        order.setProductId(dto.getProductId());
        order.setPlanQuantity(dto.getPlanQuantity());
        order.setPriority(dto.getPriority());
        order.setPlanStartDate(dto.getPlanStartDate());
        order.setPlanEndDate(dto.getPlanEndDate());
        order.setWorkshop(dto.getWorkshop());
        order.setLine(dto.getLine());
        order.setOperatorId(dto.getOperatorId());
        order.setRemark(dto.getRemark());
        workOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void startProduction(Long id) {
        WorkOrder order = workOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(ResultCode.WORK_ORDER_NOT_EXIST);
        }
        if (!"PENDING".equals(order.getOrderStatus())) {
            throw new BusinessException(ResultCode.WORK_ORDER_STATUS_ERROR);
        }

        order.setOrderStatus("IN_PRODUCTION");
        order.setActualStartTime(LocalDateTime.now());
        workOrderMapper.updateById(order);

        List<WorkOrderProcess> processes = workOrderMapper.getWorkOrderProcesses(id);
        if (!processes.isEmpty()) {
            WorkOrderProcess firstProcess = processes.get(0);
            firstProcess.setProcessStatus("IN_PROGRESS");
            firstProcess.setStartTime(LocalDateTime.now());
            processMapper.updateById(firstProcess);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void completeProcess(Long processId, WorkOrderProcessDTO dto) {
        WorkOrderProcess process = processMapper.selectById(processId);
        if (process == null) {
            throw new BusinessException("工序不存在");
        }
        if (!"IN_PROGRESS".equals(process.getProcessStatus())) {
            throw new BusinessException("工序状态不允许操作");
        }

        process.setProcessStatus("COMPLETED");
        process.setEndTime(LocalDateTime.now());
        process.setQualifiedQuantity(dto.getQualifiedQuantity());
        process.setBadQuantity(dto.getBadQuantity());
        if (dto.getMaterialLoss() != null) {
            process.setMaterialLoss(dto.getMaterialLoss());
        }
        if (dto.getEnergyConsumption() != null) {
            process.setEnergyConsumption(dto.getEnergyConsumption());
        }
        if (dto.getLaborHours() != null) {
            process.setLaborHours(dto.getLaborHours());
        }
        if (dto.getRemark() != null) {
            process.setRemark(dto.getRemark());
        }
        process.setOperatorId(UserContext.getUserId());
        processMapper.updateById(process);

        WorkOrder order = workOrderMapper.selectById(process.getWorkOrderId());
        order.setActualQuantity(order.getActualQuantity() + dto.getQualifiedQuantity());
        order.setBadQuantity(order.getBadQuantity() + dto.getBadQuantity());

        List<WorkOrderProcess> processes = workOrderMapper.getWorkOrderProcesses(order.getId());

        boolean allCompleted = true;
        for (int i = 0; i < processes.size(); i++) {
            WorkOrderProcess p = processes.get(i);
            if (p.getId().equals(processId)) {
                if (i < processes.size() - 1) {
                    WorkOrderProcess nextProcess = processes.get(i + 1);
                    nextProcess.setProcessStatus("IN_PROGRESS");
                    nextProcess.setStartTime(LocalDateTime.now());
                    processMapper.updateById(nextProcess);
                }
            }
            if (!"COMPLETED".equals(p.getProcessStatus())) {
                allCompleted = false;
            }
        }

        if (allCompleted) {
            order.setOrderStatus("COMPLETED");
            order.setActualEndTime(LocalDateTime.now());
        }
        workOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void qualityCheck(Long processId, WorkOrderProcessDTO dto) {
        WorkOrderProcess process = processMapper.selectById(processId);
        if (process == null) {
            throw new BusinessException("工序不存在");
        }
        if (!"COMPLETED".equals(process.getProcessStatus())) {
            throw new BusinessException("工序未完成，无法质检");
        }

        if (dto.getBadQuantity() != null && dto.getBadQuantity() > 0) {
            process.setBadQuantity(process.getBadQuantity() + dto.getBadQuantity());
            process.setQualifiedQuantity(process.getQualifiedQuantity() - dto.getBadQuantity());
            process.setRemark(process.getRemark() != null ?
                    process.getRemark() + "; 质检不合格：" + dto.getRemark() :
                    "质检不合格：" + dto.getRemark());

            WorkOrder order = workOrderMapper.selectById(process.getWorkOrderId());
            order.setBadQuantity(order.getBadQuantity() + dto.getBadQuantity());
            order.setActualQuantity(order.getActualQuantity() - dto.getBadQuantity());
            workOrderMapper.updateById(order);
        } else {
            process.setRemark(process.getRemark() != null ?
                    process.getRemark() + "; 质检合格" :
                    "质检合格");
        }
        processMapper.updateById(process);
    }

    @Transactional(rollbackFor = Exception.class)
    public void suspend(Long id) {
        WorkOrder order = workOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(ResultCode.WORK_ORDER_NOT_EXIST);
        }
        if (!"PENDING".equals(order.getOrderStatus()) && !"IN_PRODUCTION".equals(order.getOrderStatus())) {
            throw new BusinessException(ResultCode.WORK_ORDER_STATUS_ERROR);
        }
        order.setOrderStatus("SUSPENDED");
        workOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void resume(Long id) {
        WorkOrder order = workOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(ResultCode.WORK_ORDER_NOT_EXIST);
        }
        if (!"SUSPENDED".equals(order.getOrderStatus())) {
            throw new BusinessException(ResultCode.WORK_ORDER_STATUS_ERROR);
        }
        if (order.getActualStartTime() == null) {
            order.setOrderStatus("PENDING");
        } else {
            order.setOrderStatus("IN_PRODUCTION");
        }
        workOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void cancel(Long id) {
        WorkOrder order = workOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(ResultCode.WORK_ORDER_NOT_EXIST);
        }
        if (!"PENDING".equals(order.getOrderStatus()) && !"SUSPENDED".equals(order.getOrderStatus())) {
            throw new BusinessException(ResultCode.WORK_ORDER_STATUS_ERROR);
        }
        order.setOrderStatus("CANCELLED");
        workOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void batchUpdateStatus(BatchWorkOrderDTO dto) {
        int rows = workOrderMapper.batchUpdateStatus(dto.getIds(), dto.getTargetStatus(), dto.getSourceStatus());
        if (rows == 0) {
            throw new BusinessException("批量操作失败，请检查工单状态");
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void pickMaterial(Long materialId, Long stockId, BigDecimal quantity) {
        WorkOrderMaterial orderMaterial = materialMapper.selectById(materialId);
        if (orderMaterial == null) {
            throw new BusinessException("工单用料记录不存在");
        }
        MaterialStock stock = materialStockMapper.selectById(stockId);
        if (stock == null) {
            throw new BusinessException(ResultCode.STOCK_NOT_EXIST);
        }
        if (stock.getQuantity().compareTo(quantity) < 0) {
            throw new BusinessException(ResultCode.STOCK_INSUFFICIENT);
        }

        materialStockMapper.updateStockQuantity(stockId, quantity.negate());

        orderMaterial.setMaterialStockId(stockId);
        orderMaterial.setActualQuantity(orderMaterial.getActualQuantity().add(quantity));
        orderMaterial.setUnitPrice(stock.getUnitPrice());
        orderMaterial.setTotalPrice(orderMaterial.getActualQuantity().multiply(
                stock.getUnitPrice() != null ? stock.getUnitPrice() : BigDecimal.ZERO
        ));
        materialMapper.updateById(orderMaterial);
    }

    public Map<String, Object> getStats(String startDate, String endDate) {
        return workOrderMapper.getWorkOrderStats(startDate, endDate);
    }

    @Transactional(rollbackFor = Exception.class)
    public void confirmProcess(Long id) {
        WorkOrder order = workOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(ResultCode.WORK_ORDER_NOT_EXIST);
        }
        if (order.getProcessConfirmed() != null && order.getProcessConfirmed() == 1) {
            throw new BusinessException("工艺已确认，无需重复操作");
        }
        if (!"PENDING".equals(order.getOrderStatus())) {
            throw new BusinessException("只有待生产工单可以确认工艺");
        }

        List<WorkOrderMaterial> materials = workOrderMapper.getWorkOrderMaterials(id);
        if (materials == null || materials.isEmpty()) {
            throw new BusinessException("工单未设置用料计划，无法确认工艺");
        }

        for (WorkOrderMaterial orderMaterial : materials) {
            BigDecimal availableQty = materialStockMapper.getAvailableStock(orderMaterial.getMaterialId());
            BigDecimal lockedQty = lockLogMapper.getTotalLockedQuantity(orderMaterial.getMaterialId());
            BigDecimal actualAvailable = availableQty.subtract(lockedQty);

            if (actualAvailable.compareTo(orderMaterial.getPlanQuantity()) < 0) {
                Material material = materialMapperRef.selectById(orderMaterial.getMaterialId());
                throw new BusinessException("原料【" + (material != null ? material.getMaterialName() : "") +
                        "】可用库存不足，可用：" + actualAvailable + "，需求：" + orderMaterial.getPlanQuantity());
            }
        }

        for (WorkOrderMaterial orderMaterial : materials) {
            MaterialLockLog lockLog = new MaterialLockLog();
            lockLog.setWorkOrderId(id);
            lockLog.setWorkOrderMaterialId(orderMaterial.getId());
            lockLog.setMaterialId(orderMaterial.getMaterialId());
            lockLog.setLockQuantity(orderMaterial.getPlanQuantity());
            lockLog.setLockType("PROCESS");
            lockLog.setStatus(1);
            lockLog.setOperatorId(UserContext.getUserId());
            lockLogMapper.insert(lockLog);

            orderMaterial.setLockedQuantity(orderMaterial.getPlanQuantity());
            orderMaterial.setLockStatus(1);
            orderMaterial.setLockTime(LocalDateTime.now());
            materialMapper.updateById(orderMaterial);
        }

        order.setProcessConfirmed(1);
        order.setProcessConfirmTime(LocalDateTime.now());
        order.setProcessConfirmedBy(UserContext.getUserId());
        workOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void releaseStockLock(Long id) {
        WorkOrder order = workOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(ResultCode.WORK_ORDER_NOT_EXIST);
        }

        List<WorkOrderMaterial> materials = workOrderMapper.getWorkOrderMaterials(id);
        for (WorkOrderMaterial orderMaterial : materials) {
            orderMaterial.setLockStatus(2);
            orderMaterial.setLockedQuantity(BigDecimal.ZERO);
            materialMapper.updateById(orderMaterial);
        }

        lockLogMapper.releaseByWorkOrderId(id);
    }

    public List<MaterialLockLog> getMaterialLocks(Long workOrderId) {
        return lockLogMapper.getByWorkOrderId(workOrderId);
    }

}
