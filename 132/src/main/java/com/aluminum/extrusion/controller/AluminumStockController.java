package com.aluminum.extrusion.controller;

import com.aluminum.extrusion.annotation.RequireRole;
import com.aluminum.extrusion.common.Result;
import com.aluminum.extrusion.dto.StockQueryDTO;
import com.aluminum.extrusion.entity.AluminumStock;
import com.aluminum.extrusion.enums.RoleEnum;
import com.aluminum.extrusion.service.AluminumStockService;
import com.baomidou.mybatisplus.core.metadata.IPage;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
public class AluminumStockController {

    private final AluminumStockService aluminumStockService;

    @PostMapping
    @RequireRole({RoleEnum.ADMIN, RoleEnum.PURCHASER})
    public Result<Void> addStock(@Valid @RequestBody AluminumStock stock) {
        aluminumStockService.addStock(stock);
        return Result.success("入库成功");
    }

    @PutMapping
    @RequireRole({RoleEnum.ADMIN, RoleEnum.PURCHASER})
    public Result<Void> updateStock(@Valid @RequestBody AluminumStock stock) {
        aluminumStockService.updateStock(stock);
        return Result.success("更新成功");
    }

    @PutMapping("/{id}/quantity")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.PURCHASER})
    public Result<Void> updateStockQuantity(
            @PathVariable Long id,
            @RequestParam BigDecimal quantity,
            @RequestParam Integer type,
            @RequestParam(required = false) String remark) {
        aluminumStockService.updateStockQuantity(id, quantity, type, remark);
        return Result.success(type == 1 ? "入库成功" : "出库成功");
    }

    @PutMapping("/{id}/lock")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.TEAM_LEADER, RoleEnum.PROCESS_ENGINEER})
    public Result<Void> lockStock(
            @PathVariable Long id,
            @RequestParam BigDecimal quantity,
            @RequestParam String orderNo) {
        aluminumStockService.lockStock(id, quantity, orderNo);
        return Result.success("库存锁定成功");
    }

    @PutMapping("/unlock")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.TEAM_LEADER, RoleEnum.PROCESS_ENGINEER})
    public Result<Void> unlockStock(@RequestParam String orderNo) {
        aluminumStockService.unlockStock(orderNo);
        return Result.success("库存解锁成功");
    }

    @GetMapping("/warning")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.PURCHASER, RoleEnum.TEAM_LEADER})
    public Result<List<AluminumStock>> getWarningList() {
        List<AluminumStock> warningList = aluminumStockService.getWarningList();
        return Result.success(warningList);
    }

    @PostMapping("/page")
    public Result<IPage<AluminumStock>> getStockPage(@Valid @RequestBody StockQueryDTO queryDTO) {
        IPage<AluminumStock> page = aluminumStockService.getStockPage(queryDTO);
        return Result.success(page);
    }

    @GetMapping("/list")
    public Result<List<AluminumStock>> list() {
        return Result.success(aluminumStockService.getAllStockList());
    }

    @GetMapping("/available")
    public Result<List<AluminumStock>> getAvailableStockList(
            @RequestParam(required = false) String alloyGrade) {
        return Result.success(aluminumStockService.getAvailableStockList(alloyGrade));
    }

    @GetMapping("/{id}")
    public Result<AluminumStock> getById(@PathVariable Long id) {
        return Result.success(aluminumStockService.getById(id));
    }
}
