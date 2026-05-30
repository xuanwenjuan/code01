package com.fishing.distribution.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.fishing.distribution.annotation.OperationLogger;
import com.fishing.distribution.common.Result;
import com.fishing.distribution.dto.FishingBoatDTO;
import com.fishing.distribution.dto.FishingBoatQueryDTO;
import com.fishing.distribution.service.FishingBoatService;
import com.fishing.distribution.vo.FishingBoatVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/fishing-boat")
@RequiredArgsConstructor
public class FishingBoatController {

    private final FishingBoatService fishingBoatService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    @OperationLogger(module = "渔船管理", type = "新增", desc = "新增渔船档案")
    public Result<Void> addBoat(@Valid @RequestBody FishingBoatDTO dto) {
        fishingBoatService.addBoat(dto);
        return Result.success("添加成功");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    @OperationLogger(module = "渔船管理", type = "修改", desc = "修改渔船档案")
    public Result<Void> updateBoat(@PathVariable Long id, @Valid @RequestBody FishingBoatDTO dto) {
        fishingBoatService.updateBoat(id, dto);
        return Result.success("更新成功");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    @OperationLogger(module = "渔船管理", type = "删除", desc = "删除渔船档案")
    public Result<Void> deleteBoat(@PathVariable Long id) {
        fishingBoatService.deleteBoat(id);
        return Result.success("删除成功");
    }

    @GetMapping("/{id}")
    public Result<FishingBoatVO> getBoatById(@PathVariable Long id) {
        return Result.success(fishingBoatService.getBoatById(id));
    }

    @GetMapping("/page")
    public Result<IPage<FishingBoatVO>> getBoatPage(FishingBoatQueryDTO queryDTO) {
        return Result.success(fishingBoatService.getBoatPage(queryDTO));
    }

    @GetMapping("/list")
    public Result<List<FishingBoatVO>> getBoatList(@RequestParam(required = false) Integer status) {
        return Result.success(fishingBoatService.getBoatList(status));
    }

    @GetMapping("/expiring-license")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public Result<List<FishingBoatVO>> getExpiringLicenseBoats(
            @RequestParam(defaultValue = "30") Integer days) {
        return Result.success(fishingBoatService.getExpiringLicenseBoats(days));
    }
}
