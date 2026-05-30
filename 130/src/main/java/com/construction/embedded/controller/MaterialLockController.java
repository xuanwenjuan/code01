package com.construction.embedded.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.construction.embedded.annotation.RequiresRole;
import com.construction.embedded.common.Result;
import com.construction.embedded.constant.RoleConstants;
import com.construction.embedded.dto.OrderMaterialLockDTO;
import com.construction.embedded.entity.MaterialLockRecord;
import com.construction.embedded.service.MaterialLockService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/material-lock")
public class MaterialLockController {

    @Autowired
    private MaterialLockService materialLockService;

    @PostMapping("/lock")
    @RequiresRole({RoleConstants.TECHNICIAN, RoleConstants.TEAM_LEADER, RoleConstants.ADMIN})
    public Result<Void> lockOrderMaterials(@Valid @RequestBody OrderMaterialLockDTO dto) {
        materialLockService.lockOrderMaterials(dto);
        return Result.success("原料锁定成功", null);
    }

    @PostMapping("/unlock/{orderId}")
    @RequiresRole({RoleConstants.TECHNICIAN, RoleConstants.TEAM_LEADER, RoleConstants.ADMIN})
    public Result<Void> unlockOrderMaterials(
            @PathVariable Long orderId,
            @RequestParam(required = false) String remark) {
        materialLockService.unlockOrderMaterials(orderId, remark);
        return Result.success("原料解锁成功", null);
    }

    @GetMapping
    public Result<IPage<MaterialLockRecord>> list(
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        IPage<MaterialLockRecord> page = materialLockService.queryPage(orderId, status, pageNum, pageSize);
        return Result.success(page);
    }

    @GetMapping("/{id}")
    public Result<MaterialLockRecord> getById(@PathVariable Long id) {
        MaterialLockRecord record = materialLockService.getById(id);
        return Result.success(record);
    }
}
