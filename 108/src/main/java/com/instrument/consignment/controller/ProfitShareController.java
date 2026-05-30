package com.instrument.consignment.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.instrument.consignment.annotation.RequiresRole;
import com.instrument.consignment.common.Result;
import com.instrument.consignment.dto.ProfitShareDTO;
import com.instrument.consignment.entity.ProfitShare;
import com.instrument.consignment.enums.UserRoleEnum;
import com.instrument.consignment.service.ProfitShareService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profit-shares")
@RequiredArgsConstructor
public class ProfitShareController {

    private final ProfitShareService profitShareService;

    @PostMapping
    @RequiresRole({UserRoleEnum.ADMIN})
    public Result<Void> createProfitShare(@Valid @RequestBody ProfitShareDTO shareDTO) {
        profitShareService.createProfitShare(shareDTO);
        return Result.success();
    }

    @PutMapping("/{id}/settle")
    @RequiresRole({UserRoleEnum.ADMIN})
    public Result<Void> settleProfitShare(@PathVariable Long id) {
        profitShareService.settleProfitShare(id);
        return Result.success();
    }

    @GetMapping("/page")
    public Result<Page<ProfitShare>> getProfitSharePage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String receiveChannel) {
        return Result.success(profitShareService.getProfitSharePage(page, size, status, categoryId, receiveChannel));
    }

    @GetMapping("/{id}")
    public Result<ProfitShare> getProfitShareDetail(@PathVariable Long id) {
        return Result.success(profitShareService.getProfitShareDetail(id));
    }
}
