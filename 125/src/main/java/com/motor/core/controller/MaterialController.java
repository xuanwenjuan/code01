package com.motor.core.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.motor.core.annotation.OperationLog;
import com.motor.core.annotation.RequiresRole;
import com.motor.core.common.Result;
import com.motor.core.constants.RoleConstants;
import com.motor.core.dto.MaterialQueryDTO;
import com.motor.core.entity.po.MaterialPO;
import com.motor.core.service.MaterialService;
import com.motor.core.vo.MaterialVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/material")
@RequiredArgsConstructor
public class MaterialController {
    private final MaterialService materialService;

    @GetMapping("/page")
    @OperationLog(module = "物料管理", operation = "分页查询", description = "多条件查询物料列表")
    public Result<Page<MaterialVO>> queryPage(MaterialQueryDTO queryDTO) {
        return Result.success(materialService.queryByConditions(queryDTO));
    }

    @GetMapping("/{id}")
    @OperationLog(module = "物料管理", operation = "查询详情", description = "根据ID查询物料详情")
    public Result<MaterialVO> getById(@PathVariable Long id) {
        return Result.success(materialService.getDetailById(id));
    }

    @PostMapping
    @RequiresRole(RoleConstants.PURCHASE)
    @OperationLog(module = "物料管理", operation = "新增物料", description = "采购专员新增物料")
    public Result<Void> create(@Valid @RequestBody MaterialPO material) {
        boolean success = materialService.save(material);
        return success ? Result.success() : Result.error("创建失败");
    }

    @PutMapping
    @RequiresRole(RoleConstants.PURCHASE)
    @OperationLog(module = "物料管理", operation = "更新物料", description = "采购专员更新物料信息")
    public Result<Void> update(@Valid @RequestBody MaterialPO material) {
        boolean success = materialService.updateById(material);
        return success ? Result.success() : Result.error("更新失败");
    }

    @DeleteMapping("/{id}")
    @RequiresRole(RoleConstants.PURCHASE)
    @OperationLog(module = "物料管理", operation = "删除物料", description = "采购专员删除物料")
    public Result<Void> delete(@PathVariable Long id) {
        boolean success = materialService.removeById(id);
        return success ? Result.success() : Result.error("删除失败");
    }

    @PutMapping("/{id}/stock/in")
    @RequiresRole(RoleConstants.PURCHASE)
    @OperationLog(module = "物料管理", operation = "入库", description = "物料入库操作")
    public Result<Void> stockIn(@PathVariable Long id, @RequestParam BigDecimal quantity,
                                 @RequestParam(required = false) String remark) {
        boolean success = materialService.stockIn(id, quantity, remark);
        return success ? Result.success("入库成功", null) : Result.error("入库失败");
    }

    @PutMapping("/{id}/lock")
    @RequiresRole({RoleConstants.PRODUCTION_LEADER, RoleConstants.PROCESS_ENGINEER})
    @OperationLog(module = "物料管理", operation = "锁定库存", description = "锁定物料库存")
    public Result<Void> lockStock(@PathVariable Long id, @RequestParam BigDecimal quantity) {
        boolean success = materialService.lockStock(id, quantity);
        return success ? Result.success("锁定成功", null) : Result.error("锁定失败");
    }

    @PutMapping("/{id}/unlock")
    @RequiresRole({RoleConstants.PRODUCTION_LEADER, RoleConstants.PROCESS_ENGINEER})
    @OperationLog(module = "物料管理", operation = "解锁库存", description = "解锁物料库存")
    public Result<Void> unlockStock(@PathVariable Long id, @RequestParam BigDecimal quantity) {
        boolean success = materialService.unlockStock(id, quantity);
        return success ? Result.success("解锁成功", null) : Result.error("解锁失败");
    }
}
