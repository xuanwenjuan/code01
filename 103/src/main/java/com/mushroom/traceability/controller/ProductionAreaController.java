package com.mushroom.traceability.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mushroom.traceability.annotation.RequiresRole;
import com.mushroom.traceability.common.Constants;
import com.mushroom.traceability.common.Result;
import com.mushroom.traceability.entity.ProductionArea;
import com.mushroom.traceability.service.ProductionAreaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/areas")
@RequiredArgsConstructor
public class ProductionAreaController {

    private final ProductionAreaService areaService;

    @GetMapping
    public Result<List<ProductionArea>> list() {
        return Result.success(areaService.listSorted());
    }

    @GetMapping("/status/{status}")
    public Result<List<ProductionArea>> listByStatus(@PathVariable String status) {
        return Result.success(areaService.listByStatus(status));
    }

    @GetMapping("/available")
    public Result<List<ProductionArea>> listAvailable() {
        LambdaQueryWrapper<ProductionArea> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionArea::getStatus, Constants.AREA_STATUS_NORMAL);
        wrapper.eq(ProductionArea::getIsRainySeason, 0);
        wrapper.orderByAsc(ProductionArea::getSortOrder);
        return Result.success(areaService.list(wrapper));
    }

    @GetMapping("/{id}")
    public Result<ProductionArea> getById(@PathVariable Long id) {
        return Result.success(areaService.getById(id));
    }

    @PostMapping
    @RequiresRole({Constants.ROLE_OPERATOR, Constants.ROLE_ADMIN})
    public Result<Void> create(@Valid @RequestBody ProductionArea area) {
        areaService.save(area);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({Constants.ROLE_OPERATOR, Constants.ROLE_ADMIN})
    public Result<Void> update(@Valid @RequestBody ProductionArea area) {
        areaService.updateById(area);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({Constants.ROLE_ADMIN})
    public Result<Void> delete(@PathVariable Long id) {
        areaService.removeById(id);
        return Result.success();
    }

    @PutMapping("/{id}/status")
    @RequiresRole({Constants.ROLE_OPERATOR, Constants.ROLE_ADMIN})
    public Result<Void> toggleStatus(@PathVariable Long id) {
        areaService.toggleStatus(id);
        return Result.success();
    }

    @PutMapping("/{id}/rainy-season")
    @RequiresRole({Constants.ROLE_OPERATOR, Constants.ROLE_ADMIN})
    public Result<Void> setRainySeason(@PathVariable Long id, @RequestParam Integer isRainySeason) {
        areaService.setRainySeason(id, isRainySeason);
        return Result.success();
    }
}