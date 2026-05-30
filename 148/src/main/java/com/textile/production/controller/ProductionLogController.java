package com.textile.production.controller;

import com.textile.production.common.Result;
import com.textile.production.entity.ProductionLog;
import com.textile.production.service.ProductionLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/production-log")
@RequiredArgsConstructor
public class ProductionLogController {

    private final ProductionLogService logService;

    @GetMapping("/order/{orderId}")
    public Result<List<ProductionLog>> getLogsByOrderId(@PathVariable Long orderId) {
        return Result.success(logService.getLogsByOrderId(orderId));
    }
}
