package com.zongshi.brush.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zongshi.brush.annotation.OperationLog;
import com.zongshi.brush.annotation.RequiresRoles;
import com.zongshi.brush.common.Result;
import com.zongshi.brush.dto.CostRevenueLedgerDTO;
import com.zongshi.brush.entity.CostRevenueLedger;
import com.zongshi.brush.service.CostRevenueLedgerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/ledger")
@RequiredArgsConstructor
public class CostRevenueLedgerController {

    private final CostRevenueLedgerService costRevenueLedgerService;

    @PostMapping
    @OperationLog(module = "制笔成本营收台账", type = "新增", description = "新增台账")
    @RequiresRoles({"ADMIN"})
    public Result<Long> createLedger(@Valid @RequestBody CostRevenueLedgerDTO dto) {
        Long id = costRevenueLedgerService.createLedger(dto);
        return Result.success("新增台账成功", id);
    }

    @PostMapping("/generate-from-order/{orderId}")
    @OperationLog(module = "制笔成本营收台账", type = "生成", description = "从工单生成台账")
    @RequiresRoles({"ADMIN"})
    public Result<Long> generateLedgerFromOrder(@PathVariable Long orderId) {
        Long id = costRevenueLedgerService.generateLedgerFromOrder(orderId);
        return Result.success("生成台账成功", id);
    }

    @PutMapping
    @OperationLog(module = "制笔成本营收台账", type = "修改", description = "修改台账")
    @RequiresRoles({"ADMIN"})
    public Result<Void> updateLedger(@Valid @RequestBody CostRevenueLedgerDTO dto) {
        costRevenueLedgerService.updateLedger(dto);
        return Result.success("修改台账成功");
    }

    @DeleteMapping("/{id}")
    @OperationLog(module = "制笔成本营收台账", type = "删除", description = "删除台账")
    @RequiresRoles({"ADMIN"})
    public Result<Void> deleteLedger(@PathVariable Long id) {
        costRevenueLedgerService.deleteLedger(id);
        return Result.success("删除台账成功");
    }

    @GetMapping("/{id}")
    @OperationLog(module = "制笔成本营收台账", type = "查询", description = "查询台账详情")
    public Result<CostRevenueLedger> getLedgerById(@PathVariable Long id) {
        CostRevenueLedger ledger = costRevenueLedgerService.getLedgerById(id);
        return Result.success(ledger);
    }

    @GetMapping("/page")
    @OperationLog(module = "制笔成本营收台账", type = "查询", description = "分页查询台账列表")
    public Result<Page<CostRevenueLedger>> getLedgerPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String ledgerNo,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {

        Page<CostRevenueLedger> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<CostRevenueLedger> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CostRevenueLedger::getIsDeleted, 0);
        if (StringUtils.hasText(ledgerNo)) {
            wrapper.like(CostRevenueLedger::getLedgerNo, ledgerNo);
        }
        if (categoryId != null) {
            wrapper.eq(CostRevenueLedger::getCategoryId, categoryId);
        }
        if (startDate != null) {
            wrapper.ge(CostRevenueLedger::getLedgerDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(CostRevenueLedger::getLedgerDate, endDate);
        }
        wrapper.orderByDesc(CostRevenueLedger::getCreateTime);

        Page<CostRevenueLedger> result = costRevenueLedgerService.page(page, wrapper);
        return Result.success(result);
    }

    @GetMapping("/statistics")
    @OperationLog(module = "制笔成本营收台账", type = "查询", description = "查询经营统计报表")
    public Result<Map<String, Object>> getStatistics(
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {

        if (startDate == null) {
            startDate = LocalDate.now().withDayOfMonth(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        Map<String, Object> statistics = costRevenueLedgerService.getStatistics(startDate, endDate);
        return Result.success(statistics);
    }
}
