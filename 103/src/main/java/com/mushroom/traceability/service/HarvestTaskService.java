package com.mushroom.traceability.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mushroom.traceability.common.Constants;
import com.mushroom.traceability.dto.HarvestTaskCreateDTO;
import com.mushroom.traceability.dto.HarvestTaskQueryDTO;
import com.mushroom.traceability.dto.HarvestItemDTO;
import com.mushroom.traceability.dto.TaskAssignDTO;
import com.mushroom.traceability.dto.WarehouseInDTO;
import com.mushroom.traceability.entity.HarvestDetail;
import com.mushroom.traceability.entity.HarvestTask;
import com.mushroom.traceability.entity.MushroomCategory;
import com.mushroom.traceability.entity.ProductionArea;
import com.mushroom.traceability.exception.BusinessException;
import com.mushroom.traceability.mapper.HarvestTaskMapper;
import com.mushroom.traceability.util.UserContext;
import com.mushroom.traceability.vo.HarvestCostVO;
import com.mushroom.traceability.vo.PageResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class HarvestTaskService extends ServiceImpl<HarvestTaskMapper, HarvestTask> {

    private final OperationLogService operationLogService;
    private final ProductionAreaService productionAreaService;
    private final HarvestDetailService harvestDetailService;
    private final MushroomCategoryService categoryService;
    private final AreaQuotaService areaQuotaService;
    private final ObjectMapper objectMapper;

    public PageResult<HarvestTask> queryPage(HarvestTaskQueryDTO query) {
        LambdaQueryWrapper<HarvestTask> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(query.getTaskName())) {
            wrapper.like(HarvestTask::getTaskName, query.getTaskName());
        }
        if (query.getAreaId() != null) {
            wrapper.eq(HarvestTask::getAreaId, query.getAreaId());
        }
        if (query.getHarvesterId() != null) {
            wrapper.eq(HarvestTask::getHarvesterId, query.getHarvesterId());
        }
        if (StringUtils.hasText(query.getTaskStatus())) {
            wrapper.eq(HarvestTask::getTaskStatus, query.getTaskStatus());
        }
        if (query.getExpireTimeStart() != null) {
            wrapper.ge(HarvestTask::getExpireTime, query.getExpireTimeStart());
        }
        if (query.getExpireTimeEnd() != null) {
            wrapper.le(HarvestTask::getExpireTime, query.getExpireTimeEnd());
        }
        if (query.getCreateTimeStart() != null) {
            wrapper.ge(HarvestTask::getCreateTime, query.getCreateTimeStart());
        }
        if (query.getCreateTimeEnd() != null) {
            wrapper.le(HarvestTask::getCreateTime, query.getCreateTimeEnd());
        }
        wrapper.orderByDesc(HarvestTask::getCreateTime);

        Page<HarvestTask> page = new Page<>(query.getPageNum(), query.getPageSize());
        page = page(page, wrapper);
        return new PageResult<>(page.getRecords(), page.getTotal(), query.getPageNum(), query.getPageSize());
    }

    public List<HarvestTask> listByHarvester(Long harvesterId) {
        LambdaQueryWrapper<HarvestTask> wrapper = new LambdaQueryWrapper<>();
        if (harvesterId != null) {
            wrapper.eq(HarvestTask::getHarvesterId, harvesterId);
        }
        wrapper.orderByDesc(HarvestTask::getCreateTime);
        return list(wrapper);
    }

    public List<HarvestTask> listByStatus(String taskStatus) {
        LambdaQueryWrapper<HarvestTask> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(HarvestTask::getTaskStatus, taskStatus);
        wrapper.orderByDesc(HarvestTask::getCreateTime);
        return list(wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    public Long createTask(HarvestTaskCreateDTO dto) {
        ProductionArea area = productionAreaService.getById(dto.getAreaId());
        if (area == null) {
            throw new BusinessException("产区不存在");
        }
        if (Constants.AREA_STATUS_FORBIDDEN.equals(area.getStatus())) {
            throw new BusinessException("该产区已封禁，无法创建采收任务");
        }
        if (area.getIsRainySeason() == 1) {
            throw new BusinessException("该产区当前为雨季，无法创建采收任务");
        }

        if (dto.getCategoryIds() != null && !dto.getCategoryIds().isEmpty()) {
            for (Long categoryId : dto.getCategoryIds()) {
                MushroomCategory category = categoryService.getById(categoryId);
                if (category == null) {
                    throw new BusinessException("品类ID: " + categoryId + " 不存在");
                }
                if (category.getIsForbidden() == 1) {
                    throw new BusinessException("品类 [" + category.getCategoryName() + "] 已被禁采，无法创建采收任务");
                }
                if (category.getStatus() == 0) {
                    throw new BusinessException("品类 [" + category.getCategoryName() + "] 已下架，无法创建采收任务");
                }
            }
        }

        HarvestTask task = new HarvestTask();
        task.setAreaId(dto.getAreaId());
        task.setAreaName(area.getAreaName());
        task.setTaskName(dto.getTaskName());
        task.setTaskDescription(dto.getTaskDescription());
        task.setExpectedQuantity(dto.getExpectedQuantity());
        task.setExpireTime(dto.getExpireTime());
        task.setTaskCode("HT" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        task.setTaskStatus(Constants.TASK_STATUS_PENDING);
        task.setActualQuantity(BigDecimal.ZERO);
        task.setCreateBy(UserContext.getUserId());

        if (dto.getCategoryIds() != null) {
            try {
                task.setCategoryIds(objectMapper.writeValueAsString(dto.getCategoryIds()));
            } catch (Exception e) {
                throw new BusinessException("品类ID序列化失败");
            }
        }

        save(task);
        operationLogService.saveLog(Constants.BIZ_TYPE_TASK, task.getId(),
                Constants.OP_TYPE_CREATE, "创建采收任务: " + task.getTaskName());
        return task.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean assignTask(TaskAssignDTO dto) {
        HarvestTask task = getById(dto.getTaskId());
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        if (!Constants.TASK_STATUS_PENDING.equals(task.getTaskStatus())) {
            throw new BusinessException("当前任务状态不支持派发");
        }

        ProductionArea area = productionAreaService.getById(task.getAreaId());
        areaQuotaService.lockQuota(task.getAreaId(), area.getAreaCode(), dto.getQuota());

        task.setHarvesterId(dto.getHarvesterId());
        task.setHarvesterName(dto.getHarvesterName());
        task.setExpectedQuantity(dto.getQuota());
        task.setTaskStatus(Constants.TASK_STATUS_ASSIGNED);
        boolean result = updateById(task);
        if (result) {
            operationLogService.saveLog(Constants.BIZ_TYPE_TASK, dto.getTaskId(),
                    Constants.OP_TYPE_STATUS_CHANGE, "派发采收任务给: " + dto.getHarvesterName() + ", 锁定额度: " + dto.getQuota() + "kg");
        }
        return result;
    }

    public boolean startCollecting(Long taskId) {
        HarvestTask task = getById(taskId);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        if (!Constants.TASK_STATUS_ASSIGNED.equals(task.getTaskStatus())) {
            throw new BusinessException("当前任务状态不支持开始采收");
        }

        task.setTaskStatus(Constants.TASK_STATUS_COLLECTING);
        boolean result = updateById(task);
        if (result) {
            operationLogService.saveLog(Constants.BIZ_TYPE_TASK, taskId,
                    Constants.OP_TYPE_STATUS_CHANGE, "开始采收作业");
        }
        return result;
    }

    public boolean submitQualityCheck(Long taskId) {
        HarvestTask task = getById(taskId);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        if (!Constants.TASK_STATUS_COLLECTING.equals(task.getTaskStatus())) {
            throw new BusinessException("当前任务状态不支持提交质检");
        }

        task.setTaskStatus(Constants.TASK_STATUS_QUALITY_CHECK);
        boolean result = updateById(task);
        if (result) {
            operationLogService.saveLog(Constants.BIZ_TYPE_TASK, taskId,
                    Constants.OP_TYPE_STATUS_CHANGE, "提交品质质检");
        }
        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    public HarvestCostVO warehouseIn(WarehouseInDTO dto) {
        HarvestTask task = getById(dto.getTaskId());
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        if (!Constants.TASK_STATUS_QUALITY_CHECK.equals(task.getTaskStatus())) {
            throw new BusinessException("当前任务状态不支持入库");
        }

        ProductionArea area = productionAreaService.getById(task.getAreaId());

        HarvestCostVO costVO = new HarvestCostVO();
        costVO.setTaskId(task.getId());
        costVO.setTaskName(task.getTaskName());

        BigDecimal totalQualified = BigDecimal.ZERO;
        BigDecimal totalDefective = BigDecimal.ZERO;
        BigDecimal totalDamage = BigDecimal.ZERO;
        Map<String, BigDecimal> categoryCostMap = new HashMap<>();

        for (HarvestItemDTO item : dto.getItems()) {
            MushroomCategory category = categoryService.getById(item.getCategoryId());
            if (category == null) {
                throw new BusinessException("品类不存在: " + item.getCategoryId());
            }

            BigDecimal itemTotal = item.getQualifiedQuantity()
                    .add(item.getDefectiveQuantity() != null ? item.getDefectiveQuantity() : BigDecimal.ZERO)
                    .add(item.getDamageQuantity() != null ? item.getDamageQuantity() : BigDecimal.ZERO);

            totalQualified = totalQualified.add(item.getQualifiedQuantity());
            totalDefective = totalDefective.add(item.getDefectiveQuantity() != null ? item.getDefectiveQuantity() : BigDecimal.ZERO);
            totalDamage = totalDamage.add(item.getDamageQuantity() != null ? item.getDamageQuantity() : BigDecimal.ZERO);

            HarvestDetail detail = new HarvestDetail();
            detail.setTaskId(dto.getTaskId());
            detail.setCategoryId(item.getCategoryId());
            detail.setCategoryName(category.getCategoryName());
            detail.setHarvestQuantity(itemTotal);
            detail.setLossQuantity(item.getDefectiveQuantity() != null ? item.getDefectiveQuantity() : BigDecimal.ZERO
                    .add(item.getDamageQuantity() != null ? item.getDamageQuantity() : BigDecimal.ZERO));
            detail.setQualityLevel(item.getQualityLevel());
            harvestDetailService.save(detail);

            categoryCostMap.put(category.getCategoryName(), item.getQualifiedQuantity());
        }

        BigDecimal totalHarvest = totalQualified.add(totalDefective).add(totalDamage);
        BigDecimal totalLoss = totalDefective.add(totalDamage);
        BigDecimal lossRate = totalHarvest.compareTo(BigDecimal.ZERO) > 0
                ? totalLoss.divide(totalHarvest, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
                : BigDecimal.ZERO;

        BigDecimal laborCost = totalQualified.multiply(new BigDecimal("5"));
        BigDecimal transportCost = totalQualified.multiply(new BigDecimal("2"));
        BigDecimal comprehensiveCost = laborCost.add(transportCost);
        BigDecimal unitCost = totalQualified.compareTo(BigDecimal.ZERO) > 0
                ? comprehensiveCost.divide(totalQualified, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        costVO.setTotalHarvestQuantity(totalHarvest);
        costVO.setTotalQualifiedQuantity(totalQualified);
        costVO.setTotalDefectiveQuantity(totalDefective);
        costVO.setTotalDamageQuantity(totalDamage);
        costVO.setTotalLossQuantity(totalLoss);
        costVO.setLossRate(lossRate);
        costVO.setCategoryCostMap(categoryCostMap);
        costVO.setComprehensiveCost(comprehensiveCost);
        costVO.setUnitCost(unitCost);

        areaQuotaService.consumeQuota(task.getAreaId(), area.getAreaCode(), totalQualified);

        task.setActualQuantity(totalQualified);
        task.setQualityRemark(dto.getQualityRemark());
        task.setTaskStatus(Constants.TASK_STATUS_WAREHOUSE);
        task.setWarehouseTime(LocalDateTime.now());
        updateById(task);

        operationLogService.saveLog(Constants.BIZ_TYPE_TASK, dto.getTaskId(),
                Constants.OP_TYPE_STATUS_CHANGE, "入库完成，合格: " + totalQualified + "kg, 损耗: " + totalLoss + "kg, 损耗率: " + lossRate + "%");

        return costVO;
    }

    public boolean shipTask(Long taskId) {
        HarvestTask task = getById(taskId);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        if (!Constants.TASK_STATUS_WAREHOUSE.equals(task.getTaskStatus())) {
            throw new BusinessException("当前任务状态不支持发货");
        }

        task.setTaskStatus(Constants.TASK_STATUS_SHIPPED);
        task.setShipTime(LocalDateTime.now());
        boolean result = updateById(task);
        if (result) {
            operationLogService.saveLog(Constants.BIZ_TYPE_TASK, taskId,
                    Constants.OP_TYPE_STATUS_CHANGE, "冷链发货完成");
        }
        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean cancelTask(Long taskId) {
        HarvestTask task = getById(taskId);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        if (Constants.TASK_STATUS_SHIPPED.equals(task.getTaskStatus()) ||
                Constants.TASK_STATUS_EXPIRED.equals(task.getTaskStatus())) {
            throw new BusinessException("当前任务状态不支持取消");
        }

        if (Constants.TASK_STATUS_ASSIGNED.equals(task.getTaskStatus()) ||
                Constants.TASK_STATUS_COLLECTING.equals(task.getTaskStatus())) {
            ProductionArea area = productionAreaService.getById(task.getAreaId());
            areaQuotaService.unlockQuota(task.getAreaId(), area.getAreaCode(), task.getExpectedQuantity());
        }

        task.setTaskStatus(Constants.TASK_STATUS_CANCELLED);
        boolean result = updateById(task);
        if (result) {
            operationLogService.saveLog(Constants.BIZ_TYPE_TASK, taskId,
                    Constants.OP_TYPE_STATUS_CHANGE, "取消采收任务");
        }
        return result;
    }

    public void expireOverdueTasks() {
        LambdaQueryWrapper<HarvestTask> wrapper = new LambdaQueryWrapper<>();
        wrapper.lt(HarvestTask::getExpireTime, LocalDateTime.now());
        wrapper.in(HarvestTask::getTaskStatus,
                Constants.TASK_STATUS_PENDING,
                Constants.TASK_STATUS_ASSIGNED,
                Constants.TASK_STATUS_COLLECTING);

        List<HarvestTask> overdueTasks = list(wrapper);
        for (HarvestTask task : overdueTasks) {
            try {
                if (Constants.TASK_STATUS_ASSIGNED.equals(task.getTaskStatus()) ||
                        Constants.TASK_STATUS_COLLECTING.equals(task.getTaskStatus())) {
                    ProductionArea area = productionAreaService.getById(task.getAreaId());
                    areaQuotaService.unlockQuota(task.getAreaId(), area.getAreaCode(), task.getExpectedQuantity());
                }
                task.setTaskStatus(Constants.TASK_STATUS_EXPIRED);
                updateById(task);
                operationLogService.saveLog(Constants.BIZ_TYPE_TASK, task.getId(),
                        Constants.OP_TYPE_STATUS_CHANGE, "任务超时自动失效");
            } catch (Exception e) {
                log.error("处理超时任务失败: taskId={}", task.getId(), e);
            }
        }
    }
}