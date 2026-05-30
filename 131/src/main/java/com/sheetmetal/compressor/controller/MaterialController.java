package com.sheetmetal.compressor.controller;

import com.sheetmetal.compressor.annotation.OperationLog;
import com.sheetmetal.compressor.annotation.RequiresRole;
import com.sheetmetal.compressor.common.PageResult;
import com.sheetmetal.compressor.dto.MaterialDTO;
import com.sheetmetal.compressor.dto.MaterialQueryDTO;
import com.sheetmetal.compressor.dto.StockUpdateDTO;
import com.sheetmetal.compressor.entity.Material;
import com.sheetmetal.compressor.enums.UserRole;
import com.sheetmetal.compressor.service.MaterialService;
import com.sheetmetal.compressor.common.Result;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/material")
public class MaterialController {

    @Autowired
    private MaterialService materialService;

    @GetMapping("/page")
    public Result<PageResult<Material>> queryPage(@Valid MaterialQueryDTO dto) {
        return Result.success(materialService.queryPage(dto));
    }

    @GetMapping("/{id}")
    public Result<Material> getById(@PathVariable Long id) {
        return Result.success(materialService.getById(id));
    }

    @PostMapping
    @RequiresRole({UserRole.ADMIN, UserRole.PURCHASER})
    @OperationLog(module = "原料管理", type = "新增", desc = "新增原料")
    public Result<Void> add(@Valid @RequestBody MaterialDTO dto) {
        materialService.add(dto);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({UserRole.ADMIN, UserRole.PURCHASER})
    @OperationLog(module = "原料管理", type = "修改", desc = "修改原料")
    public Result<Void> update(@Valid @RequestBody MaterialDTO dto) {
        materialService.update(dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({UserRole.ADMIN})
    @OperationLog(module = "原料管理", type = "删除", desc = "删除原料")
    public Result<Void> delete(@PathVariable Long id) {
        materialService.delete(id);
        return Result.success();
    }

    @PutMapping("/stock")
    @RequiresRole({UserRole.ADMIN, UserRole.PURCHASER, UserRole.PRODUCTION_LEADER})
    @OperationLog(module = "原料管理", type = "库存变更", desc = "更新原料库存")
    public Result<Void> updateStock(@Valid @RequestBody StockUpdateDTO dto) {
        materialService.updateStock(dto);
        return Result.success();
    }

    @GetMapping("/moisture-check")
    @RequiresRole({UserRole.ADMIN, UserRole.PURCHASER})
    public Result<PageResult<Material>> getNeedMoistureCheck(@Valid MaterialQueryDTO dto) {
        return Result.success(materialService.getNeedMoistureCheck(dto));
    }

    @PutMapping("/{id}/moisture-check")
    @RequiresRole({UserRole.ADMIN, UserRole.PURCHASER})
    @OperationLog(module = "原料管理", type = "防潮检查", desc = "记录露天原料防潮检查")
    public Result<Void> recordMoistureCheck(@PathVariable Long id, @RequestParam(required = false) String remark) {
        materialService.recordMoistureCheck(id, remark);
        return Result.success();
    }
}
