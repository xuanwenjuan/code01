package com.amber.customize.controller;

import com.amber.customize.annotation.OperateLog;
import com.amber.customize.annotation.RequireRole;
import com.amber.customize.common.Result;
import com.amber.customize.dto.ConfirmThemeDTO;
import com.amber.customize.dto.CustomOrderCreateDTO;
import com.amber.customize.dto.CustomOrderQueryDTO;
import com.amber.customize.dto.UpdateCostDTO;
import com.amber.customize.service.CustomOrderService;
import com.amber.customize.vo.CustomOrderVO;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/custom-order")
@RequiredArgsConstructor
public class CustomOrderController {

    private final CustomOrderService customOrderService;

    @GetMapping("/page")
    public Result<Page<CustomOrderVO>> page(@RequestParam(defaultValue = "1") int page,
                                          @RequestParam(defaultValue = "10") int size,
                                          CustomOrderQueryDTO queryDTO) {
        return Result.success(customOrderService.page(page, size, queryDTO));
    }

    @GetMapping("/{id}")
    public Result<CustomOrderVO> getById(@PathVariable Long id) {
        return Result.success(customOrderService.getDetail(id));
    }

    @PostMapping
    @RequireRole({3, 4})
    @OperateLog(module = "工单管理", operation = "创建工单")
    public Result<Void> create(@Valid @RequestBody CustomOrderCreateDTO dto) {
        customOrderService.create(dto);
        return Result.success();
    }

    @PostMapping("/confirm-theme/{id}")
    @RequireRole({3, 4})
    @OperateLog(module = "工单管理", operation = "确认题材")
    public Result<Void> confirmTheme(@PathVariable Long id, @Valid @RequestBody ConfirmThemeDTO dto) {
        customOrderService.confirmTheme(id, dto);
        return Result.success();
    }

    @PostMapping("/next-status/{id}")
    @RequireRole({2, 4})
    @OperateLog(module = "工单管理", operation = "工单状态流转")
    public Result<Void> nextStatus(@PathVariable Long id) {
        customOrderService.nextStatus(id);
        return Result.success();
    }

    @PostMapping("/assign-carver/{id}")
    @RequireRole({4})
    @OperateLog(module = "工单管理", operation = "指派玉雕师")
    public Result<Void> assignCarver(@PathVariable Long id, @RequestBody Map<String, Long> params) {
        Long carverId = params.get("carverId");
        if (carverId == null) {
            return Result.error("玉雕师ID不能为空");
        }
        customOrderService.assignCarver(id, carverId);
        return Result.success();
    }

    @PostMapping("/update-costs/{id}")
    @RequireRole({4})
    @OperateLog(module = "工单管理", operation = "更新成本")
    public Result<Void> updateCosts(@PathVariable Long id, @RequestBody UpdateCostDTO dto) {
        customOrderService.updateCosts(id, dto);
        return Result.success();
    }

    @PostMapping("/cancel/{id}")
    @RequireRole({3, 4})
    @OperateLog(module = "工单管理", operation = "取消工单")
    public Result<Void> cancel(@PathVariable Long id) {
        customOrderService.cancel(id);
        return Result.success();
    }

}
