package com.incense.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.incense.annotation.OperationLog;
import com.incense.annotation.RequiresRole;
import com.incense.common.Result;
import com.incense.dto.MaterialDTO;
import com.incense.dto.MaterialQueryDTO;
import com.incense.dto.StockChangeDTO;
import com.incense.entity.Material;
import com.incense.service.MaterialService;
import com.incense.vo.MaterialVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/material")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @GetMapping("/page")
    public Result<Page<Material>> getPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String materialType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        return Result.success(materialService.getPage(pageNum, pageSize, materialType, status, keyword));
    }

    @PostMapping("/query")
    public Result<Page<MaterialVO>> queryMaterialPage(@Valid @RequestBody MaterialQueryDTO queryDTO) {
        return Result.success(materialService.queryMaterialPage(queryDTO));
    }

    @GetMapping("/warning")
    public Result<List<Material>> getWarningList() {
        return Result.success(materialService.getWarningList());
    }

    @GetMapping("/stats")
    public Result<Map<String, Long>> getMaterialStats() {
        return Result.success(materialService.getMaterialStats());
    }

    @GetMapping("/list")
    public Result<List<Material>> getByType(@RequestParam(required = false) String materialType) {
        return Result.success(materialService.getByType(materialType));
    }

    @GetMapping("/{id}")
    public Result<MaterialVO> getById(@PathVariable Long id) {
        return Result.success(materialService.getMaterialVOById(id));
    }

    @PostMapping
    @RequiresRole({"ADMIN", "BUYER"})
    @OperationLog(module = "原料管理", operation = "新增原料")
    public Result<Void> add(@Valid @RequestBody MaterialDTO dto) {
        materialService.addMaterial(dto);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({"ADMIN", "BUYER"})
    @OperationLog(module = "原料管理", operation = "编辑原料")
    public Result<Void> update(@Valid @RequestBody MaterialDTO dto) {
        materialService.updateMaterial(dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    @OperationLog(module = "原料管理", operation = "删除原料")
    public Result<Void> delete(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return Result.success();
    }

    @PutMapping("/{id}/stock")
    @RequiresRole({"ADMIN", "KEEPER"})
    @OperationLog(module = "原料管理", operation = "更新库存")
    public Result<Void> updateStock(@PathVariable Long id, @RequestBody StockChangeDTO dto) {
        dto.setMaterialId(id);
        materialService.updateStock(id, dto.getQuantity());
        return Result.success();
    }

    @PostMapping("/batch-stock")
    @RequiresRole({"ADMIN", "KEEPER"})
    @OperationLog(module = "原料管理", operation = "批量更新库存")
    public Result<Void> batchStockChange(@Valid @RequestBody List<StockChangeDTO> changes) {
        materialService.batchStockChange(changes);
        return Result.success();
    }
}
