package com.household.management.service;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.household.management.common.entity.PageQuery;
import com.household.management.common.exception.BusinessException;
import com.household.management.common.result.ResultCode;
import com.household.management.entity.*;
import com.household.management.mapper.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
public class ProductionWorkOrderService {

    private final ProductionWorkOrderMapper workOrderMapper;
    private final ProductMapper productMapper;
    private final WorkOrderMaterialMapper workOrderMaterialMapper;
    private final WorkOrderProcessMapper workOrderProcessMapper;
    private final RawMaterialStockMapper rawMaterialStockMapper;
    private final RawMaterialMapper rawMaterialMapper;
    private final FinishedProductInboundMapper finishedProductInboundMapper;
    private final FinishedProductStockMapper finishedProductStockMapper;

    private static final Map<String, String> PROCESS_MAP = new LinkedHashMap<>();
    static {
        PROCESS_MAP.put("PREPARE", "原料分拣备料");
        PROCESS_MAP.put("INJECTION", "注塑成型");
        PROCESS_MAP.put("CUTTING", "裁剪加工");
        PROCESS_MAP.put("ASSEMBLY", "组装拼接");
        PROCESS_MAP.put("QC", "清洁质检");
        PROCESS_MAP.put("PACKAGE", "打包封装");
        PROCESS_MAP.put("FINISHED", "成品入库");
    }

    public ProductionWorkOrderService(ProductionWorkOrderMapper workOrderMapper,
                                      ProductMapper productMapper,
                                      WorkOrderMaterialMapper workOrderMaterialMapper,
                                      WorkOrderProcessMapper workOrderProcessMapper,
                                      RawMaterialStockMapper rawMaterialStockMapper,
                                      RawMaterialMapper rawMaterialMapper,
                                      FinishedProductInboundMapper finishedProductInboundMapper,
                                      FinishedProductStockMapper finishedProductStockMapper) {
        this.workOrderMapper = workOrderMapper;
        this.productMapper = productMapper;
        this.workOrderMaterialMapper = workOrderMaterialMapper;
        this.workOrderProcessMapper = workOrderProcessMapper;
        this.rawMaterialStockMapper = rawMaterialStockMapper;
        this.rawMaterialMapper = rawMaterialMapper;
        this.finishedProductInboundMapper = finishedProductInboundMapper;
        this.finishedProductStockMapper = finishedProductStockMapper;
    }

    public List<ProductionWorkOrder> list() {
        List<ProductionWorkOrder> orders = workOrderMapper.selectWorkOrderList();
        LocalDate today = LocalDate.now();
        for (ProductionWorkOrder order : orders) {
            updateOrderOverdueStatus(order, today);
        }
        return orders;
    }

    public IPage<ProductionWorkOrder> page(PageQuery pageQuery, Integer status, Long productId) {
        LambdaQueryWrapper<ProductionWorkOrder> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(ProductionWorkOrder::getStatus, status);
        }
        if (productId != null) {
            wrapper.eq(ProductionWorkOrder::getProductId, productId);
        }
        wrapper.orderByDesc(ProductionWorkOrder::getPriority).orderByDesc(ProductionWorkOrder::getCreateTime);
        IPage<ProductionWorkOrder> page = workOrderMapper.selectPage(new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()), wrapper);
        LocalDate today = LocalDate.now();
        for (ProductionWorkOrder order : page.getRecords()) {
            updateOrderOverdueStatus(order, today);
        }
        return page;
    }

    public ProductionWorkOrder getById(Long id) {
        ProductionWorkOrder order = workOrderMapper.selectWorkOrderDetail(id);
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        updateOrderOverdueStatus(order, LocalDate.now());
        return order;
    }

    public List<WorkOrderMaterial> getWorkOrderMaterials(Long workOrderId) {
        return workOrderMaterialMapper.selectByWorkOrderId(workOrderId);
    }

    public List<WorkOrderProcess> getWorkOrderProcesses(Long workOrderId) {
        return workOrderProcessMapper.selectByWorkOrderId(workOrderId);
    }

    private void updateOrderOverdueStatus(ProductionWorkOrder order, LocalDate today) {
        if (order.getStatus() == 2 && order.getPlanEndDate() != null) {
            order.setIsOverdue(order.getPlanEndDate().isBefore(today));
        } else {
            order.setIsOverdue(false);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void add(ProductionWorkOrder workOrder) {
        Product product = productMapper.selectById(workOrder.getProductId());
        if (product == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (product.getStatus() == 0) {
            throw new BusinessException("该产品已下架停产，无法创建工单");
        }

        String workOrderNo = generateWorkOrderNo();
        workOrder.setWorkOrderNo(workOrderNo);
        workOrder.setStatus(1);
        workOrder.setCurrentProcess("PREPARE");
        workOrder.setIsAutoPaused(0);
        if (workOrder.getPriority() == null) {
            workOrder.setPriority(0);
        }
        workOrderMapper.insert(workOrder);
        log.info("创建生产工单：{} - {}", workOrderNo, product.getProductName());
    }

    @Transactional(rollbackFor = Exception.class)
    public void addWorkOrderMaterial(Long workOrderId, List<WorkOrderMaterial> materials) {
        ProductionWorkOrder order = workOrderMapper.selectById(workOrderId);
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (order.getStatus() != 1) {
            throw new BusinessException("只有待排产的工单才能添加用料");
        }

        workOrderMaterialMapper.delete(new LambdaQueryWrapper<WorkOrderMaterial>()
                .eq(WorkOrderMaterial::getWorkOrderId, workOrderId));

        for (WorkOrderMaterial material : materials) {
            RawMaterial rawMaterial = rawMaterialMapper.selectById(material.getMaterialId());
            if (rawMaterial == null) {
                throw new BusinessException("原料不存在：" + material.getMaterialId());
            }
            material.setWorkOrderId(workOrderId);
            material.setStatus(1);
            material.setCreateTime(LocalDateTime.now());
            workOrderMaterialMapper.insert(material);
        }

        log.info("工单 {} 添加用料明细 {} 条", order.getWorkOrderNo(), materials.size());
    }

    @Transactional(rollbackFor = Exception.class)
    public void pickMaterial(Long workOrderId, Long materialId, BigDecimal quantity, String batchNo) {
        WorkOrderMaterial workOrderMaterial = workOrderMaterialMapper.selectOne(
                new LambdaQueryWrapper<WorkOrderMaterial>()
                        .eq(WorkOrderMaterial::getWorkOrderId, workOrderId)
                        .eq(WorkOrderMaterial::getMaterialId, materialId));

        if (workOrderMaterial == null) {
            throw new BusinessException("工单用料不存在");
        }
        if (workOrderMaterial.getStatus() == 2) {
            throw new BusinessException("该原料已领料");
        }

        RawMaterialStock stock = rawMaterialStockMapper.selectOne(
                new LambdaQueryWrapper<RawMaterialStock>()
                        .eq(RawMaterialStock::getBatchNo, batchNo)
                        .eq(RawMaterialStock::getStatus, 1));

        if (stock == null) {
            throw new BusinessException("批次库存不存在");
        }
        if (stock.getQuantity().compareTo(quantity) < 0) {
            throw new BusinessException("库存不足");
        }

        stock.setQuantity(stock.getQuantity().subtract(quantity));
        if (stock.getLockedQuantity() != null && stock.getLockedQuantity().compareTo(quantity) >= 0) {
            stock.setLockedQuantity(stock.getLockedQuantity().subtract(quantity));
        }
        if (stock.getQuantity().compareTo(BigDecimal.ZERO) == 0) {
            stock.setStatus(0);
        }
        rawMaterialStockMapper.updateById(stock);

        workOrderMaterial.setActualQuantity(quantity);
        workOrderMaterial.setBatchNo(batchNo);
        workOrderMaterial.setUnitPrice(stock.getUnitPrice());
        workOrderMaterial.setTotalAmount(stock.getUnitPrice().multiply(quantity));
        workOrderMaterial.setStatus(2);
        workOrderMaterial.setLockedStatus(0);
        workOrderMaterialMapper.updateById(workOrderMaterial);

        updateMaterialStatus(stock.getMaterialId());

        log.info("工单领料：工单={}, 原料={}, 数量={}, 批次={}", workOrderId, materialId, quantity, batchNo);
    }

    private void updateMaterialStatus(Long materialId) {
        RawMaterial material = rawMaterialMapper.selectMaterialWithStockById(materialId);
        if (material != null) {
            BigDecimal currentStock = material.getCurrentStock() != null ? material.getCurrentStock() : BigDecimal.ZERO;
            if (material.getStatus() == 3) {
                return;
            }
            if (currentStock.compareTo(material.getWarnStock()) <= 0) {
                material.setStatus(2);
            } else {
                material.setStatus(1);
            }
            rawMaterialMapper.updateById(material);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(ProductionWorkOrder workOrder) {
        ProductionWorkOrder existing = workOrderMapper.selectById(workOrder.getId());
        if (existing == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (existing.getStatus() >= 3) {
            throw new BusinessException("工单已暂停、完成或取消，无法修改");
        }
        workOrderMapper.updateById(workOrder);
        log.info("更新生产工单：{}", existing.getWorkOrderNo());
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        ProductionWorkOrder order = workOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (order.getStatus() == 2) {
            throw new BusinessException("工单生产中，无法删除");
        }

        unlockWorkOrderMaterials(id);

        workOrderMaterialMapper.delete(new LambdaQueryWrapper<WorkOrderMaterial>()
                .eq(WorkOrderMaterial::getWorkOrderId, id));
        workOrderProcessMapper.delete(new LambdaQueryWrapper<WorkOrderProcess>()
                .eq(WorkOrderProcess::getWorkOrderId, id));
        workOrderMapper.deleteById(id);
        log.info("删除生产工单：{}", order.getWorkOrderNo());
    }

    private void unlockWorkOrderMaterials(Long workOrderId) {
        List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectByWorkOrderId(workOrderId);
        for (WorkOrderMaterial material : materials) {
            if (material.getLockedStatus() != null && material.getLockedStatus() == 1 && material.getBatchNo() != null) {
                List<RawMaterialStock> stocks = rawMaterialStockMapper.selectList(
                        new LambdaQueryWrapper<RawMaterialStock>()
                                .eq(RawMaterialStock::getBatchNo, material.getBatchNo())
                                .eq(RawMaterialStock::getStatus, 1));
                for (RawMaterialStock stock : stocks) {
                    rawMaterialStockMapper.unlockStock(stock.getId(), material.getRequiredQuantity());
                }
            }
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void confirmProductionPlan(Long workOrderId) {
        ProductionWorkOrder order = workOrderMapper.selectById(workOrderId);
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (order.getStatus() != 1) {
            throw new BusinessException("只有待排产的工单才能确定量产方案");
        }

        List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectByWorkOrderId(workOrderId);
        if (materials.isEmpty()) {
            throw new BusinessException("请先添加工单用料明细");
        }

        for (WorkOrderMaterial material : materials) {
            if (material.getLockedStatus() != null && material.getLockedStatus() == 1) {
                continue;
            }

            BigDecimal requiredQuantity = material.getRequiredQuantity();
            List<RawMaterialStock> availableStocks = rawMaterialStockMapper.selectAvailableStockByMaterialId(material.getMaterialId());

            BigDecimal totalAvailable = BigDecimal.ZERO;
            for (RawMaterialStock stock : availableStocks) {
                BigDecimal available = stock.getQuantity().subtract(stock.getLockedQuantity() != null ? stock.getLockedQuantity() : BigDecimal.ZERO);
                totalAvailable = totalAvailable.add(available);
            }

            if (totalAvailable.compareTo(requiredQuantity) < 0) {
                RawMaterial rawMaterial = rawMaterialMapper.selectById(material.getMaterialId());
                throw new BusinessException("原料库存不足：" + (rawMaterial != null ? rawMaterial.getMaterialName() : material.getMaterialId())
                        + "，需求：" + requiredQuantity + "，可用：" + totalAvailable);
            }

            BigDecimal remainingToLock = requiredQuantity;
            for (RawMaterialStock stock : availableStocks) {
                if (remainingToLock.compareTo(BigDecimal.ZERO) <= 0) {
                    break;
                }
                BigDecimal available = stock.getQuantity().subtract(stock.getLockedQuantity() != null ? stock.getLockedQuantity() : BigDecimal.ZERO);
                BigDecimal lockQuantity = remainingToLock.min(available);

                int lockResult = rawMaterialStockMapper.lockStock(stock.getId(), lockQuantity);
                if (lockResult > 0) {
                    remainingToLock = remainingToLock.subtract(lockQuantity);
                    material.setBatchNo(stock.getBatchNo());
                }
            }

            material.setLockedStatus(1);
            material.setLockedTime(LocalDateTime.now());
            workOrderMaterialMapper.updateById(material);
        }

        order.setStatus(1);
        order.setRemark("量产方案已确认，原料已锁定");
        workOrderMapper.updateById(order);

        log.info("工单 {} 量产方案已确认，原料已锁定", order.getWorkOrderNo());
    }

    @Transactional(rollbackFor = Exception.class)
    public void startProduction(Long id) {
        ProductionWorkOrder order = workOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (order.getStatus() != 1 && order.getStatus() != 3) {
            throw new BusinessException("只有待排产或已暂停的工单才能开始生产");
        }

        List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectByWorkOrderId(id);
        if (materials.isEmpty()) {
            throw new BusinessException("请先添加工单用料明细");
        }

        boolean allLocked = materials.stream().allMatch(m -> m.getLockedStatus() != null && m.getLockedStatus() == 1);
        if (!allLocked) {
            throw new BusinessException("请先确定量产方案并锁定原材料库存");
        }

        order.setStatus(2);
        order.setActualStartDate(LocalDateTime.now());
        order.setCurrentProcess("PREPARE");
        order.setIsAutoPaused(0);
        workOrderMapper.updateById(order);

        WorkOrderProcess process = new WorkOrderProcess();
        process.setWorkOrderId(id);
        process.setProcessCode("PREPARE");
        process.setProcessName("原料分拣备料");
        process.setStartTime(LocalDateTime.now());
        process.setStatus(1);
        process.setCreateTime(LocalDateTime.now());
        workOrderProcessMapper.insert(process);

        log.info("开始生产工单：{}", order.getWorkOrderNo());
    }

    @Transactional(rollbackFor = Exception.class)
    public void completeProcess(Long id, Long operatorId, Integer qualifiedQuantity, Integer defectiveQuantity, String remark) {
        ProductionWorkOrder order = workOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (order.getStatus() != 2) {
            throw new BusinessException("只有生产中的工单才能完成工序");
        }

        WorkOrderProcess currentProcess = workOrderProcessMapper.selectOne(
                new LambdaQueryWrapper<WorkOrderProcess>()
                        .eq(WorkOrderProcess::getWorkOrderId, id)
                        .eq(WorkOrderProcess::getStatus, 1)
                        .orderByDesc(WorkOrderProcess::getId)
                        .last("LIMIT 1"));

        if (currentProcess == null) {
            throw new BusinessException("没有进行中的工序");
        }

        currentProcess.setEndTime(LocalDateTime.now());
        currentProcess.setOperatorId(operatorId);
        currentProcess.setQuantity(qualifiedQuantity + defectiveQuantity);
        currentProcess.setQualifiedQuantity(qualifiedQuantity);
        currentProcess.setDefectiveQuantity(defectiveQuantity);
        currentProcess.setRemark(remark);
        currentProcess.setStatus(2);
        workOrderProcessMapper.updateById(currentProcess);

        String currentProcessCode = order.getCurrentProcess();
        List<String> processes = new ArrayList<>(PROCESS_MAP.keySet());
        int currentIndex = processes.indexOf(currentProcessCode);

        if (currentIndex >= processes.size() - 1) {
            throw new BusinessException("所有工序已完成");
        }

        String nextProcessCode = processes.get(currentIndex + 1);

        if ("FINISHED".equals(nextProcessCode)) {
            order.setStatus(4);
            order.setActualEndDate(LocalDateTime.now());
            order.setCurrentProcess(nextProcessCode);
            workOrderMapper.updateById(order);
            createFinishedProductInbound(order, qualifiedQuantity, defectiveQuantity);
            log.info("工单 {} 所有工序完成，创建成品入库单", order.getWorkOrderNo());
        } else {
            order.setCurrentProcess(nextProcessCode);
            workOrderMapper.updateById(order);

            WorkOrderProcess nextProcess = new WorkOrderProcess();
            nextProcess.setWorkOrderId(id);
            nextProcess.setProcessCode(nextProcessCode);
            nextProcess.setProcessName(PROCESS_MAP.get(nextProcessCode));
            nextProcess.setStartTime(LocalDateTime.now());
            nextProcess.setStatus(1);
            nextProcess.setCreateTime(LocalDateTime.now());
            workOrderProcessMapper.insert(nextProcess);

            log.info("工单 {} 工序完成：{} -> {}", order.getWorkOrderNo(), currentProcessCode, nextProcessCode);
        }
    }

    private void createFinishedProductInbound(ProductionWorkOrder order, Integer qualifiedQuantity, Integer defectiveQuantity) {
        FinishedProductInbound inbound = new FinishedProductInbound();
        inbound.setInboundNo(generateInboundNo());
        inbound.setWorkOrderId(order.getId());
        inbound.setProductId(order.getProductId());
        inbound.setQuantity(qualifiedQuantity + defectiveQuantity);
        inbound.setQualifiedQuantity(qualifiedQuantity);
        inbound.setDefectiveQuantity(defectiveQuantity);
        inbound.setWarehouseLocation("成品仓-A区");
        inbound.setStatus(1);
        finishedProductInboundMapper.insert(inbound);
    }

    @Transactional(rollbackFor = Exception.class)
    public void pauseProduction(Long id, String reason) {
        ProductionWorkOrder order = workOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (order.getStatus() != 2) {
            throw new BusinessException("只有生产中的工单才能暂停");
        }

        WorkOrderProcess currentProcess = workOrderProcessMapper.selectOne(
                new LambdaQueryWrapper<WorkOrderProcess>()
                        .eq(WorkOrderProcess::getWorkOrderId, id)
                        .eq(WorkOrderProcess::getStatus, 1)
                        .orderByDesc(WorkOrderProcess::getId)
                        .last("LIMIT 1"));

        if (currentProcess != null) {
            currentProcess.setEndTime(LocalDateTime.now());
            currentProcess.setRemark("工单暂停：" + reason);
            workOrderProcessMapper.updateById(currentProcess);
        }

        order.setStatus(3);
        order.setRemark(reason);
        workOrderMapper.updateById(order);
        log.info("暂停生产工单：{}，原因：{}", order.getWorkOrderNo(), reason);
    }

    @Transactional(rollbackFor = Exception.class)
    public void cancelWorkOrder(Long id, String reason) {
        ProductionWorkOrder order = workOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (order.getStatus() == 4) {
            throw new BusinessException("工单已完成，无法取消");
        }

        unlockWorkOrderMaterials(id);

        order.setStatus(5);
        order.setRemark(reason);
        workOrderMapper.updateById(order);
        log.info("取消生产工单：{}，原因：{}", order.getWorkOrderNo(), reason);
    }

    public Map<String, String> getProcessMap() {
        return PROCESS_MAP;
    }

    private String generateWorkOrderNo() {
        String dateStr = DateUtil.format(DateUtil.date(), "yyyyMMdd");
        String uuid = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "WO" + dateStr + uuid;
    }

    private String generateInboundNo() {
        String dateStr = DateUtil.format(DateUtil.date(), "yyyyMMdd");
        String uuid = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "FPI" + dateStr + uuid;
    }
}
