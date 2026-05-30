package com.leathercraft.controller;

import com.leathercraft.annotation.RequiresRole;
import com.leathercraft.common.Result;
import com.leathercraft.entity.OperationLog;
import com.leathercraft.enums.RoleEnum;
import com.leathercraft.service.OperationLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/log")
@RequiredArgsConstructor
public class OperationLogController {

    private final OperationLogService operationLogService;

    @GetMapping
    @RequiresRole({RoleEnum.ADMIN})
    public Result<List<OperationLog>> list(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime,
            @RequestParam(required = false) Long userId) {
        return Result.success(operationLogService.list(startTime, endTime, userId));
    }
}
