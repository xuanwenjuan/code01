package com.evparts.controller;

import com.evparts.annotation.OperationLog;
import com.evparts.annotation.RequireRole;
import com.evparts.common.PageResult;
import com.evparts.common.Result;
import com.evparts.dto.ProductDTO;
import com.evparts.dto.ProductQueryDTO;
import com.evparts.entity.Product;
import com.evparts.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "产品管理", description = "配件产品的增删改查、停产下架、优先级调整")
@RestController
@RequestMapping("/product")
@RequireRole({"PROCESS", "ADMIN"})
public class ProductController {

    @Autowired
    private ProductService productService;

    @Operation(summary = "分页查询产品")
    @GetMapping("/page")
    public Result<PageResult<Product>> getPage(ProductQueryDTO queryDTO) {
        return Result.success(productService.getPage(queryDTO));
    }

    @Operation(summary = "获取产品列表")
    @GetMapping("/list")
    public Result<List<Product>> getList() {
        return Result.success(productService.getList());
    }

    @Operation(summary = "获取产品详情")
    @GetMapping("/{id}")
    public Result<Product> getById(@PathVariable Long id) {
        return Result.success(productService.getById(id));
    }

    @Operation(summary = "新增产品")
    @OperationLog(operation = "新增产品")
    @PostMapping
    public Result<Void> add(@Valid @RequestBody ProductDTO dto) {
        productService.add(dto);
        return Result.success();
    }

    @Operation(summary = "修改产品")
    @OperationLog(operation = "修改产品")
    @PutMapping
    public Result<Void> update(@Valid @RequestBody ProductDTO dto) {
        productService.update(dto);
        return Result.success();
    }

    @Operation(summary = "更新产品状态")
    @OperationLog(operation = "更新产品状态")
    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        productService.updateStatus(id, status);
        return Result.success();
    }

    @Operation(summary = "调整排产优先级")
    @OperationLog(operation = "调整产品排产优先级")
    @PutMapping("/{id}/priority")
    public Result<Void> updatePriority(@PathVariable Long id, @RequestParam Integer priority) {
        productService.updatePriority(id, priority);
        return Result.success();
    }

    @Operation(summary = "删除产品")
    @OperationLog(operation = "删除产品")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return Result.success();
    }

}
