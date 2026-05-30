package com.mushroom.traceability.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mushroom.traceability.common.Constants;
import com.mushroom.traceability.entity.HarvestDetail;
import com.mushroom.traceability.entity.HarvestTask;
import com.mushroom.traceability.entity.MushroomCategory;
import com.mushroom.traceability.exception.BusinessException;
import com.mushroom.traceability.mapper.HarvestDetailMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HarvestDetailService extends ServiceImpl<HarvestDetailMapper, HarvestDetail> {

    private final MushroomCategoryService categoryService;
    private final HarvestTaskService harvestTaskService;
    private final OperationLogService operationLogService;

    public List<HarvestDetail> listByTaskId(Long taskId) {
        LambdaQueryWrapper<HarvestDetail> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(HarvestDetail::getTaskId, taskId);
        return list(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean save(HarvestDetail entity) {
        HarvestTask task = harvestTaskService.getById(entity.getTaskId());
        if (task == null) {
            throw new BusinessException("采收任务不存在");
        }
        
        if (!Constants.TASK_STATUS_COLLECTING.equals(task.getTaskStatus())) {
            throw new BusinessException("当前任务状态不允许添加采收明细");
        }

        MushroomCategory category = categoryService.getById(entity.getCategoryId());
        if (category == null) {
            throw new BusinessException("品类不存在");
        }
        
        if (category.getIsForbidden() == 1) {
            throw new BusinessException("品类 [" + category.getCategoryName() + "] 已被禁采，无法添加采收记录");
        }
        if (category.getStatus() == 0) {
            throw new BusinessException("品类 [" + category.getCategoryName() + "] 已下架，无法添加采收记录");
        }

        entity.setCategoryName(category.getCategoryName());
        if (entity.getHarvestQuantity() == null) {
            entity.setHarvestQuantity(BigDecimal.ZERO);
        }
        if (entity.getLossQuantity() == null) {
            entity.setLossQuantity(BigDecimal.ZERO);
        }

        boolean result = super.save(entity);
        if (result) {
            operationLogService.saveLog(Constants.BIZ_TYPE_TASK, entity.getTaskId(),
                    Constants.OP_TYPE_CREATE, "添加采收明细: " + category.getCategoryName() + 
                    ", 数量: " + entity.getHarvestQuantity() + "kg");
        }
        return result;
    }
}