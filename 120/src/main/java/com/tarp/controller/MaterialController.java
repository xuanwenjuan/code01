package com.tarp.controller;

import com.tarp.annotation.OperationLog;
import com.tarp.annotation.RequireRole;
import com.tarp.common.RoleConstants;
import com.tarp.dto.MaterialDTO;
import com.tarp.dto.MaterialQueryDTO;
import com.tarp.entity.Material;
import com.tarp.service.MaterialService;
import com.tarp.vo.MaterialVO;
import com.tarp.vo.PageVO;
import com.tarp.vo.ResultVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/material")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @GetMapping("/query")
    public ResultVO<PageVO<MaterialVO>> queryByConditions(@Valid MaterialQueryDTO queryDTO) {
        return ResultVO.success(materialService.queryByConditions(queryDTO));
    }

    @GetMapping("/{id}")
    public ResultVO<MaterialVO> getById(@PathVariable Long id) {
        return ResultVO.success(materialService.getById(id));
    }

    @GetMapping("/available")
    public ResultVO<List<MaterialVO>> availableList() {
        return ResultVO.success(materialService.getAvailableMaterials());
    }

    @GetMapping("/expiring")
    public ResultVO<List<MaterialVO>> expiringOilMaterials() {
        return ResultVO.success(materialService.getExpiringOilMaterials());
    }

    @PostMapping
    @OperationLog("新增材料")
    @RequireRole({RoleConstants.ROLE_ADMIN, RoleConstants.ROLE_BUYER})
    public ResultVO<Void> addMaterial(@Valid @RequestBody MaterialDTO dto) {
        Material material = new Material();
        BeanUtils.copyProperties(dto, material);
        materialService.addMaterial(material);
        return ResultVO.success();
    }

    @PutMapping
    @OperationLog("修改材料")
    @RequireRole({RoleConstants.ROLE_ADMIN, RoleConstants.ROLE_BUYER})
    public ResultVO<Void> updateMaterial(@Valid @RequestBody MaterialDTO dto) {
        Material material = new Material();
        BeanUtils.copyProperties(dto, material);
        materialService.updateMaterial(material);
        return ResultVO.success();
    }

    @DeleteMapping("/{id}")
    @OperationLog("删除材料")
    @RequireRole({RoleConstants.ROLE_ADMIN, RoleConstants.ROLE_BUYER})
    public ResultVO<Void> deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return ResultVO.success();
    }

    @PutMapping("/stock/{id}")
    @OperationLog("更新材料库存")
    @RequireRole({RoleConstants.ROLE_ADMIN, RoleConstants.ROLE_BUYER, RoleConstants.ROLE_WAREHOUSE})
    public ResultVO<Void> updateStock(@PathVariable Long id, @RequestParam BigDecimal quantity) {
        materialService.updateStock(id, quantity);
        return ResultVO.success();
    }
}
