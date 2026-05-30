package com.paper.production.controller.quality;

import com.paper.production.annotation.OperateLog;
import com.paper.production.annotation.RequiresRoles;
import com.paper.production.common.PageQuery;
import com.paper.production.common.PageResult;
import com.paper.production.common.Result;
import com.paper.production.dto.quality.DefectiveProductDTO;
import com.paper.production.entity.quality.DefectiveProduct;
import com.paper.production.enums.RoleEnum;
import com.paper.production.service.quality.DefectiveProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Tag(name = "次品处理管理")
@RestController
@RequestMapping("/quality/defective")
public class DefectiveProductController {

    @Resource
    private DefectiveProductService defectiveProductService;

    @Operation(summary = "登记次品")
    @PostMapping
    @RequiresRoles({RoleEnum.QUALITY, RoleEnum.PRODUCTION, RoleEnum.ADMIN})
    @OperateLog(module = "次品处理", operation = "登记次品", description = "登记生产过程中的次品")
    public Result<Void> save(@Valid @RequestBody DefectiveProductDTO dto) {
        defectiveProductService.saveDefective(dto);
        return Result.success();
    }

    @Operation(summary = "修改次品记录")
    @PutMapping
    @RequiresRoles({RoleEnum.QUALITY, RoleEnum.ADMIN})
    @OperateLog(module = "次品处理", operation = "修改次品记录", description = "修改次品处理记录")
    public Result<Void> update(@Valid @RequestBody DefectiveProductDTO dto) {
        defectiveProductService.updateDefective(dto);
        return Result.success();
    }

    @Operation(summary = "删除次品记录")
    @DeleteMapping("/{id}")
    @RequiresRoles({RoleEnum.QUALITY, RoleEnum.ADMIN})
    @OperateLog(module = "次品处理", operation = "删除次品记录", description = "删除次品处理记录")
    public Result<Void> delete(@PathVariable Long id) {
        defectiveProductService.deleteDefective(id);
        return Result.success();
    }

    @Operation(summary = "分页查询次品记录")
    @PostMapping("/page")
    public Result<PageResult<DefectiveProduct>> page(@RequestBody PageQuery query) {
        return Result.success(defectiveProductService.queryPage(query));
    }

    @Operation(summary = "获取次品详情")
    @GetMapping("/{id}")
    public Result<DefectiveProduct> getById(@PathVariable Long id) {
        return Result.success(defectiveProductService.getById(id));
    }

    @Operation(summary = "获取工单次品记录")
    @GetMapping("/work-order/{workOrderId}")
    public Result<List<DefectiveProduct>> getByWorkOrderId(@PathVariable Long workOrderId) {
        return Result.success(defectiveProductService.getByWorkOrderId(workOrderId));
    }

    @Operation(summary = "获取次品统计数据")
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getDefectiveStatistics(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(defectiveProductService.getDefectiveStatistics(startDate, endDate));
    }

    @Operation(summary = "获取工单各工序不良率")
    @GetMapping("/process-rate/{workOrderId}")
    public Result<Map<String, Object>> getProcessDefectiveRate(@PathVariable Long workOrderId) {
        return Result.success(defectiveProductService.getProcessDefectiveRate(workOrderId));
    }
}
