package com.instrument.consignment.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.instrument.consignment.annotation.RequiresRole;
import com.instrument.consignment.common.Result;
import com.instrument.consignment.dto.InstrumentArchiveDTO;
import com.instrument.consignment.entity.InstrumentArchive;
import com.instrument.consignment.enums.UserRoleEnum;
import com.instrument.consignment.service.InstrumentArchiveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/archives")
@RequiredArgsConstructor
public class ArchiveController {

    private final InstrumentArchiveService archiveService;

    @PostMapping
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.WAREHOUSE})
    public Result<Void> addArchive(@Valid @RequestBody InstrumentArchiveDTO archiveDTO) {
        archiveService.addArchive(archiveDTO);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({UserRoleEnum.ADMIN, UserRoleEnum.WAREHOUSE})
    public Result<Void> updateArchive(@Valid @RequestBody InstrumentArchiveDTO archiveDTO) {
        archiveService.updateArchive(archiveDTO);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({UserRoleEnum.ADMIN})
    public Result<Void> deleteArchive(@PathVariable Long id) {
        archiveService.deleteArchive(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<InstrumentArchive> getArchiveById(@PathVariable Long id) {
        return Result.success(archiveService.getArchiveById(id));
    }

    @GetMapping("/trace/{traceNo}")
    public Result<InstrumentArchive> getArchiveByTraceNo(@PathVariable String traceNo) {
        return Result.success(archiveService.getArchiveByTraceNo(traceNo));
    }

    @GetMapping("/page")
    public Result<Page<InstrumentArchive>> getArchivePage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long categoryId) {
        return Result.success(archiveService.getArchivePage(page, size, status, categoryId));
    }

    @PutMapping("/{id}/status")
    public Result<Void> updateArchiveStatus(@PathVariable Long id, @RequestParam String status) {
        archiveService.updateArchiveStatus(id, status);
        return Result.success();
    }
}
