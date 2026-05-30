package com.heritage.dye.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.heritage.dye.common.Result;
import com.heritage.dye.dto.MaterialOriginDTO;
import com.heritage.dye.service.MaterialOriginService;
import com.heritage.dye.vo.MaterialOriginVO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/material-origin")
public class MaterialOriginController {

    @Autowired
    private MaterialOriginService materialOriginService;

    @PostMapping
    public Result<Void> create(@RequestBody @Valid MaterialOriginDTO dto) {
        materialOriginService.create(dto);
        return Result.success();
    }

    @PutMapping
    public Result<Void> update(@RequestBody @Valid MaterialOriginDTO dto) {
        materialOriginService.update(dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        materialOriginService.delete(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<MaterialOriginVO> getById(@PathVariable Long id) {
        return Result.success(materialOriginService.getById(id));
    }

    @GetMapping("/page")
    public Result<Page<MaterialOriginVO>> page(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String harvestSeason) {
        return Result.success(materialOriginService.page(pageNum, pageSize, keyword, status, harvestSeason));
    }

    @GetMapping("/warnings")
    public Result<List<MaterialOriginVO>> listWarnings() {
        return Result.success(materialOriginService.listWarnings());
    }

    @GetMapping("/list")
    public Result<List<MaterialOriginVO>> listAll() {
        return Result.success(materialOriginService.listAll());
    }
}
