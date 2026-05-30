package com.construction.material.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.construction.material.common.PageQuery;
import com.construction.material.common.PageResult;
import com.construction.material.dto.CostReconciliationDTO;
import com.construction.material.dto.CostStatisticsQueryDTO;
import com.construction.material.entity.CostStatistics;
import com.construction.material.entity.MaterialWorkOrder;
import com.construction.material.entity.WorkOrderDetail;
import com.construction.material.exception.BusinessException;
import com.construction.material.mapper.CostStatisticsMapper;
import com.construction.material.mapper.MaterialWorkOrderMapper;
import com.construction.material.mapper.WorkOrderDetailMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CostStatisticsService {

    private final CostStatisticsMapper costStatisticsMapper;
    private final MaterialWorkOrderMapper workOrderMapper;
    private final WorkOrderDetailMapper detailMapper;

    @Transactional(rollbackFor = Exception.class)
    public CostStatistics generateStatistics(String projectName, Integer statisticsType, LocalDateTime startDate, LocalDateTime endDate) {
        LambdaQueryWrapper<MaterialWorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialWorkOrder::getStatus, 4);
        if (StringUtils.hasText(projectName)) {
            wrapper.like(MaterialWorkOrder::getProjectName, projectName);
        }
        if (startDate != null) {
            wrapper.ge(MaterialWorkOrder::getCreateTime, startDate);
        }
        if (endDate != null) {
            wrapper.le(MaterialWorkOrder::getCreateTime, endDate);
        }
        wrapper.eq(MaterialWorkOrder::getDeleted, 0);

        List<MaterialWorkOrder> workOrders = workOrderMapper.selectList(wrapper);

        BigDecimal mainMaterialCost = BigDecimal.ZERO;
        BigDecimal auxiliaryMaterialCost = BigDecimal.ZERO;
        BigDecimal wasteCost = BigDecimal.ZERO;
        BigDecimal totalUsedQuantity = BigDecimal.ZERO;
        BigDecimal totalLostQuantity = BigDecimal.ZERO;

        Set<Long> mainCategoryIds = new HashSet<>(Arrays.asList(1L, 2L, 5L, 6L, 7L, 8L, 9L, 10L));
        Set<Long> auxiliaryCategoryIds = new HashSet<>(Arrays.asList(3L, 4L, 11L, 12L, 13L, 14L, 15L, 16L));

        for (MaterialWorkOrder workOrder : workOrders) {
            List<WorkOrderDetail> details = detailMapper.selectByWorkOrderId(workOrder.getId());
            for (WorkOrderDetail detail : details) {
                BigDecimal usedAmount = detail.getUsedQuantity() != null ?
                        detail.getUsedQuantity().multiply(detail.getUnitPrice()) : BigDecimal.ZERO;
                BigDecimal lostAmount = detail.getLostQuantity() != null ?
                        detail.getLostQuantity().multiply(detail.getUnitPrice()) : BigDecimal.ZERO;

                if (mainCategoryIds.contains(detail.getCategoryId())) {
                    mainMaterialCost = mainMaterialCost.add(usedAmount);
                } else if (auxiliaryCategoryIds.contains(detail.getCategoryId())) {
                    auxiliaryMaterialCost = auxiliaryMaterialCost.add(usedAmount);
                }
                wasteCost = wasteCost.add(lostAmount);

                if (detail.getUsedQuantity() != null) {
                    totalUsedQuantity = totalUsedQuantity.add(detail.getUsedQuantity());
                }
                if (detail.getLostQuantity() != null) {
                    totalLostQuantity = totalLostQuantity.add(detail.getLostQuantity());
                }
            }
        }

        BigDecimal totalMaterialCost = mainMaterialCost.add(auxiliaryMaterialCost);
        BigDecimal transportationCost = mainMaterialCost.multiply(new BigDecimal("0.05"));
        BigDecimal laborCost = mainMaterialCost.multiply(new BigDecimal("0.03"));

        CostStatistics statistics = new CostStatistics();
        statistics.setStatisticsNo(generateStatisticsNo());
        statistics.setProjectName(projectName != null ? projectName : "全部项目");
        statistics.setStatisticsDate(LocalDateTime.now());
        statistics.setStatisticsType(statisticsType);
        statistics.setMainMaterialCost(mainMaterialCost);
        statistics.setAuxiliaryMaterialCost(auxiliaryMaterialCost);
        statistics.setTransportationCost(transportationCost);
        statistics.setLaborCost(laborCost);
        statistics.setWasteCost(wasteCost);
        statistics.setTotalCost(mainMaterialCost
                .add(auxiliaryMaterialCost)
                .add(transportationCost)
                .add(laborCost)
                .add(wasteCost));
        statistics.setRemark("统计工单数量: " + workOrders.size() +
                ", 使用总量: " + totalUsedQuantity +
                ", 损耗总量: " + totalLostQuantity);

        costStatisticsMapper.insert(statistics);
        return statistics;
    }

    public CostStatistics getStatistics(Long id) {
        return costStatisticsMapper.selectById(id);
    }

    public PageResult<CostStatistics> getStatisticsPage(PageQuery pageQuery, CostStatisticsQueryDTO queryDTO) {
        LambdaQueryWrapper<CostStatistics> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(queryDTO.getProjectName())) {
            wrapper.like(CostStatistics::getProjectName, queryDTO.getProjectName());
        }
        if (queryDTO.getStatisticsType() != null) {
            wrapper.eq(CostStatistics::getStatisticsType, queryDTO.getStatisticsType());
        }
        if (queryDTO.getStartDate() != null) {
            wrapper.ge(CostStatistics::getStatisticsDate, queryDTO.getStartDate());
        }
        if (queryDTO.getEndDate() != null) {
            wrapper.le(CostStatistics::getStatisticsDate, queryDTO.getEndDate());
        }
        wrapper.eq(CostStatistics::getDeleted, 0);
        wrapper.orderByDesc(CostStatistics::getCreateTime);

        Page<CostStatistics> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());
        IPage<CostStatistics> result = costStatisticsMapper.selectPage(page, wrapper);

        return new PageResult<>(result.getRecords(), result.getTotal(),
                (int) result.getCurrent(), (int) result.getSize());
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteStatistics(Long id) {
        CostStatistics statistics = costStatisticsMapper.selectById(id);
        if (statistics == null) {
            throw new BusinessException("统计记录不存在");
        }
        costStatisticsMapper.deleteById(id);
    }

    public Map<String, Object> getCostSummary(String projectName, LocalDateTime startDate, LocalDateTime endDate) {
        LambdaQueryWrapper<MaterialWorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialWorkOrder::getStatus, 4);
        if (StringUtils.hasText(projectName)) {
            wrapper.like(MaterialWorkOrder::getProjectName, projectName);
        }
        if (startDate != null) {
            wrapper.ge(MaterialWorkOrder::getCreateTime, startDate);
        }
        if (endDate != null) {
            wrapper.le(MaterialWorkOrder::getCreateTime, endDate);
        }
        wrapper.eq(MaterialWorkOrder::getDeleted, 0);

        List<MaterialWorkOrder> workOrders = workOrderMapper.selectList(wrapper);

        BigDecimal mainMaterialCost = BigDecimal.ZERO;
        BigDecimal auxiliaryMaterialCost = BigDecimal.ZERO;
        BigDecimal totalUsedAmount = BigDecimal.ZERO;
        BigDecimal totalLostAmount = BigDecimal.ZERO;
        int workOrderCount = workOrders.size();
        int materialCount = 0;

        for (MaterialWorkOrder workOrder : workOrders) {
            List<WorkOrderDetail> details = detailMapper.selectByWorkOrderId(workOrder.getId());
            materialCount += details.size();
            for (WorkOrderDetail detail : details) {
                BigDecimal usedAmount = detail.getUsedQuantity() != null ?
                        detail.getUsedQuantity().multiply(detail.getUnitPrice()) : BigDecimal.ZERO;
                BigDecimal lostAmount = detail.getLostQuantity() != null ?
                        detail.getLostQuantity().multiply(detail.getUnitPrice()) : BigDecimal.ZERO;

                if (detail.getCategoryId() != null && detail.getCategoryId() <= 10) {
                    mainMaterialCost = mainMaterialCost.add(usedAmount);
                } else {
                    auxiliaryMaterialCost = auxiliaryMaterialCost.add(usedAmount);
                }
                totalUsedAmount = totalUsedAmount.add(usedAmount);
                totalLostAmount = totalLostAmount.add(lostAmount);
            }
        }

        BigDecimal transportationCost = mainMaterialCost.multiply(new BigDecimal("0.05"));
        BigDecimal laborCost = mainMaterialCost.multiply(new BigDecimal("0.03"));
        BigDecimal totalCost = mainMaterialCost
                .add(auxiliaryMaterialCost)
                .add(transportationCost)
                .add(laborCost)
                .add(totalLostAmount);

        BigDecimal wasteRate = totalUsedAmount.compareTo(BigDecimal.ZERO) > 0 ?
                totalLostAmount.divide(totalUsedAmount, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")) :
                BigDecimal.ZERO;

        Map<String, Object> summary = new HashMap<>();
        summary.put("mainMaterialCost", mainMaterialCost);
        summary.put("auxiliaryMaterialCost", auxiliaryMaterialCost);
        summary.put("totalMaterialCost", mainMaterialCost.add(auxiliaryMaterialCost));
        summary.put("transportationCost", transportationCost);
        summary.put("laborCost", laborCost);
        summary.put("wasteCost", totalLostAmount);
        summary.put("totalCost", totalCost);
        summary.put("wasteRate", wasteRate);
        summary.put("workOrderCount", workOrderCount);
        summary.put("materialCount", materialCount);
        return summary;
    }

    public List<Map<String, Object>> getMaterialCostRanking(String projectName, LocalDateTime startDate, LocalDateTime endDate, int limit) {
        LambdaQueryWrapper<MaterialWorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialWorkOrder::getStatus, 4);
        if (StringUtils.hasText(projectName)) {
            wrapper.like(MaterialWorkOrder::getProjectName, projectName);
        }
        if (startDate != null) {
            wrapper.ge(MaterialWorkOrder::getCreateTime, startDate);
        }
        if (endDate != null) {
            wrapper.le(MaterialWorkOrder::getCreateTime, endDate);
        }
        wrapper.eq(MaterialWorkOrder::getDeleted, 0);

        List<MaterialWorkOrder> workOrders = workOrderMapper.selectList(wrapper);

        Map<String, BigDecimal> materialCostMap = new HashMap<>();
        Map<String, BigDecimal> materialQuantityMap = new HashMap<>();
        Map<String, BigDecimal> materialLostMap = new HashMap<>();
        Map<String, String> materialUnitMap = new HashMap<>();

        for (MaterialWorkOrder workOrder : workOrders) {
            List<WorkOrderDetail> details = detailMapper.selectByWorkOrderId(workOrder.getId());
            for (WorkOrderDetail detail : details) {
                String materialName = detail.getMaterialName();
                BigDecimal usedAmount = detail.getUsedQuantity() != null ?
                        detail.getUsedQuantity().multiply(detail.getUnitPrice()) : BigDecimal.ZERO;
                BigDecimal usedQuantity = detail.getUsedQuantity() != null ? detail.getUsedQuantity() : BigDecimal.ZERO;
                BigDecimal lostQuantity = detail.getLostQuantity() != null ? detail.getLostQuantity() : BigDecimal.ZERO;

                materialCostMap.put(materialName, materialCostMap.getOrDefault(materialName, BigDecimal.ZERO).add(usedAmount));
                materialQuantityMap.put(materialName, materialQuantityMap.getOrDefault(materialName, BigDecimal.ZERO).add(usedQuantity));
                materialLostMap.put(materialName, materialLostMap.getOrDefault(materialName, BigDecimal.ZERO).add(lostQuantity));
                materialUnitMap.put(materialName, detail.getUnit());
            }
        }

        List<Map.Entry<String, BigDecimal>> sortedEntries = new ArrayList<>(materialCostMap.entrySet());
        sortedEntries.sort((a, b) -> b.getValue().compareTo(a.getValue()));

        List<Map<String, Object>> ranking = new ArrayList<>();
        for (int i = 0; i < Math.min(limit, sortedEntries.size()); i++) {
            Map.Entry<String, BigDecimal> entry = sortedEntries.get(i);
            String materialName = entry.getKey();
            BigDecimal totalCost = entry.getValue();
            BigDecimal totalQuantity = materialQuantityMap.get(materialName);
            BigDecimal totalLost = materialLostMap.get(materialName);
            BigDecimal unit = totalQuantity.compareTo(BigDecimal.ZERO) > 0 ?
                    totalCost.divide(totalQuantity, 4, RoundingMode.HALF_UP) : BigDecimal.ZERO;
            BigDecimal lostRate = totalQuantity.add(totalLost).compareTo(BigDecimal.ZERO) > 0 ?
                    totalLost.divide(totalQuantity.add(totalLost), 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")) :
                    BigDecimal.ZERO;

            Map<String, Object> item = new HashMap<>();
            item.put("materialName", materialName);
            item.put("totalCost", totalCost);
            item.put("totalQuantity", totalQuantity);
            item.put("totalLost", totalLost);
            item.put("unit", materialUnitMap.get(materialName));
            item.put("avgUnitPrice", unit);
            item.put("lostRate", lostRate);
            item.put("rank", i + 1);
            ranking.add(item);
        }
        return ranking;
    }

    public List<Map<String, Object>> getCategoryCostAnalysis(String projectName, LocalDateTime startDate, LocalDateTime endDate) {
        LambdaQueryWrapper<MaterialWorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialWorkOrder::getStatus, 4);
        if (StringUtils.hasText(projectName)) {
            wrapper.like(MaterialWorkOrder::getProjectName, projectName);
        }
        if (startDate != null) {
            wrapper.ge(MaterialWorkOrder::getCreateTime, startDate);
        }
        if (endDate != null) {
            wrapper.le(MaterialWorkOrder::getCreateTime, endDate);
        }
        wrapper.eq(MaterialWorkOrder::getDeleted, 0);

        List<MaterialWorkOrder> workOrders = workOrderMapper.selectList(wrapper);

        Map<Long, Map<String, Object>> categoryMap = new HashMap<>();

        for (MaterialWorkOrder workOrder : workOrders) {
            List<WorkOrderDetail> details = detailMapper.selectByWorkOrderId(workOrder.getId());
            for (WorkOrderDetail detail : details) {
                Long categoryId = detail.getCategoryId();
                if (categoryId == null) continue;

                Map<String, Object> categoryData = categoryMap.computeIfAbsent(categoryId, k -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("categoryId", detail.getCategoryId());
                    map.put("categoryName", detail.getCategoryName());
                    map.put("totalCost", BigDecimal.ZERO);
                    map.put("totalQuantity", BigDecimal.ZERO);
                    map.put("totalLost", BigDecimal.ZERO);
                    map.put("materialCount", 0);
                    return map;
                });

                BigDecimal usedAmount = detail.getUsedQuantity() != null ?
                        detail.getUsedQuantity().multiply(detail.getUnitPrice()) : BigDecimal.ZERO;
                BigDecimal usedQuantity = detail.getUsedQuantity() != null ? detail.getUsedQuantity() : BigDecimal.ZERO;
                BigDecimal lostQuantity = detail.getLostQuantity() != null ? detail.getLostQuantity() : BigDecimal.ZERO;

                categoryData.put("totalCost",
                        ((BigDecimal) categoryData.get("totalCost")).add(usedAmount));
                categoryData.put("totalQuantity",
                        ((BigDecimal) categoryData.get("totalQuantity")).add(usedQuantity));
                categoryData.put("totalLost",
                        ((BigDecimal) categoryData.get("totalLost")).add(lostQuantity));
                categoryData.put("materialCount", (Integer) categoryData.get("materialCount") + 1);
            }
        }

        List<Map<String, Object>> result = new ArrayList<>(categoryMap.values());
        result.sort((a, b) -> ((BigDecimal) b.get("totalCost")).compareTo((BigDecimal) a.get("totalCost")));

        BigDecimal totalAllCost = result.stream()
                .map(r -> (BigDecimal) r.get("totalCost"))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        for (Map<String, Object> item : result) {
            BigDecimal cost = (BigDecimal) item.get("totalCost");
            BigDecimal percentage = totalAllCost.compareTo(BigDecimal.ZERO) > 0 ?
                    cost.divide(totalAllCost, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")) :
                    BigDecimal.ZERO;
            item.put("percentage", percentage);
        }

        return result;
    }

    public Map<String, Object> getCostTrend(LocalDateTime startDate, LocalDateTime endDate) {
        LambdaQueryWrapper<MaterialWorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialWorkOrder::getStatus, 4);
        wrapper.ge(MaterialWorkOrder::getCreateTime, startDate);
        wrapper.le(MaterialWorkOrder::getCreateTime, endDate);
        wrapper.eq(MaterialWorkOrder::getDeleted, 0);
        wrapper.orderByAsc(MaterialWorkOrder::getCreateTime);

        List<MaterialWorkOrder> workOrders = workOrderMapper.selectList(wrapper);

        Map<String, BigDecimal> dailyCostMap = new LinkedHashMap<>();
        Map<String, Integer> dailyCountMap = new LinkedHashMap<>();

        for (MaterialWorkOrder order : workOrders) {
            String dateKey = order.getCreateTime().toLocalDate().toString();
            dailyCostMap.put(dateKey, dailyCostMap.getOrDefault(dateKey, BigDecimal.ZERO)
                    .add(order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO));
            dailyCountMap.put(dateKey, dailyCountMap.getOrDefault(dateKey, 0) + 1);
        }

        List<String> dates = new ArrayList<>(dailyCostMap.keySet());
        List<BigDecimal> amounts = new ArrayList<>(dailyCostMap.values());
        List<Integer> counts = new ArrayList<>(dailyCountMap.values());

        Map<String, Object> result = new HashMap<>();
        result.put("dates", dates);
        result.put("amounts", amounts);
        result.put("counts", counts);
        result.put("totalCost", amounts.stream().reduce(BigDecimal.ZERO, BigDecimal::add));
        result.put("totalCount", counts.stream().mapToInt(Integer::intValue).sum());

        return result;
    }

    public Map<String, Object> getReconciliation(CostReconciliationDTO dto) {
        LambdaQueryWrapper<MaterialWorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialWorkOrder::getStatus, 4);
        if (StringUtils.hasText(dto.getProjectName())) {
            wrapper.like(MaterialWorkOrder::getProjectName, dto.getProjectName());
        }
        if (dto.getStartDate() != null) {
            wrapper.ge(MaterialWorkOrder::getCreateTime, dto.getStartDate());
        }
        if (dto.getEndDate() != null) {
            wrapper.le(MaterialWorkOrder::getCreateTime, dto.getEndDate());
        }
        wrapper.eq(MaterialWorkOrder::getDeleted, 0);

        List<MaterialWorkOrder> workOrders = workOrderMapper.selectList(wrapper);

        BigDecimal systemTotalAmount = BigDecimal.ZERO;
        Map<String, Object> systemDetails = new HashMap<>();
        BigDecimal mainMaterialCost = BigDecimal.ZERO;
        BigDecimal auxiliaryMaterialCost = BigDecimal.ZERO;
        BigDecimal wasteCost = BigDecimal.ZERO;

        for (MaterialWorkOrder workOrder : workOrders) {
            systemTotalAmount = systemTotalAmount.add(workOrder.getTotalAmount() != null ? workOrder.getTotalAmount() : BigDecimal.ZERO);

            List<WorkOrderDetail> details = detailMapper.selectByWorkOrderId(workOrder.getId());
            for (WorkOrderDetail detail : details) {
                BigDecimal usedAmount = detail.getUsedQuantity() != null ?
                        detail.getUsedQuantity().multiply(detail.getUnitPrice()) : BigDecimal.ZERO;
                BigDecimal lostAmount = detail.getLostQuantity() != null ?
                        detail.getLostQuantity().multiply(detail.getUnitPrice()) : BigDecimal.ZERO;

                if (detail.getCategoryId() != null && detail.getCategoryId() <= 10) {
                    mainMaterialCost = mainMaterialCost.add(usedAmount);
                } else {
                    auxiliaryMaterialCost = auxiliaryMaterialCost.add(usedAmount);
                }
                wasteCost = wasteCost.add(lostAmount);
            }
        }

        BigDecimal transportationCost = mainMaterialCost.multiply(new BigDecimal("0.05"));
        BigDecimal laborCost = mainMaterialCost.multiply(new BigDecimal("0.03"));

        systemDetails.put("mainMaterialCost", mainMaterialCost);
        systemDetails.put("auxiliaryMaterialCost", auxiliaryMaterialCost);
        systemDetails.put("transportationCost", transportationCost);
        systemDetails.put("laborCost", laborCost);
        systemDetails.put("wasteCost", wasteCost);
        systemDetails.put("workOrderCount", workOrders.size());

        BigDecimal difference = dto.getActualTotalAmount() != null ?
                dto.getActualTotalAmount().subtract(systemTotalAmount) : BigDecimal.ZERO;

        Map<String, Object> result = new HashMap<>();
        result.put("projectName", dto.getProjectName());
        result.put("startDate", dto.getStartDate());
        result.put("endDate", dto.getEndDate());
        result.put("systemTotalAmount", systemTotalAmount);
        result.put("systemDetails", systemDetails);
        result.put("actualTotalAmount", dto.getActualTotalAmount());
        result.put("difference", difference);
        result.put("differenceType", difference.compareTo(BigDecimal.ZERO) > 0 ? "盘盈" :
                difference.compareTo(BigDecimal.ZERO) < 0 ? "盘亏" : "一致");
        result.put("remark", dto.getRemark());

        return result;
    }

    public List<Map<String, Object>> getWorkOrderCostDetails(String projectName, LocalDateTime startDate, LocalDateTime endDate) {
        LambdaQueryWrapper<MaterialWorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialWorkOrder::getStatus, 4);
        if (StringUtils.hasText(projectName)) {
            wrapper.like(MaterialWorkOrder::getProjectName, projectName);
        }
        if (startDate != null) {
            wrapper.ge(MaterialWorkOrder::getCreateTime, startDate);
        }
        if (endDate != null) {
            wrapper.le(MaterialWorkOrder::getCreateTime, endDate);
        }
        wrapper.eq(MaterialWorkOrder::getDeleted, 0);
        wrapper.orderByDesc(MaterialWorkOrder::getCreateTime);

        List<MaterialWorkOrder> workOrders = workOrderMapper.selectList(wrapper);

        List<Map<String, Object>> result = new ArrayList<>();
        for (MaterialWorkOrder order : workOrders) {
            List<WorkOrderDetail> details = detailMapper.selectByWorkOrderId(order.getId());
            BigDecimal totalUsedAmount = BigDecimal.ZERO;
            BigDecimal totalLostAmount = BigDecimal.ZERO;
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

            Map<String, Object> item = new HashMap<>();
            item.put("orderNo", order.getOrderNo());
            item.put("projectName", order.getProjectName());
            item.put("constructionTeam", order.getConstructionTeam());
            item.put("createTime", order.getCreateTime());
            item.put("verifyTime", order.getReturnDate());
            item.put("totalQuantity", order.getTotalQuantity());
            item.put("usedQuantity", order.getUsedQuantity());
            item.put("returnedQuantity", order.getReturnedQuantity());
            item.put("lostQuantity", order.getLostQuantity());
            item.put("totalAmount", order.getTotalAmount());
            item.put("usedAmount", totalUsedAmount);
            item.put("lostAmount", totalLostAmount);
            result.add(item);
        }

        return result;
    }

    public Map<String, Object> getWasteStatistics(String projectName, LocalDateTime startDate, LocalDateTime endDate) {
        LambdaQueryWrapper<MaterialWorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialWorkOrder::getStatus, 4);
        if (StringUtils.hasText(projectName)) {
            wrapper.like(MaterialWorkOrder::getProjectName, projectName);
        }
        if (startDate != null) {
            wrapper.ge(MaterialWorkOrder::getCreateTime, startDate);
        }
        if (endDate != null) {
            wrapper.le(MaterialWorkOrder::getCreateTime, endDate);
        }
        wrapper.eq(MaterialWorkOrder::getDeleted, 0);

        List<MaterialWorkOrder> workOrders = workOrderMapper.selectList(wrapper);

        BigDecimal totalWasteAmount = BigDecimal.ZERO;
        BigDecimal totalWasteQuantity = BigDecimal.ZERO;
        BigDecimal totalUsedAmount = BigDecimal.ZERO;
        BigDecimal totalUsedQuantity = BigDecimal.ZERO;
        int wasteOrderCount = 0;

        Map<String, Map<String, Object>> materialWasteMap = new HashMap<>();
        Map<String, Map<String, Object>> projectWasteMap = new HashMap<>();
        Map<String, Map<String, Object>> teamWasteMap = new HashMap<>();
        Map<String, Map<String, Object>> categoryWasteMap = new HashMap<>();

        for (MaterialWorkOrder workOrder : workOrders) {
            List<WorkOrderDetail> details = detailMapper.selectByWorkOrderId(workOrder.getId());
            boolean hasWaste = false;

            for (WorkOrderDetail detail : details) {
                BigDecimal usedQuantity = detail.getUsedQuantity() != null ? detail.getUsedQuantity() : BigDecimal.ZERO;
                BigDecimal lostQuantity = detail.getLostQuantity() != null ? detail.getLostQuantity() : BigDecimal.ZERO;
                BigDecimal usedAmount = usedQuantity.multiply(detail.getUnitPrice());
                BigDecimal lostAmount = lostQuantity.multiply(detail.getUnitPrice());

                totalUsedAmount = totalUsedAmount.add(usedAmount);
                totalUsedQuantity = totalUsedQuantity.add(usedQuantity);
                totalWasteAmount = totalWasteAmount.add(lostAmount);
                totalWasteQuantity = totalWasteQuantity.add(lostQuantity);

                if (lostQuantity.compareTo(BigDecimal.ZERO) > 0) {
                    hasWaste = true;

                    String materialKey = detail.getMaterialName() + "|" + detail.getSpecification();
                    Map<String, Object> materialData = materialWasteMap.computeIfAbsent(materialKey, k -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("materialName", detail.getMaterialName());
                        map.put("specification", detail.getSpecification());
                        map.put("unit", detail.getUnit());
                        map.put("totalWasteQuantity", BigDecimal.ZERO);
                        map.put("totalWasteAmount", BigDecimal.ZERO);
                        map.put("totalUsedQuantity", BigDecimal.ZERO);
                        map.put("totalUsedAmount", BigDecimal.ZERO);
                        return map;
                    });
                    materialData.put("totalWasteQuantity",
                            ((BigDecimal) materialData.get("totalWasteQuantity")).add(lostQuantity));
                    materialData.put("totalWasteAmount",
                            ((BigDecimal) materialData.get("totalWasteAmount")).add(lostAmount));
                    materialData.put("totalUsedQuantity",
                            ((BigDecimal) materialData.get("totalUsedQuantity")).add(usedQuantity));
                    materialData.put("totalUsedAmount",
                            ((BigDecimal) materialData.get("totalUsedAmount")).add(usedAmount));

                    String projectKey = workOrder.getProjectName();
                    if (StringUtils.hasText(projectKey)) {
                        Map<String, Object> projectData = projectWasteMap.computeIfAbsent(projectKey, k -> {
                            Map<String, Object> map = new HashMap<>();
                            map.put("projectName", k);
                            map.put("totalWasteQuantity", BigDecimal.ZERO);
                            map.put("totalWasteAmount", BigDecimal.ZERO);
                            map.put("totalUsedQuantity", BigDecimal.ZERO);
                            map.put("totalUsedAmount", BigDecimal.ZERO);
                            map.put("orderCount", 0);
                            return map;
                        });
                        projectData.put("totalWasteQuantity",
                                ((BigDecimal) projectData.get("totalWasteQuantity")).add(lostQuantity));
                        projectData.put("totalWasteAmount",
                                ((BigDecimal) projectData.get("totalWasteAmount")).add(lostAmount));
                        projectData.put("totalUsedQuantity",
                                ((BigDecimal) projectData.get("totalUsedQuantity")).add(usedQuantity));
                        projectData.put("totalUsedAmount",
                                ((BigDecimal) projectData.get("totalUsedAmount")).add(usedAmount));
                    }

                    String teamKey = workOrder.getConstructionTeam();
                    if (StringUtils.hasText(teamKey)) {
                        Map<String, Object> teamData = teamWasteMap.computeIfAbsent(teamKey, k -> {
                            Map<String, Object> map = new HashMap<>();
                            map.put("constructionTeam", k);
                            map.put("totalWasteQuantity", BigDecimal.ZERO);
                            map.put("totalWasteAmount", BigDecimal.ZERO);
                            map.put("totalUsedQuantity", BigDecimal.ZERO);
                            map.put("totalUsedAmount", BigDecimal.ZERO);
                            map.put("orderCount", 0);
                            return map;
                        });
                        teamData.put("totalWasteQuantity",
                                ((BigDecimal) teamData.get("totalWasteQuantity")).add(lostQuantity));
                        teamData.put("totalWasteAmount",
                                ((BigDecimal) teamData.get("totalWasteAmount")).add(lostAmount));
                        teamData.put("totalUsedQuantity",
                                ((BigDecimal) teamData.get("totalUsedQuantity")).add(usedQuantity));
                        teamData.put("totalUsedAmount",
                                ((BigDecimal) teamData.get("totalUsedAmount")).add(usedAmount));
                    }

                    Long categoryId = detail.getCategoryId();
                    if (categoryId != null) {
                        String categoryKey = categoryId.toString();
                        Map<String, Object> categoryData = categoryWasteMap.computeIfAbsent(categoryKey, k -> {
                            Map<String, Object> map = new HashMap<>();
                            map.put("categoryId", detail.getCategoryId());
                            map.put("categoryName", detail.getCategoryName());
                            map.put("totalWasteQuantity", BigDecimal.ZERO);
                            map.put("totalWasteAmount", BigDecimal.ZERO);
                            map.put("totalUsedQuantity", BigDecimal.ZERO);
                            map.put("totalUsedAmount", BigDecimal.ZERO);
                            return map;
                        });
                        categoryData.put("totalWasteQuantity",
                                ((BigDecimal) categoryData.get("totalWasteQuantity")).add(lostQuantity));
                        categoryData.put("totalWasteAmount",
                                ((BigDecimal) categoryData.get("totalWasteAmount")).add(lostAmount));
                        categoryData.put("totalUsedQuantity",
                                ((BigDecimal) categoryData.get("totalUsedQuantity")).add(usedQuantity));
                        categoryData.put("totalUsedAmount",
                                ((BigDecimal) categoryData.get("totalUsedAmount")).add(usedAmount));
                    }
                }
            }

            if (hasWaste) {
                wasteOrderCount++;
                if (workOrder.getProjectName() != null && projectWasteMap.containsKey(workOrder.getProjectName())) {
                    Map<String, Object> projectData = projectWasteMap.get(workOrder.getProjectName());
                    projectData.put("orderCount", (Integer) projectData.get("orderCount") + 1);
                }
                if (workOrder.getConstructionTeam() != null && teamWasteMap.containsKey(workOrder.getConstructionTeam())) {
                    Map<String, Object> teamData = teamWasteMap.get(workOrder.getConstructionTeam());
                    teamData.put("orderCount", (Integer) teamData.get("orderCount") + 1);
                }
            }
        }

        BigDecimal overallWasteRate = totalUsedQuantity.compareTo(BigDecimal.ZERO) > 0 ?
                totalWasteQuantity.divide(totalUsedQuantity, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")) :
                BigDecimal.ZERO;

        List<Map<String, Object>> materialWasteList = new ArrayList<>(materialWasteMap.values());
        materialWasteList.sort((a, b) -> ((BigDecimal) b.get("totalWasteAmount")).compareTo((BigDecimal) a.get("totalWasteAmount")));

        List<Map<String, Object>> projectWasteList = new ArrayList<>(projectWasteMap.values());
        projectWasteList.sort((a, b) -> ((BigDecimal) b.get("totalWasteAmount")).compareTo((BigDecimal) a.get("totalWasteAmount")));

        List<Map<String, Object>> teamWasteList = new ArrayList<>(teamWasteMap.values());
        teamWasteList.sort((a, b) -> ((BigDecimal) b.get("totalWasteAmount")).compareTo((BigDecimal) a.get("totalWasteAmount")));

        List<Map<String, Object>> categoryWasteList = new ArrayList<>(categoryWasteMap.values());
        categoryWasteList.sort((a, b) -> ((BigDecimal) b.get("totalWasteAmount")).compareTo((BigDecimal) a.get("totalWasteAmount")));

        for (Map<String, Object> item : materialWasteList) {
            BigDecimal usedQty = (BigDecimal) item.get("totalUsedQuantity");
            BigDecimal wasteQty = (BigDecimal) item.get("totalWasteQuantity");
            BigDecimal rate = usedQty.compareTo(BigDecimal.ZERO) > 0 ?
                    wasteQty.divide(usedQty, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")) : BigDecimal.ZERO;
            item.put("wasteRate", rate);
        }

        for (Map<String, Object> item : projectWasteList) {
            BigDecimal usedQty = (BigDecimal) item.get("totalUsedQuantity");
            BigDecimal wasteQty = (BigDecimal) item.get("totalWasteQuantity");
            BigDecimal rate = usedQty.compareTo(BigDecimal.ZERO) > 0 ?
                    wasteQty.divide(usedQty, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")) : BigDecimal.ZERO;
            item.put("wasteRate", rate);
        }

        for (Map<String, Object> item : teamWasteList) {
            BigDecimal usedQty = (BigDecimal) item.get("totalUsedQuantity");
            BigDecimal wasteQty = (BigDecimal) item.get("totalWasteQuantity");
            BigDecimal rate = usedQty.compareTo(BigDecimal.ZERO) > 0 ?
                    wasteQty.divide(usedQty, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")) : BigDecimal.ZERO;
            item.put("wasteRate", rate);
        }

        for (Map<String, Object> item : categoryWasteList) {
            BigDecimal usedQty = (BigDecimal) item.get("totalUsedQuantity");
            BigDecimal wasteQty = (BigDecimal) item.get("totalWasteQuantity");
            BigDecimal rate = usedQty.compareTo(BigDecimal.ZERO) > 0 ?
                    wasteQty.divide(usedQty, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")) : BigDecimal.ZERO;
            item.put("wasteRate", rate);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("totalWasteAmount", totalWasteAmount);
        result.put("totalWasteQuantity", totalWasteQuantity);
        result.put("totalUsedAmount", totalUsedAmount);
        result.put("totalUsedQuantity", totalUsedQuantity);
        result.put("overallWasteRate", overallWasteRate);
        result.put("wasteOrderCount", wasteOrderCount);
        result.put("totalOrderCount", workOrders.size());
        result.put("materialWasteRanking", materialWasteList);
        result.put("projectWasteRanking", projectWasteList);
        result.put("teamWasteRanking", teamWasteList);
        result.put("categoryWasteRanking", categoryWasteList);

        return result;
    }

    public List<Map<String, Object>> getWasteDetails(String projectName, LocalDateTime startDate, LocalDateTime endDate) {
        LambdaQueryWrapper<MaterialWorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialWorkOrder::getStatus, 4);
        if (StringUtils.hasText(projectName)) {
            wrapper.like(MaterialWorkOrder::getProjectName, projectName);
        }
        if (startDate != null) {
            wrapper.ge(MaterialWorkOrder::getCreateTime, startDate);
        }
        if (endDate != null) {
            wrapper.le(MaterialWorkOrder::getCreateTime, endDate);
        }
        wrapper.eq(MaterialWorkOrder::getDeleted, 0);
        wrapper.orderByDesc(MaterialWorkOrder::getCreateTime);

        List<MaterialWorkOrder> workOrders = workOrderMapper.selectList(wrapper);
        List<Map<String, Object>> result = new ArrayList<>();

        for (MaterialWorkOrder workOrder : workOrders) {
            List<WorkOrderDetail> details = detailMapper.selectByWorkOrderId(workOrder.getId());
            for (WorkOrderDetail detail : details) {
                BigDecimal lostQuantity = detail.getLostQuantity() != null ? detail.getLostQuantity() : BigDecimal.ZERO;
                if (lostQuantity.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal lostAmount = lostQuantity.multiply(detail.getUnitPrice());
                    BigDecimal usedQuantity = detail.getUsedQuantity() != null ? detail.getUsedQuantity() : BigDecimal.ZERO;
                    BigDecimal totalQuantity = usedQuantity.add(lostQuantity);
                    BigDecimal wasteRate = totalQuantity.compareTo(BigDecimal.ZERO) > 0 ?
                            lostQuantity.divide(totalQuantity, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")) : BigDecimal.ZERO;

                    Map<String, Object> item = new HashMap<>();
                    item.put("orderNo", workOrder.getOrderNo());
                    item.put("projectName", workOrder.getProjectName());
                    item.put("constructionTeam", workOrder.getConstructionTeam());
                    item.put("categoryName", detail.getCategoryName());
                    item.put("materialName", detail.getMaterialName());
                    item.put("specification", detail.getSpecification());
                    item.put("unit", detail.getUnit());
                    item.put("usedQuantity", usedQuantity);
                    item.put("lostQuantity", lostQuantity);
                    item.put("totalQuantity", totalQuantity);
                    item.put("unitPrice", detail.getUnitPrice());
                    item.put("lostAmount", lostAmount);
                    item.put("wasteRate", wasteRate);
                    item.put("verifyTime", workOrder.getReturnDate());
                    item.put("remark", detail.getRemark());
                    result.add(item);
                }
            }
        }

        return result;
    }

    private String generateStatisticsNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "STAT-" + dateStr + "-" + uuid;
    }
}
