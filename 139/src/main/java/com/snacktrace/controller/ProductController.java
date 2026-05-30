package com.snacktrace.controller;

import com.snacktrace.annotation.RequireRole;
import com.snacktrace.common.Result;
import com.snacktrace.entity.Product;
import com.snacktrace.enums.RoleEnum;
import com.snacktrace.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/list")
    public Result<List<Product>> getProductList(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String productName,
            @RequestParam(required = false) Integer status) {
        List<Product> list = productService.getProductList(categoryId, productName, status);
        return Result.success(list);
    }

    @PostMapping
    @RequireRole({RoleEnum.ADMIN, RoleEnum.R_D})
    public Result<Void> addProduct(@RequestBody Product product) {
        boolean success = productService.save(product);
        return success ? Result.success("添加成功", null) : Result.error("添加失败");
    }

    @PutMapping
    @RequireRole({RoleEnum.ADMIN, RoleEnum.R_D})
    public Result<Void> updateProduct(@RequestBody Product product) {
        boolean success = productService.updateById(product);
        return success ? Result.success("更新成功", null) : Result.error("更新失败");
    }

    @PutMapping("/offline/{id}")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.R_D})
    public Result<Void> offlineProduct(@PathVariable Long id) {
        boolean success = productService.offlineProduct(id);
        return success ? Result.success("下架成功", null) : Result.error("下架失败");
    }

    @DeleteMapping("/{id}")
    @RequireRole({RoleEnum.ADMIN})
    public Result<Void> deleteProduct(@PathVariable Long id) {
        boolean success = productService.removeById(id);
        return success ? Result.success("删除成功", null) : Result.error("删除失败");
    }
}
