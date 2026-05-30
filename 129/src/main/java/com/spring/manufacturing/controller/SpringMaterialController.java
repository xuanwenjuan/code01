package com.spring.manufacturing.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.spring.manufacturing.annotation.OperationLog;
import com.spring.manufacturing.annotation.RequiresRole;
import com.spring.manufacturing.common.Result;
import com.spring.manufacturing.dto.MaterialInboundDTO;
import com.spring.manufacturing.dto.MaterialQueryDTO;
import com.spring.manufacturing.entity.SpringMaterial;
import com.spring.manufacturing.service.SpringMaterialService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/material")
@RequiredArgsConstructor
public class SpringMaterialController {

    private final SpringMaterialService springMaterialService;

    @GetMapping("/page")
    @RequiresRole({"ADMIN", "PURCHASER", "LEADER", "PROCESSOR"})
    public Result<IPage<SpringMaterial>> getMaterialPage(@ModelAttribute MaterialQueryDTO queryDTO) {
        IPage<SpringMaterial> pageResult = springMaterialService.queryMaterialPage(queryDTO);
        return Result.success(pageResult);
    }

    @GetMapping("/warning")
    @RequiresRole({"ADMIN", "PURCHASER", "LEADER"})
    public Result<List<SpringMaterial>> getWarningMaterials() {
        List<SpringMaterial> materials = springMaterialService.getWarningMaterials();
        return Result.success(materials);
    }

    @GetMapping("/{id}")
    @RequiresRole({"ADMIN", "PURCHASER", "LEADER", "PROCESSOR"})
    public Result<SpringMaterial> getMaterialById(@PathVariable Long id) {
        SpringMaterial material = springMaterialService.getById(id);
        return Result.success(material);
    }

    @PostMapping("/inbound")
    @RequiresRole({"ADMIN", "PURCHASER"})
    @OperationLog(module = "原料管理", type = "入库", description = "原料入库")
    public Result<Void> inboundMaterial(@Valid @RequestBody MaterialInboundDTO dto, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        springMaterialService.inboundMaterial(dto, userId);
        return Result.success("入库成功", null);
    }

    @PutMapping
    @RequiresRole({"ADMIN", "PURCHASER"})
    @OperationLog(module = "原料管理", type = "更新", description = "更新原料信息")
    public Result<Void> updateMaterial(@Valid @RequestBody SpringMaterial material) {
        springMaterialService.updateById(material);
        return Result.success("更新成功", null);
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    @OperationLog(module = "原料管理", type = "删除", description = "删除原料")
    public Result<Void> deleteMaterial(@PathVariable Long id) {
        springMaterialService.removeById(id);
        return Result.success("删除成功", null);
    }

    @PutMapping("/stop-purchase/{id}")
    @RequiresRole({"ADMIN", "PURCHASER"})
    @OperationLog(module = "原料管理", type = "停止采购", description = "停止原料采购")
    public Result<Void> stopPurchase(@PathVariable Long id) {
        springMaterialService.stopPurchase(id);
        return Result.success("已停止采购", null);
    }
}