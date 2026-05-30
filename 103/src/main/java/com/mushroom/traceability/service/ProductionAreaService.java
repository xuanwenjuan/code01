package com.mushroom.traceability.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mushroom.traceability.common.Constants;
import com.mushroom.traceability.dto.ProductionAreaQueryDTO;
import com.mushroom.traceability.entity.ProductionArea;
import com.mushroom.traceability.exception.BusinessException;
import com.mushroom.traceability.mapper.ProductionAreaMapper;
import com.mushroom.traceability.vo.PageResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionAreaService extends ServiceImpl<ProductionAreaMapper, ProductionArea> {

    private final OperationLogService operationLogService;

    public PageResult<ProductionArea> queryPage(ProductionAreaQueryDTO query) {
        LambdaQueryWrapper<ProductionArea> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(query.getAreaName())) {
            wrapper.like(ProductionArea::getAreaName, query.getAreaName());
        }
        if (StringUtils.hasText(query.getProvince())) {
            wrapper.eq(ProductionArea::getProvince, query.getProvince());
        }
        if (StringUtils.hasText(query.getCity())) {
            wrapper.eq(ProductionArea::getCity, query.getCity());
        }
        if (StringUtils.hasText(query.getStatus())) {
            wrapper.eq(ProductionArea::getStatus, query.getStatus());
        }
        if (query.getIsRainySeason() != null) {
            wrapper.eq(ProductionArea::getIsRainySeason, query.getIsRainySeason());
        }
        if (query.getAltitudeMin() != null) {
            wrapper.ge(ProductionArea::getAltitude, query.getAltitudeMin());
        }
        if (query.getAltitudeMax() != null) {
            wrapper.le(ProductionArea::getAltitude, query.getAltitudeMax());
        }
        wrapper.orderByAsc(ProductionArea::getSortOrder);

        Page<ProductionArea> page = new Page<>(query.getPageNum(), query.getPageSize());
        page = page(page, wrapper);
        return new PageResult<>(page.getRecords(), page.getTotal(), query.getPageNum(), query.getPageSize());
    }

    public List<ProductionArea> listSorted() {
        LambdaQueryWrapper<ProductionArea> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(ProductionArea::getSortOrder);
        return list(wrapper);
    }

    public List<ProductionArea> listByStatus(String status) {
        LambdaQueryWrapper<ProductionArea> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionArea::getStatus, status);
        wrapper.orderByAsc(ProductionArea::getSortOrder);
        return list(wrapper);
    }

    @Override
    public boolean save(ProductionArea entity) {
        if (entity.getSortOrder() == null) {
            entity.setSortOrder(0);
        }
        if (entity.getStatus() == null) {
            entity.setStatus(Constants.AREA_STATUS_NORMAL);
        }
        if (entity.getIsRainySeason() == null) {
            entity.setIsRainySeason(0);
        }
        boolean result = super.save(entity);
        if (result) {
            operationLogService.saveLog(Constants.BIZ_TYPE_AREA, entity.getId(),
                    Constants.OP_TYPE_CREATE, "新增山林产区: " + entity.getAreaName());
        }
        return result;
    }

    @Override
    public boolean updateById(ProductionArea entity) {
        boolean result = super.updateById(entity);
        if (result) {
            operationLogService.saveLog(Constants.BIZ_TYPE_AREA, entity.getId(),
                    Constants.OP_TYPE_UPDATE, "更新山林产区: " + entity.getAreaName());
        }
        return result;
    }

    public boolean toggleStatus(Long id) {
        ProductionArea area = getById(id);
        if (area == null) {
            throw new BusinessException("产区不存在");
        }
        String newStatus = Constants.AREA_STATUS_NORMAL.equals(area.getStatus())
                ? Constants.AREA_STATUS_FORBIDDEN : Constants.AREA_STATUS_NORMAL;
        area.setStatus(newStatus);
        boolean result = updateById(area);
        if (result) {
            String status = Constants.AREA_STATUS_FORBIDDEN.equals(newStatus) ? "封禁" : "解封";
            operationLogService.saveLog(Constants.BIZ_TYPE_AREA, id,
                    Constants.OP_TYPE_STATUS_CHANGE, status + "山林产区: " + area.getAreaName());
        }
        return result;
    }

    public boolean setRainySeason(Long id, Integer isRainySeason) {
        ProductionArea area = getById(id);
        if (area == null) {
            throw new BusinessException("产区不存在");
        }
        area.setIsRainySeason(isRainySeason);
        if (isRainySeason == 1) {
            area.setWarningMessage("当前为雨季，已暂停该产区采收作业");
        } else {
            area.setWarningMessage(null);
        }
        boolean result = updateById(area);
        if (result) {
            String status = isRainySeason == 1 ? "设置雨季封禁预警" : "取消雨季封禁预警";
            operationLogService.saveLog(Constants.BIZ_TYPE_AREA, id,
                    Constants.OP_TYPE_STATUS_CHANGE, status + ": " + area.getAreaName());
        }
        return result;
    }
}