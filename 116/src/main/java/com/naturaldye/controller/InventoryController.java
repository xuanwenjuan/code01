package com.naturaldye.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.naturaldye.annotation.RequiresRole;
import com.naturaldye.common.Result;
import com.naturaldye.dto.InventoryQueryDTO;
import com.naturaldye.entity.Inventory;
import com.naturaldye.enums.UserRoleEnum;
import com.naturaldye.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.FABRIC_PURCHASER})
    public Result<Void> addInventory(@Valid @RequestBody Inventory inventory) {
        inventoryService.addInventory(inventory);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.FABRIC_PURCHASER})
    public Result<Void> updateInventory(@Valid @RequestBody Inventory inventory) {
        inventoryService.updateInventory(inventory);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({UserRoleEnum.ADMIN})
    public Result<Void> deleteInventory(@PathVariable Long id) {
        inventoryService.deleteInventory(id);
        return Result.success();
    }

    @PostMapping("/page")
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.FABRIC_PURCHASER, UserRoleEnum.DYE_MASTER, UserRoleEnum.WORKSHOP_MANAGER})
    public Result<Page<Inventory>> queryInventoryPage(@Valid @RequestBody InventoryQueryDTO queryDTO) {
        Page<Inventory> page = inventoryService.queryInventoryPage(queryDTO);
        return Result.success(page);
    }

    @PostMapping("/list")
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.FABRIC_PURCHASER, UserRoleEnum.DYE_MASTER, UserRoleEnum.WORKSHOP_MANAGER})
    public Result<List<Inventory>> queryInventoryList(@Valid @RequestBody InventoryQueryDTO queryDTO) {
        List<Inventory> list = inventoryService.queryInventoryList(queryDTO);
        return Result.success(list);
    }

    @GetMapping("/{id}")
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.FABRIC_PURCHASER, UserRoleEnum.DYE_MASTER, UserRoleEnum.WORKSHOP_MANAGER})
    public Result<Inventory> getInventoryById(@PathVariable Long id) {
        Inventory inventory = inventoryService.getInventoryById(id);
        return Result.success(inventory);
    }

    @GetMapping("/expiring-fading")
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.FABRIC_PURCHASER, UserRoleEnum.DYE_MASTER})
    public Result<List<Inventory>> getExpiringFadingMaterials() {
        List<Inventory> list = inventoryService.getExpiringFadingMaterials();
        return Result.success(list);
    }
}
