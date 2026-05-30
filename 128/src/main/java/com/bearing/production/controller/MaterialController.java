package com.bearing.production.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.bearing.production.annotation.OperationLog;
import com.bearing.production.annotation.RequiresRole;
import com.bearing.production.common.Result;
import com.bearing.production.dto.MaterialDTO;
import com.bearing.production.dto.MaterialQueryDTO;
import com.bearing.production.entity.Material;
import com.bearing.production.enums.RoleEnum;
import com.bearing.production.service.MaterialService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/material")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @PostMapping
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PURCHASER_CODE})
    @OperationLog(module = "特种钢材原料管理", description = "新增原料入库")
    public Result<Void> addMaterial(@Valid @RequestBody MaterialDTO materialDTO) {
        materialService.addMaterial(materialDTO);
        return Result.success("新增成功", null);
    }

    @PutMapping("/{id}")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PURCHASER_CODE})
    @OperationLog(module = "特种钢材原料管理", description = "更新原料信息")
    public Result<Void> updateMaterial(@PathVariable @NotNull Long id, @Valid @RequestBody MaterialDTO materialDTO) {
        materialService.updateMaterial(id, materialDTO);
        return Result.success("更新成功", null);
    }

    @DeleteMapping("/{id}")
    @RequiresRole({RoleEnum.ADMIN_CODE})
    @OperationLog(module = "特种钢材原料管理", description = "删除原料")
    public Result<Void> deleteMaterial(@PathVariable @NotNull Long id) {
        materialService.deleteMaterial(id);
        return Result.success("删除成功", null);
    }

    @PutMapping("/{id}/stock")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PURCHASER_CODE})
    @OperationLog(module = "特种钢材原料管理", description = "更新原料库存")
    public Result<Void> updateStock(@PathVariable @NotNull Long id, @RequestParam @NotNull BigDecimal quantity) {
        materialService.updateStock(id, quantity);
        return Result.success("库存更新成功", null);
    }

    @GetMapping("/{id}")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PURCHASER_CODE, RoleEnum.PROCESS_ENGINEER_CODE, RoleEnum.LINE_LEADER_CODE, RoleEnum.QUALITY_INSPECTOR_CODE})
    public Result<Material> getById(@PathVariable @NotNull Long id) {
        Material material = materialService.getById(id);
        return Result.success("查询成功", material);
    }

    @PostMapping("/query")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PURCHASER_CODE, RoleEnum.PROCESS_ENGINEER_CODE, RoleEnum.LINE_LEADER_CODE})
    @OperationLog(module = "特种钢材原料管理", description = "多条件查询原料")
    public Result<IPage<Material>> queryByConditions(@Valid @RequestBody MaterialQueryDTO queryDTO) {
        IPage<Material> pageResult = materialService.queryByConditions(queryDTO);
        return Result.success("查询成功", pageResult);
    }

    @GetMapping("/list")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PURCHASER_CODE, RoleEnum.PROCESS_ENGINEER_CODE, RoleEnum.LINE_LEADER_CODE})
    public Result<List<Material>> getByStockStatus(@RequestParam(required = false) Integer stockStatus) {
        List<Material> list = materialService.getByStockStatus(stockStatus);
        return Result.success("查询成功", list);
    }

    @GetMapping("/page")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PURCHASER_CODE, RoleEnum.PROCESS_ENGINEER_CODE, RoleEnum.LINE_LEADER_CODE})
    public Result<IPage<Material>> getByStockStatusPage(
            @RequestParam(required = false) Integer stockStatus,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        IPage<Material> pageResult = materialService.getByStockStatusPage(stockStatus, page, size);
        return Result.success("查询成功", pageResult);
    }

    @GetMapping("/rust-proof-reminder")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PURCHASER_CODE})
    @OperationLog(module = "特种钢材原料管理", description = "查询防锈提醒列表")
    public Result<List<Material>> getRustProofReminderList() {
        List<Material> list = materialService.getRustProofReminderList();
        return Result.success("查询成功", list);
    }

    @PutMapping("/{id}/rust-proof")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PURCHASER_CODE})
    @OperationLog(module = "特种钢材原料管理", description = "执行防锈处理")
    public Result<Void> doRustProof(@PathVariable @NotNull Long id) {
        materialService.doRustProof(id);
        return Result.success("防锈处理完成", null);
    }
}
