package com.oiledumbrella.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.oiledumbrella.common.Result;
import com.oiledumbrella.dto.MaterialInStockDTO;
import com.oiledumbrella.dto.MaterialQueryDTO;
import com.oiledumbrella.entity.Material;
import com.oiledumbrella.service.MaterialService;
import com.oiledumbrella.vo.MaterialVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/material")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @GetMapping("/query")
    public Result<Page<MaterialVO>> queryByConditions(@Valid MaterialQueryDTO queryDTO) {
        Page<MaterialVO> page = materialService.queryByConditions(queryDTO);
        return Result.success(page);
    }

    @PostMapping("/in-stock")
    public Result<Void> inStock(@Valid @RequestBody MaterialInStockDTO dto, HttpServletRequest request) {
        Long operatorId = (Long) request.getAttribute("userId");
        materialService.inStock(dto, operatorId);
        return Result.success("入库成功", null);
    }

    @PutMapping("/out-stock/{batchId}")
    public Result<Void> outStock(@PathVariable Long batchId,
                                  @RequestParam BigDecimal quantity,
                                  HttpServletRequest request) {
        Long operatorId = (Long) request.getAttribute("userId");
        materialService.outStock(batchId, quantity, operatorId);
        return Result.success("出库成功", null);
    }

    @PutMapping("/scrap/{id}")
    public Result<Void> scrapStock(@PathVariable Long id,
                                    @RequestParam BigDecimal quantity,
                                    @RequestParam(required = false) String reason,
                                    HttpServletRequest request) {
        Long operatorId = (Long) request.getAttribute("userId");
        materialService.scrapStock(id, quantity, reason, operatorId);
        return Result.success("报废成功", null);
    }

    @PostMapping
    public Result<Void> add(@RequestBody Material material) {
        materialService.add(material);
        return Result.success("添加成功", null);
    }

    @PutMapping
    public Result<Void> update(@RequestBody Material material) {
        materialService.update(material);
        return Result.success("更新成功", null);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        materialService.delete(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/low-stock")
    public Result<List<Material>> getLowStock() {
        List<Material> list = materialService.getLowStock();
        return Result.success(list);
    }

    @GetMapping("/list")
    public Result<List<Material>> list() {
        List<Material> list = materialService.list();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<Material> getById(@PathVariable Long id) {
        Material material = materialService.getById(id);
        return Result.success(material);
    }
}
