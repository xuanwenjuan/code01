package com.leathercraft.controller;

import com.leathercraft.annotation.RequiresRole;
import com.leathercraft.common.Result;
import com.leathercraft.dto.MaterialInventoryDTO;
import com.leathercraft.dto.MaterialInventoryQueryDTO;
import com.leathercraft.entity.MaterialInventory;
import com.leathercraft.enums.RoleEnum;
import com.leathercraft.service.MaterialInventoryService;
import com.leathercraft.vo.MaterialInventoryVO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/material")
@RequiredArgsConstructor
public class MaterialInventoryController {

    private final MaterialInventoryService materialInventoryService;

    @PostMapping
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.PURCHASER})
    public Result<Void> add(@RequestBody @Valid MaterialInventoryDTO dto) {
        materialInventoryService.add(dto);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.PURCHASER})
    public Result<Void> update(@RequestBody @Valid MaterialInventory inventory) {
        materialInventoryService.update(inventory);
        return Result.success();
    }

    @PutMapping("/{id}/stop")
    @RequiresRole({RoleEnum.ADMIN})
    public Result<Void> stopPurchase(@PathVariable @NotNull(message = "ID不能为空") Long id) {
        materialInventoryService.stopPurchase(id);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({RoleEnum.ADMIN})
    public Result<Void> delete(@PathVariable @NotNull(message = "ID不能为空") Long id) {
        materialInventoryService.delete(id);
        return Result.success();
    }

    @GetMapping
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.PURCHASER, RoleEnum.TANNER, RoleEnum.CUTTER})
    public Result<List<MaterialInventoryVO>> list(MaterialInventoryQueryDTO query) {
        return Result.success(materialInventoryService.list(query));
    }

    @GetMapping("/{id}")
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.PURCHASER, RoleEnum.TANNER, RoleEnum.CUTTER})
    public Result<MaterialInventoryVO> getById(@PathVariable @NotNull(message = "ID不能为空") Long id) {
        return Result.success(materialInventoryService.getById(id));
    }

    @GetMapping("/expiring-soon")
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.PURCHASER})
    public Result<List<MaterialInventoryVO>> getExpiringSoon() {
        return Result.success(materialInventoryService.getExpiringSoon());
    }
}
