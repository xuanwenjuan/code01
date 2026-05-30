package com.construction.material.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.construction.material.common.PageQuery;
import com.construction.material.common.PageResult;
import com.construction.material.common.UserContext;
import com.construction.material.dto.*;
import com.construction.material.entity.MaterialInventory;
import com.construction.material.entity.MaterialWorkOrder;
import com.construction.material.entity.WorkOrderDetail;
import com.construction.material.exception.BusinessException;
import com.construction.material.mapper.MaterialInventoryMapper;
import com.construction.material.mapper.MaterialWorkOrderMapper;
import com.construction.material.mapper.WorkOrderDetailMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaterialWorkOrderService {

    private final MaterialWorkOrderMapper workOrderMapper;
    private final WorkOrderDetailMapper detailMapper;
    private final MaterialInventoryMapper inventoryMapper;
    private final InventoryFlowService flowService;

    @Transactional(rollbackFor = Exception.class)
    public void createWorkOrder(MaterialWorkOrderDTO dto) {
        MaterialWorkOrder workOrder = new MaterialWorkOrder();
        workOrder.setOrderNo(generateOrderNo());
        workOrder.setOrderType(dto.getOrderType());
        workOrder.setOrderTypeName(getOrderTypeName(dto.getOrderType()));
        workOrder.setProjectName(dto.getProjectName());
        workOrder.setConstructionTeam(dto.getConstructionTeam());
        workOrder.setTeamLeader(dto.getTeamLeader());
        workOrder.setTeamLeaderPhone(dto.getTeamLeaderPhone());
        workOrder.setPlanUseDate(dto.getPlanUseDate());
        workOrder.setStatus(1);
        workOrder.setStatusName("待审核");
        workOrder.setRemark(dto.getRemark());

        BigDecimal totalQuantity = BigDecimal.ZERO;
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<WorkOrderDetail> details = new ArrayList<>();

        for (WorkOrderDetailDTO detailDTO : dto.getDetails()) {
            MaterialInventory inventory = inventoryMapper.selectById(detailDTO.getInventoryId());
            if (inventory == null) {
                throw new BusinessException("库存不存在: " + detailDTO.getInventoryId());
            }

            WorkOrderDetail detail = new WorkOrderDetail();
            detail.setInventoryId(detailDTO.getInventoryId());
            detail.setCategoryId(inventory.getCategoryId());
            detail.setCategoryName(inventory.getCategoryName());
            detail.setMaterialName(inventory.getMaterialName());
            detail.setSpecification(inventory.getSpecification());
            detail.setUnit(inventory.getUnit());
            detail.setPlanQuantity(detailDTO.getPlanQuantity());
            detail.setUnitPrice(inventory.getUnitPrice());
            detail.setTotalAmount(detailDTO.getPlanQuantity().multiply(inventory.getUnitPrice()));
            detail.setBatchNo(inventory.getBatchNo());
            detail.setRemark(detailDTO.getRemark());
            detail.setUsedQuantity(BigDecimal.ZERO);
            detail.setReturnedQuantity(BigDecimal.ZERO);
            detail.setLostQuantity(BigDecimal.ZERO);

            totalQuantity = totalQuantity.add(detailDTO.getPlanQuantity());
            totalAmount = totalAmount.add(detail.getTotalAmount());
            details.add(detail);
        }

        workOrder.setTotalQuantity(totalQuantity);
        workOrder.setTotalAmount(totalAmount);
        workOrder.setUsedQuantity(BigDecimal.ZERO);
        workOrder.setReturnedQuantity(BigDecimal.ZERO);
        workOrder.setLostQuantity(BigDecimal.ZERO);

        workOrderMapper.insert(workOrder);

        for (WorkOrderDetail detail : details) {
            detail.setWorkOrderId(workOrder.getId());
            detailMapper.insert(detail);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void auditWorkOrder(WorkOrderAuditDTO dto) {
        MaterialWorkOrder workOrder = workOrderMapper.selectById(dto.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        if (workOrder.getStatus() != 1) {
            throw new BusinessException("工单状态不允许审核");
        }

        if (dto.getStatus() == 2) {
            List<WorkOrderDetail> details = detailMapper.selectByWorkOrderId(dto.getWorkOrderId());
            for (WorkOrderDetail detail : details) {
                MaterialInventory inventory = inventoryMapper.selectById(detail.getInventoryId());
                if (inventory == null) {
                    throw new BusinessException("库存不存在: " + detail.getMaterialName());
                }
                BigDecimal availableQuantity = inventory.getQuantity()
                        .subtract(inventory.getLockedQuantity() != null ? inventory.getLockedQuantity() : BigDecimal.ZERO);
                if (availableQuantity.compareTo(detail.getPlanQuantity()) < 0) {
                    throw new BusinessException("可用库存不足: " + detail.getMaterialName() +
                            "，可用数量: " + availableQuantity + "，需要数量: " + detail.getPlanQuantity());
                }
                int rows = inventoryMapper.lockQuantity(detail.getInventoryId(), detail.getPlanQuantity());
                if (rows == 0) {
                    throw new BusinessException("锁定库存失败: " + detail.getMaterialName());
                }
            }

            workOrder.setStatus(2);
            workOrder.setStatusName("已审核");
            workOrder.setAuditor(UserContext.getUsername());
            workOrder.setAuditTime(LocalDateTime.now());
            workOrder.setAuditRemark(dto.getAuditRemark());
            workOrderMapper.updateById(workOrder);
        } else if (dto.getStatus() == -1) {
            workOrder.setStatus(-1);
            workOrder.setStatusName("已驳回");
            workOrder.setAuditor(UserContext.getUsername());
            workOrder.setAuditTime(LocalDateTime.now());
            workOrder.setAuditRemark(dto.getAuditRemark());
            workOrderMapper.updateById(workOrder);
        } else {
            throw new BusinessException("无效的审核状态");
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void outboundWorkOrder(Long workOrderId) {
        MaterialWorkOrder workOrder = workOrderMapper.selectById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        if (workOrder.getStatus() != 2) {
            throw new BusinessException("工单状态不允许出库");
        }

        List<WorkOrderDetail> details = detailMapper.selectByWorkOrderId(workOrderId);
        for (WorkOrderDetail detail : details) {
            MaterialInventory inventory = inventoryMapper.selectById(detail.getInventoryId());
            if (inventory == null) {
                throw new BusinessException("库存不存在: " + detail.getMaterialName());
            }
            BigDecimal oldQuantity = inventory.getQuantity();
            int rows = inventoryMapper.unlockAndDeductQuantity(detail.getInventoryId(), detail.getPlanQuantity());
            if (rows == 0) {
                throw new BusinessException("出库失败，锁定库存不足: " + detail.getMaterialName());
            }
            detail.setActualQuantity(detail.getPlanQuantity());
            detailMapper.updateById(detail);

            inventory.setQuantity(oldQuantity.subtract(detail.getPlanQuantity()));
            inventory.setLockedQuantity((inventory.getLockedQuantity() != null ? inventory.getLockedQuantity() : BigDecimal.ZERO)
                    .subtract(detail.getPlanQuantity()));

            flowService.recordFlow(
                    inventory.getId(),
                    inventory.getMaterialName(),
                    inventory.getSpecification(),
                    inventory.getUnit(),
                    inventory.getBatchNo(),
                    11,
                    oldQuantity,
                    detail.getPlanQuantity().negate(),
                    inventory.getUnitPrice(),
                    workOrder.getOrderNo(),
                    inventory.getWarehouse(),
                    "工单出库"
            );
        }

        workOrder.setStatus(3);
        workOrder.setStatusName("已出库");
        workOrder.setActualUseDate(LocalDateTime.now());
        workOrder.setWarehouseKeeper(UserContext.getUsername());
        workOrderMapper.updateById(workOrder);
    }

    @Transactional(rollbackFor = Exception.class)
    public void verifyWorkOrder(WorkOrderVerifyDTO dto) {
        MaterialWorkOrder workOrder = workOrderMapper.selectById(dto.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        if (workOrder.getStatus() != 3) {
            throw new BusinessException("工单状态不允许核销");
        }

        BigDecimal totalUsed = BigDecimal.ZERO;
        BigDecimal totalReturned = BigDecimal.ZERO;
        BigDecimal totalLost = BigDecimal.ZERO;

        for (WorkOrderVerifyDetailDTO verifyDetail : dto.getDetails()) {
            WorkOrderDetail detail = detailMapper.selectById(verifyDetail.getDetailId());
            if (detail == null) {
                throw new BusinessException("工单明细不存在");
            }
            if (!detail.getWorkOrderId().equals(dto.getWorkOrderId())) {
                throw new BusinessException("明细不属于该工单");
            }

            BigDecimal used = verifyDetail.getUsedQuantity() != null ? verifyDetail.getUsedQuantity() : BigDecimal.ZERO;
            BigDecimal returned = verifyDetail.getReturnedQuantity() != null ? verifyDetail.getReturnedQuantity() : BigDecimal.ZERO;
            BigDecimal lost = verifyDetail.getLostQuantity() != null ? verifyDetail.getLostQuantity() : BigDecimal.ZERO;

            if (used.add(returned).add(lost).compareTo(detail.getActualQuantity()) != 0) {
                throw new BusinessException("核销数量不匹配: " + detail.getMaterialName());
            }

            detail.setUsedQuantity(used);
            detail.setReturnedQuantity(returned);
            detail.setLostQuantity(lost);
            detailMapper.updateById(detail);

            if (returned.compareTo(BigDecimal.ZERO) > 0) {
                MaterialInventory inventory = inventoryMapper.selectById(detail.getInventoryId());
                if (inventory != null) {
                    BigDecimal oldQuantity = inventory.getQuantity();
                    inventoryMapper.addQuantity(detail.getInventoryId(), returned);
                    inventory.setQuantity(oldQuantity.add(returned));

                    flowService.recordFlow(
                            inventory.getId(),
                            inventory.getMaterialName(),
                            inventory.getSpecification(),
                            inventory.getUnit(),
                            inventory.getBatchNo(),
                            2,
                            oldQuantity,
                            returned,
                            inventory.getUnitPrice(),
                            workOrder.getOrderNo(),
                            inventory.getWarehouse(),
                            "余料退回"
                    );
                }
            }

            if (lost.compareTo(BigDecimal.ZERO) > 0) {
                MaterialInventory inventory = inventoryMapper.selectById(detail.getInventoryId());
                if (inventory != null) {
                    flowService.recordFlow(
                            inventory.getId(),
                            inventory.getMaterialName(),
                            inventory.getSpecification(),
                            inventory.getUnit(),
                            inventory.getBatchNo(),
                            14,
                            inventory.getQuantity(),
                            lost.negate(),
                            inventory.getUnitPrice(),
                            workOrder.getOrderNo(),
                            inventory.getWarehouse(),
                            "损耗登记"
                    );
                }
            }

            totalUsed = totalUsed.add(used);
            totalReturned = totalReturned.add(returned);
            totalLost = totalLost.add(lost);
        }

        workOrder.setUsedQuantity(totalUsed);
        workOrder.setReturnedQuantity(totalReturned);
        workOrder.setLostQuantity(totalLost);
        workOrder.setReturnDate(LocalDateTime.now());
        workOrder.setStatus(4);
        workOrder.setStatusName("已核销");
        workOrder.setRemark(dto.getRemark());
        workOrderMapper.updateById(workOrder);
    }

    public MaterialWorkOrder getWorkOrder(Long id) {
        MaterialWorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder != null) {
            workOrder.setDetails(detailMapper.selectByWorkOrderId(id));
        }
        return workOrder;
    }

    public PageResult<MaterialWorkOrder> getWorkOrderPage(PageQuery pageQuery, WorkOrderQueryDTO queryDTO) {
        LambdaQueryWrapper<MaterialWorkOrder> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(pageQuery.getKeyword())) {
            wrapper.like(MaterialWorkOrder::getOrderNo, pageQuery.getKeyword())
                    .or()
                    .like(MaterialWorkOrder::getProjectName, pageQuery.getKeyword());
        }
        if (queryDTO.getStatus() != null) {
            wrapper.eq(MaterialWorkOrder::getStatus, queryDTO.getStatus());
        }
        if (queryDTO.getOrderType() != null) {
            wrapper.eq(MaterialWorkOrder::getOrderType, queryDTO.getOrderType());
        }
        if (StringUtils.hasText(queryDTO.getProjectName())) {
            wrapper.like(MaterialWorkOrder::getProjectName, queryDTO.getProjectName());
        }
        if (StringUtils.hasText(queryDTO.getConstructionTeam())) {
            wrapper.like(MaterialWorkOrder::getConstructionTeam, queryDTO.getConstructionTeam());
        }
        if (StringUtils.hasText(queryDTO.getAuditor())) {
            wrapper.like(MaterialWorkOrder::getAuditor, queryDTO.getAuditor());
        }
        if (StringUtils.hasText(queryDTO.getWarehouseKeeper())) {
            wrapper.like(MaterialWorkOrder::getWarehouseKeeper, queryDTO.getWarehouseKeeper());
        }
        if (queryDTO.getStartDate() != null) {
            wrapper.ge(MaterialWorkOrder::getCreateTime, queryDTO.getStartDate());
        }
        if (queryDTO.getEndDate() != null) {
            wrapper.le(MaterialWorkOrder::getCreateTime, queryDTO.getEndDate());
        }

        wrapper.eq(MaterialWorkOrder::getDeleted, 0);
        wrapper.orderByDesc(MaterialWorkOrder::getCreateTime);

        Page<MaterialWorkOrder> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());
        IPage<MaterialWorkOrder> result = workOrderMapper.selectPage(page, wrapper);

        return new PageResult<>(result.getRecords(), result.getTotal(),
                (int) result.getCurrent(), (int) result.getSize());
    }

    @Transactional(rollbackFor = Exception.class)
    public void cancelWorkOrder(Long id) {
        MaterialWorkOrder workOrder = workOrderMapper.selectById(id);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (workOrder.getStatus() != 1 && workOrder.getStatus() != 2) {
            throw new BusinessException("工单状态不允许取消");
        }

        if (workOrder.getStatus() == 2) {
            List<WorkOrderDetail> details = detailMapper.selectByWorkOrderId(id);
            for (WorkOrderDetail detail : details) {
                int rows = inventoryMapper.unlockQuantity(detail.getInventoryId(), detail.getPlanQuantity());
                if (rows == 0) {
                    throw new BusinessException("释放锁定库存失败: " + detail.getMaterialName());
                }
            }
        }

        workOrder.setStatus(0);
        workOrder.setStatusName("已取消");
        workOrderMapper.updateById(workOrder);
    }

    @Transactional(rollbackFor = Exception.class)
    public void processOverdueOrders() {
        LocalDateTime expireTime = LocalDateTime.now().minusDays(7);
        List<MaterialWorkOrder> overdueOrders = workOrderMapper.selectOverdueOrders(expireTime);
        for (MaterialWorkOrder order : overdueOrders) {
            if (order.getStatus() == 1 || order.getStatus() == 2) {
                order.setStatus(-2);
                order.setStatusName("已过期");
                workOrderMapper.updateById(order);
            }
        }
    }

    public Map<String, Object> getWorkOrderStatistics(WorkOrderQueryDTO queryDTO) {
        LambdaQueryWrapper<MaterialWorkOrder> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(queryDTO.getProjectName())) {
            wrapper.like(MaterialWorkOrder::getProjectName, queryDTO.getProjectName());
        }
        if (queryDTO.getStartDate() != null) {
            wrapper.ge(MaterialWorkOrder::getCreateTime, queryDTO.getStartDate());
        }
        if (queryDTO.getEndDate() != null) {
            wrapper.le(MaterialWorkOrder::getCreateTime, queryDTO.getEndDate());
        }
        wrapper.eq(MaterialWorkOrder::getDeleted, 0);

        List<MaterialWorkOrder> workOrders = workOrderMapper.selectList(wrapper);

        Map<String, Object> stats = new HashMap<>();

        long totalCount = workOrders.size();
        long pendingAudit = workOrders.stream().filter(o -> o.getStatus() == 1).count();
        long audited = workOrders.stream().filter(o -> o.getStatus() == 2).count();
        long outbound = workOrders.stream().filter(o -> o.getStatus() == 3).count();
        long verified = workOrders.stream().filter(o -> o.getStatus() == 4).count();
        long cancelled = workOrders.stream().filter(o -> o.getStatus() == 0).count();
        long rejected = workOrders.stream().filter(o -> o.getStatus() == -1).count();
        long overdue = workOrders.stream().filter(o -> o.getStatus() == -2).count();

        BigDecimal totalAmount = workOrders.stream()
                .map(MaterialWorkOrder::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalUsedAmount = BigDecimal.ZERO;
        BigDecimal totalLostAmount = BigDecimal.ZERO;

        for (MaterialWorkOrder order : workOrders) {
            if (order.getStatus() == 4) {
                List<WorkOrderDetail> details = detailMapper.selectByWorkOrderId(order.getId());
                for (WorkOrderDetail detail : details) {
                    if (detail.getUsedQuantity() != null) {
                        totalUsedAmount = totalUsedAmount.add(
                                detail.getUsedQuantity().multiply(detail.getUnitPrice()));
                    }
                    if (detail.getLostQuantity() != null) {
                        totalLostAmount = totalLostAmount.add(
                                detail.getLostQuantity().multiply(detail.getUnitPrice()));
                    }
                }
            }
        }

        stats.put("totalCount", totalCount);
        stats.put("pendingAudit", pendingAudit);
        stats.put("audited", audited);
        stats.put("outbound", outbound);
        stats.put("verified", verified);
        stats.put("cancelled", cancelled);
        stats.put("rejected", rejected);
        stats.put("overdue", overdue);
        stats.put("totalAmount", totalAmount);
        stats.put("totalUsedAmount", totalUsedAmount);
        stats.put("totalLostAmount", totalLostAmount);

        return stats;
    }

    public List<Map<String, Object>> getProjectStatistics(WorkOrderQueryDTO queryDTO) {
        LambdaQueryWrapper<MaterialWorkOrder> wrapper = new LambdaQueryWrapper<>();

        if (queryDTO.getStartDate() != null) {
            wrapper.ge(MaterialWorkOrder::getCreateTime, queryDTO.getStartDate());
        }
        if (queryDTO.getEndDate() != null) {
            wrapper.le(MaterialWorkOrder::getCreateTime, queryDTO.getEndDate());
        }
        wrapper.eq(MaterialWorkOrder::getDeleted, 0);

        List<MaterialWorkOrder> workOrders = workOrderMapper.selectList(wrapper);

        Map<String, Map<String, Object>> projectMap = new HashMap<>();

        for (MaterialWorkOrder order : workOrders) {
            String projectName = order.getProjectName();
            Map<String, Object> projectData = projectMap.computeIfAbsent(projectName, k -> {
                Map<String, Object> map = new HashMap<>();
                map.put("projectName", projectName);
                map.put("orderCount", 0);
                map.put("totalAmount", BigDecimal.ZERO);
                map.put("totalQuantity", BigDecimal.ZERO);
                map.put("verifiedCount", 0);
                return map;
            });

            projectData.put("orderCount", (Integer) projectData.get("orderCount") + 1);
            projectData.put("totalAmount",
                    ((BigDecimal) projectData.get("totalAmount")).add(order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO));
            projectData.put("totalQuantity",
                    ((BigDecimal) projectData.get("totalQuantity")).add(order.getTotalQuantity() != null ? order.getTotalQuantity() : BigDecimal.ZERO));
            if (order.getStatus() == 4) {
                projectData.put("verifiedCount", (Integer) projectData.get("verifiedCount") + 1);
            }
        }

        List<Map<String, Object>> result = new ArrayList<>(projectMap.values());
        result.sort((a, b) -> ((BigDecimal) b.get("totalAmount")).compareTo((BigDecimal) a.get("totalAmount")));

        return result;
    }

    public List<Map<String, Object>> getTeamStatistics(WorkOrderQueryDTO queryDTO) {
        LambdaQueryWrapper<MaterialWorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialWorkOrder::getStatus, 4);
        wrapper.eq(MaterialWorkOrder::getDeleted, 0);

        if (StringUtils.hasText(queryDTO.getProjectName())) {
            wrapper.like(MaterialWorkOrder::getProjectName, queryDTO.getProjectName());
        }
        if (queryDTO.getStartDate() != null) {
            wrapper.ge(MaterialWorkOrder::getCreateTime, queryDTO.getStartDate());
        }
        if (queryDTO.getEndDate() != null) {
            wrapper.le(MaterialWorkOrder::getCreateTime, queryDTO.getEndDate());
        }

        List<MaterialWorkOrder> workOrders = workOrderMapper.selectList(wrapper);

        Map<String, Map<String, Object>> teamMap = new HashMap<>();

        for (MaterialWorkOrder order : workOrders) {
            String team = order.getConstructionTeam();
            if (!StringUtils.hasText(team)) {
                continue;
            }
            Map<String, Object> teamData = teamMap.computeIfAbsent(team, k -> {
                Map<String, Object> map = new HashMap<>();
                map.put("constructionTeam", team);
                map.put("orderCount", 0);
                map.put("totalUsedAmount", BigDecimal.ZERO);
                map.put("totalLostAmount", BigDecimal.ZERO);
                map.put("totalQuantity", BigDecimal.ZERO);
                return map;
            });

            teamData.put("orderCount", (Integer) teamData.get("orderCount") + 1);
            teamData.put("totalQuantity",
                    ((BigDecimal) teamData.get("totalQuantity")).add(order.getUsedQuantity() != null ? order.getUsedQuantity() : BigDecimal.ZERO));

            List<WorkOrderDetail> details = detailMapper.selectByWorkOrderId(order.getId());
            for (WorkOrderDetail detail : details) {
                if (detail.getUsedQuantity() != null) {
                    teamData.put("totalUsedAmount",
                            ((BigDecimal) teamData.get("totalUsedAmount")).add(
                                    detail.getUsedQuantity().multiply(detail.getUnitPrice())));
                }
                if (detail.getLostQuantity() != null) {
                    teamData.put("totalLostAmount",
                            ((BigDecimal) teamData.get("totalLostAmount")).add(
                                    detail.getLostQuantity().multiply(detail.getUnitPrice())));
                }
            }
        }

        List<Map<String, Object>> result = new ArrayList<>(teamMap.values());
        result.sort((a, b) -> ((BigDecimal) b.get("totalUsedAmount")).compareTo((BigDecimal) a.get("totalUsedAmount")));

        return result;
    }

    public List<Map<String, Object>> getStatusTrend(LocalDateTime startDate, LocalDateTime endDate) {
        LambdaQueryWrapper<MaterialWorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.ge(MaterialWorkOrder::getCreateTime, startDate);
        wrapper.le(MaterialWorkOrder::getCreateTime, endDate);
        wrapper.eq(MaterialWorkOrder::getDeleted, 0);
        wrapper.orderByAsc(MaterialWorkOrder::getCreateTime);

        List<MaterialWorkOrder> workOrders = workOrderMapper.selectList(wrapper);

        Map<String, Map<String, Object>> dateMap = new LinkedHashMap<>();

        for (MaterialWorkOrder order : workOrders) {
            String dateKey = order.getCreateTime().toLocalDate().toString();
            Map<String, Object> dateData = dateMap.computeIfAbsent(dateKey, k -> {
                Map<String, Object> map = new HashMap<>();
                map.put("date", dateKey);
                map.put("createCount", 0);
                map.put("verifyCount", 0);
                map.put("totalAmount", BigDecimal.ZERO);
                return map;
            });

            dateData.put("createCount", (Integer) dateData.get("createCount") + 1);
            dateData.put("totalAmount",
                    ((BigDecimal) dateData.get("totalAmount")).add(order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO));

            if (order.getStatus() == 4 && order.getReturnDate() != null) {
                String verifyDateKey = order.getReturnDate().toLocalDate().toString();
                Map<String, Object> verifyDateData = dateMap.computeIfAbsent(verifyDateKey, k -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("date", verifyDateKey);
                    map.put("createCount", 0);
                    map.put("verifyCount", 0);
                    map.put("totalAmount", BigDecimal.ZERO);
                    return map;
                });
                verifyDateData.put("verifyCount", (Integer) verifyDateData.get("verifyCount") + 1);
            }
        }

        return new ArrayList<>(dateMap.values());
    }

    private String generateOrderNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "WO-" + dateStr + "-" + uuid;
    }

    private String getOrderTypeName(Integer orderType) {
        return switch (orderType) {
            case 1 -> "采购入库";
            case 2 -> "班组领用";
            case 3 -> "余料退回";
            case 4 -> "损耗登记";
            default -> "未知类型";
        };
    }
}
