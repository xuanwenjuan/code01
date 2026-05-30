package com.snack.processing.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.snack.processing.common.Result;
import com.snack.processing.dto.equipment.EquipmentAddDTO;
import com.snack.processing.dto.equipment.EquipmentQueryDTO;
import com.snack.processing.entity.Equipment;
import com.snack.processing.service.EquipmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/equipment")
@RequiredArgsConstructor
@Tag(name = "设备管理", description = "生产设备信息管理")
public class EquipmentController {

    private final EquipmentService equipmentService;

    @PostMapping
    @Operation(summary = "新增设备")
    public Result<Void> addEquipment(@Valid @RequestBody EquipmentAddDTO dto) {
        return equipmentService.addEquipment(dto);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新设备")
    public Result<Void> updateEquipment(@PathVariable Long id, @Valid @RequestBody EquipmentAddDTO dto) {
        return equipmentService.updateEquipment(id, dto);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除设备")
    public Result<Void> deleteEquipment(@PathVariable Long id) {
        return equipmentService.deleteEquipment(id);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取设备详情")
    public Result<Equipment> getEquipmentById(@PathVariable Long id) {
        return equipmentService.getEquipmentById(id);
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询设备列表")
    public Result<IPage<Equipment>> getEquipmentPage(EquipmentQueryDTO dto) {
        return equipmentService.getEquipmentPage(dto);
    }

    @GetMapping("/list/workshop")
    @Operation(summary = "根据车间获取设备列表")
    public Result<List<Equipment>> getEquipmentByWorkshop(@RequestParam String workshop) {
        return equipmentService.getEquipmentByWorkshop(workshop);
    }
}
