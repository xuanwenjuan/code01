package com.amber.customize.controller;

import com.amber.customize.annotation.OperateLog;
import com.amber.customize.annotation.RequireRole;
import com.amber.customize.common.Result;
import com.amber.customize.dto.ProfitReportDTO;
import com.amber.customize.service.ProfitRecordService;
import com.amber.customize.vo.ProfitRecordVO;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profit")
@RequiredArgsConstructor
public class ProfitRecordController {

    private final ProfitRecordService profitRecordService;

    @GetMapping("/page")
    @RequireRole({4})
    public Result<Page<ProfitRecordVO>> page(@RequestParam(defaultValue = "1") int page,
                                           @RequestParam(defaultValue = "10") int size,
                                           @RequestParam(required = false) Long categoryId) {
        return Result.success(profitRecordService.page(page, size, categoryId));
    }

    @GetMapping("/{id}")
    @RequireRole({4})
    public Result<ProfitRecordVO> getById(@PathVariable Long id) {
        return Result.success(profitRecordService.getDetail(id));
    }

    @GetMapping("/category-report")
    @RequireRole({4})
    public Result<List<ProfitReportDTO>> getCategoryReport() {
        return Result.success(profitRecordService.getCategoryReport());
    }

    @PostMapping("/generate")
    @RequireRole({4})
    @OperateLog(module = "收益台账", operation = "生成收益记录")
    public Result<Void> generateFromOrder(@RequestBody Map<String, Long> params) {
        Long orderId = params.get("orderId");
        if (orderId == null) {
            return Result.error("订单ID不能为空");
        }
        profitRecordService.generateFromOrder(orderId);
        return Result.success();
    }

}
