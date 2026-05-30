package com.gearbox.manage.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.gearbox.manage.annotation.RequiresRole;
import com.gearbox.manage.common.Result;
import com.gearbox.manage.dto.WorkProcessDTO;
import com.gearbox.manage.entity.WorkProcess;
import com.gearbox.manage.service.WorkProcessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workProcess")
@RequiredArgsConstructor
public class WorkProcessController {

    private final WorkProcessService workProcessService;

    @GetMapping("/page")
    public Result<Page<WorkProcess>> listPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String status) {
        return Result.success(workProcessService.listPage(pageNum, pageSize, status));
    }

    @GetMapping("/workOrder/{workOrderId}")
    public Result<List<WorkProcess>> getByWorkOrderId(@PathVariable Long workOrderId) {
        return Result.success(workProcessService.getByWorkOrderId(workOrderId));
    }

    @GetMapping("/{id}")
    public Result<WorkProcess> getById(@PathVariable Long id) {
        return Result.success(workProcessService.getById(id));
    }

    @PostMapping
    @RequiresRole({"ADMIN", "PROCESS_ENGINEER"})
    public Result<WorkProcess> create(@Valid @RequestBody WorkProcessDTO dto) {
        return Result.success(workProcessService.createProcess(dto));
    }

    @PutMapping("/{id}")
    @RequiresRole({"ADMIN", "PROCESS_ENGINEER"})
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody WorkProcessDTO dto) {
        return workProcessService.updateProcess(id, dto) ? Result.success() : Result.error("更新失败");
    }

    @PostMapping("/{id}/start")
    @RequiresRole({"ADMIN", "TEAM_LEADER"})
    public Result<Void> startProcess(@PathVariable Long id) {
        return workProcessService.startProcess(id) ? Result.success() : Result.error("开始工序失败");
    }

    @PostMapping("/{id}/complete")
    @RequiresRole({"ADMIN", "TEAM_LEADER"})
    public Result<Void> completeProcess(@PathVariable Long id, @RequestBody WorkProcessDTO dto) {
        return workProcessService.completeProcess(id, dto) ? Result.success() : Result.error("完成工序失败");
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    public Result<Void> delete(@PathVariable Long id) {
        return workProcessService.removeById(id) ? Result.success() : Result.error("删除失败");
    }
}
