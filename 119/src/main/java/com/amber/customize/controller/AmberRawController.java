package com.amber.customize.controller;

import com.amber.customize.annotation.OperateLog;
import com.amber.customize.annotation.RequireRole;
import com.amber.customize.common.Result;
import com.amber.customize.dto.AmberRawDTO;
import com.amber.customize.dto.AmberRawQueryDTO;
import com.amber.customize.service.AmberRawService;
import com.amber.customize.vo.AmberRawVO;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/amber-raw")
@RequiredArgsConstructor
public class AmberRawController {

    private final AmberRawService amberRawService;

    @GetMapping("/page")
    public Result<Page<AmberRawVO>> page(@RequestParam(defaultValue = "1") int page,
                                        @RequestParam(defaultValue = "10") int size,
                                        AmberRawQueryDTO queryDTO) {
        return Result.success(amberRawService.page(page, size, queryDTO));
    }

    @GetMapping("/{id}")
    public Result<AmberRawVO> getById(@PathVariable Long id) {
        return Result.success(amberRawService.getDetail(id));
    }

    @GetMapping("/trace/{traceCode}")
    public Result<AmberRawVO> getByTraceCode(@PathVariable String traceCode) {
        return Result.success(amberRawService.getByTraceCode(traceCode));
    }

    @GetMapping("/weathering-warning")
    @RequireRole({1, 3, 4})
    public Result<List<AmberRawVO>> getWeatheringWarning() {
        return Result.success(amberRawService.getWeatheringWarning());
    }

    @PostMapping
    @RequireRole({1, 4})
    @OperateLog(module = "原石管理", operation = "新增原石")
    public Result<Void> add(@Valid @RequestBody AmberRawDTO dto) {
        amberRawService.add(dto);
        return Result.success();
    }

    @PutMapping
    @RequireRole({1, 4})
    @OperateLog(module = "原石管理", operation = "更新原石")
    public Result<Void> update(@Valid @RequestBody AmberRawDTO dto) {
        amberRawService.update(dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequireRole({4})
    @OperateLog(module = "原石管理", operation = "删除原石")
    public Result<Void> delete(@PathVariable Long id) {
        amberRawService.delete(id);
        return Result.success();
    }

}
