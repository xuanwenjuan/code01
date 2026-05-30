package com.snack.processing.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.snack.processing.common.Result;
import com.snack.processing.dto.supplier.SupplierAddDTO;
import com.snack.processing.dto.supplier.SupplierQueryDTO;
import com.snack.processing.entity.Supplier;
import com.snack.processing.service.SupplierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/supplier")
@RequiredArgsConstructor
@Tag(name = "供应商管理", description = "供应商信息管理")
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping
    @Operation(summary = "新增供应商")
    public Result<Void> addSupplier(@Valid @RequestBody SupplierAddDTO dto) {
        return supplierService.addSupplier(dto);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新供应商")
    public Result<Void> updateSupplier(@PathVariable Long id, @Valid @RequestBody SupplierAddDTO dto) {
        return supplierService.updateSupplier(id, dto);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除供应商")
    public Result<Void> deleteSupplier(@PathVariable Long id) {
        return supplierService.deleteSupplier(id);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取供应商详情")
    public Result<Supplier> getSupplierById(@PathVariable Long id) {
        return supplierService.getSupplierById(id);
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询供应商列表")
    public Result<IPage<Supplier>> getSupplierPage(SupplierQueryDTO dto) {
        return supplierService.getSupplierPage(dto);
    }

    @GetMapping("/list/enabled")
    @Operation(summary = "获取所有启用的供应商")
    public Result<List<Supplier>> getAllEnabledSuppliers() {
        return supplierService.getAllEnabledSuppliers();
    }
}
