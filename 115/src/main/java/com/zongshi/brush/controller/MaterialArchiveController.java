package com.zongshi.brush.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zongshi.brush.annotation.OperationLog;
import com.zongshi.brush.annotation.RequiresRoles;
import com.zongshi.brush.common.Result;
import com.zongshi.brush.dto.MaterialArchiveDTO;
import com.zongshi.brush.dto.MaterialQueryDTO;
import com.zongshi.brush.entity.MaterialArchive;
import com.zongshi.brush.service.MaterialArchiveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/material")
@RequiredArgsConstructor
public class MaterialArchiveController {

    private final MaterialArchiveService materialArchiveService;

    @PostMapping
    @OperationLog(module = "制笔原材档案", type = "新增", description = "新增原料档案")
    @RequiresRoles({"ADMIN", "MATERIAL_WORKER"})
    public Result<Long> addMaterial(@Valid @RequestBody MaterialArchiveDTO dto) {
        Long id = materialArchiveService.addMaterial(dto);
        return Result.success("新增原料成功", id);
    }

    @PutMapping
    @OperationLog(module = "制笔原材档案", type = "修改", description = "修改原料档案")
    @RequiresRoles({"ADMIN", "MATERIAL_WORKER"})
    public Result<Void> updateMaterial(@Valid @RequestBody MaterialArchiveDTO dto) {
        materialArchiveService.updateMaterial(dto);
        return Result.success("修改原料成功");
    }

    @DeleteMapping("/{id}")
    @OperationLog(module = "制笔原材档案", type = "删除", description = "删除原料档案")
    @RequiresRoles({"ADMIN"})
    public Result<Void> deleteMaterial(@PathVariable Long id) {
        materialArchiveService.deleteMaterial(id);
        return Result.success("删除原料成功");
    }

    @GetMapping("/{id}")
    @OperationLog(module = "制笔原材档案", type = "查询", description = "查询原料详情")
    public Result<MaterialArchive> getMaterialById(@PathVariable Long id) {
        MaterialArchive material = materialArchiveService.getMaterialById(id);
        return Result.success(material);
    }

    @GetMapping("/page")
    @OperationLog(module = "制笔原材档案", type = "查询", description = "分页查询原料列表")
    public Result<Page<MaterialArchive>> getMaterialPage(@Valid MaterialQueryDTO dto) {
        Page<MaterialArchive> result = materialArchiveService.queryMaterialPage(dto);
        return Result.success(result);
    }

    @GetMapping("/list")
    @OperationLog(module = "制笔原材档案", type = "查询", description = "多条件查询原料列表")
    public Result<List<MaterialArchive>> getMaterialList(@Valid MaterialQueryDTO dto) {
        List<MaterialArchive> list = materialArchiveService.queryMaterialList(dto);
        return Result.success(list);
    }

    @GetMapping("/warning")
    @OperationLog(module = "制笔原材档案", type = "查询", description = "查询库存预警原料")
    public Result<List<MaterialArchive>> getWarningMaterials() {
        List<MaterialArchive> list = materialArchiveService.getWarningMaterials();
        return Result.success(list);
    }

    @GetMapping("/expiring-moisture")
    @OperationLog(module = "制笔原材档案", type = "查询", description = "查询防潮到期原料")
    public Result<List<MaterialArchive>> getExpiringMoistureMaterials(
            @RequestParam(required = false) Integer days) {
        List<MaterialArchive> list = materialArchiveService.getExpiringMoistureMaterials(days);
        return Result.success(list);
    }
}
