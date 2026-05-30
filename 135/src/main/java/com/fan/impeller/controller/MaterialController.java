package com.fan.impeller.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fan.impeller.annotation.RequiresRole;
import com.fan.impeller.common.Constants;
import com.fan.impeller.common.PageQuery;
import com.fan.impeller.common.Result;
import com.fan.impeller.dto.MaterialQueryDTO;
import com.fan.impeller.entity.Material;
import com.fan.impeller.service.MaterialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/material")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @GetMapping("/query")
    public Result<Page<Material>> query(PageQuery query, @Valid MaterialQueryDTO dto) {
        return Result.success(materialService.queryPage(query, dto));
    }

    @GetMapping("/page")
    public Result<Page<Material>> page(PageQuery query,
                                       @RequestParam(required = false) String materialType,
                                       @RequestParam(required = false) Integer stockStatus) {
        return Result.success(materialService.page(query, materialType, stockStatus));
    }

    @GetMapping("/{id}")
    public Result<Material> getById(@PathVariable Long id) {
        return Result.success(materialService.getDetailById(id));
    }

    @PostMapping
    @RequiresRole({Constants.ROLE_PURCHASE})
    public Result<Void> add(@Valid @RequestBody Material material) {
        materialService.addMaterial(material);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({Constants.ROLE_PURCHASE})
    public Result<Void> update(@Valid @RequestBody Material material) {
        materialService.updateMaterial(material);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({Constants.ROLE_ADMIN})
    public Result<Void> delete(@PathVariable Long id) {
        materialService.removeById(id);
        return Result.success();
    }
}
