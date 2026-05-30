package com.camping.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.camping.annotation.Log;
import com.camping.common.Result;
import com.camping.entity.Settlement;
import com.camping.service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/settlement")
@RequiredArgsConstructor
public class SettlementController {

    private final SettlementService settlementService;

    @GetMapping("/page")
    @Log(module = "结算管理", operation = "查询结算列表")
    public Result<Page<Settlement>> page(@RequestParam(defaultValue = "1") Integer pageNum,
                                         @RequestParam(defaultValue = "10") Integer pageSize,
                                         @RequestParam(required = false) Long leaderId,
                                         @RequestParam(required = false) String month) {
        Page<Settlement> page = settlementService.page(pageNum, pageSize, leaderId, month);
        return Result.success(page);
    }

    @GetMapping("/summary")
    @Log(module = "结算管理", operation = "查询结算汇总")
    public Result<Map<String, Object>> getSettlementSummary(@RequestParam(required = false) String month) {
        Map<String, Object> summary = settlementService.getSettlementSummary(month);
        return Result.success(summary);
    }

    @PostMapping("/generate")
    @Log(module = "结算管理", operation = "生成月度结算")
    public Result<Void> generateMonthlySettlement(@RequestParam String month) {
        settlementService.generateMonthlySettlement(month);
        return Result.success();
    }

    @GetMapping("/order-detail/{orderId}")
    @Log(module = "结算管理", operation = "查询订单结算明细")
    public Result<Map<String, Object>> getOrderDetailForSettlement(@PathVariable Long orderId) {
        Map<String, Object> detail = settlementService.getOrderDetailForSettlement(orderId);
        return Result.success(detail);
    }
}
