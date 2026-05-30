package com.bee.equipment.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.bee.equipment.annotation.OperationLog;
import com.bee.equipment.annotation.Permission;
import com.bee.equipment.annotation.RequireRole;
import com.bee.equipment.common.PermissionEnum;
import com.bee.equipment.common.Result;
import com.bee.equipment.common.RoleEnum;
import com.bee.equipment.dto.MaterialDTO;
import com.bee.equipment.dto.MaterialQueryDTO;
import com.bee.equipment.service.MaterialService;
import com.bee.equipment.vo.MaterialVO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/material")
public class MaterialController {

    @Autowired
    private MaterialService materialService;

    @GetMapping("/page")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.PURCHASER, RoleEnum.ASSEMBLER})
    @Permission(PermissionEnum.MATERIAL_VIEW)
    public Result<Page<MaterialVO>> queryPage(@Valid MaterialQueryDTO queryDTO) {
        return Result.success(materialService.queryByConditions(queryDTO));
    }

    @GetMapping("/{id}")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.PURCHASER, RoleEnum.ASSEMBLER})
    @Permission(PermissionEnum.MATERIAL_VIEW)
    public Result<MaterialVO> getById(@PathVariable Long id) {
        return Result.success(materialService.getDetailById(id));
    }

    @PostMapping
    @RequireRole({RoleEnum.ADMIN, RoleEnum.PURCHASER})
    @Permission(PermissionEnum.MATERIAL_ADD)
    @OperationLog(module = "物料管理", description = "新增物料")
    public Result<Void> addMaterial(@Valid @RequestBody MaterialDTO materialDTO) {
        materialService.addMaterial(materialDTO);
        return Result.success();
    }

    @PutMapping
    @RequireRole({RoleEnum.ADMIN, RoleEnum.PURCHASER})
    @Permission(PermissionEnum.MATERIAL_EDIT)
    @OperationLog(module = "物料管理", description = "修改物料")
    public Result<Void> updateMaterial(@Valid @RequestBody MaterialDTO materialDTO) {
        materialService.updateMaterial(materialDTO);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequireRole(RoleEnum.ADMIN)
    @Permission(PermissionEnum.MATERIAL_DELETE)
    @OperationLog(module = "物料管理", description = "删除物料")
    public Result<Void> deleteMaterial(@PathVariable Long id) {
        materialService.removeById(id);
        return Result.success();
    }

    @PutMapping("/{id}/status")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.PURCHASER})
    @Permission(PermissionEnum.MATERIAL_STATUS)
    @OperationLog(module = "物料管理", description = "修改物料状态")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam String status) {
        materialService.updateStatus(id, status);
        return Result.success();
    }
}
