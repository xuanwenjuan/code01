package com.camping.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.camping.annotation.Log;
import com.camping.annotation.RequiresRole;
import com.camping.common.Result;
import com.camping.dto.MaterialQueryDTO;
import com.camping.dto.OrderMaterialAllocateDTO;
import com.camping.dto.StockLossRegisterDTO;
import com.camping.entity.Material;
import com.camping.enums.RoleEnum;
import com.camping.service.MaterialService;
import com.camping.vo.MaterialVO;
import com.camping.vo.OrderCostDetailVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/material")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @GetMapping("/page")
    @Log(module = "物料管理", operation = "查询物料列表")
    public Result<Page<MaterialVO>> queryPage(@Valid MaterialQueryDTO dto) {
        Page<MaterialVO> page = materialService.queryPage(dto);
        return Result.success(page);
    }

    @GetMapping("/{id}")
    @Log(module = "物料管理", operation = "查询物料详情")
    public Result<Material> getById(@PathVariable Long id) {
        Material material = materialService.getById(id);
        return Result.success(material);
    }

    @PostMapping
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.WAREHOUSE})
    @Log(module = "物料管理", operation = "新增物料")
    public Result<Void> add(@Valid @RequestBody Material material) {
        materialService.save(material);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.WAREHOUSE})
    @Log(module = "物料管理", operation = "更新物料")
    public Result<Void> update(@Valid @RequestBody Material material) {
        materialService.updateById(material);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.WAREHOUSE})
    @Log(module = "物料管理", operation = "删除物料")
    public Result<Void> delete(@PathVariable Long id) {
        materialService.removeById(id);
        return Result.success();
    }

    @PostMapping("/stock-in")
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.WAREHOUSE})
    @Log(module = "物料管理", operation = "物料入库")
    public Result<Void> stockIn(@RequestBody Map<String, Object> params) {
        Long materialId = Long.valueOf(params.get("materialId").toString());
        BigDecimal quantity = new BigDecimal(params.get("quantity").toString());
        String batchCode = params.get("batchCode") != null ? params.get("batchCode").toString() : "";
        String remark = params.get("remark") != null ? params.get("remark").toString() : "";
        materialService.stockIn(materialId, quantity, batchCode, remark);
        return Result.success();
    }

    @PostMapping("/allocate")
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.WAREHOUSE})
    @Log(module = "物料管理", operation = "分配订单物料")
    public Result<Void> allocateOrderMaterials(@Valid @RequestBody OrderMaterialAllocateDTO dto) {
        materialService.allocateOrderMaterials(dto);
        return Result.success();
    }

    @PostMapping("/loss/register")
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.WAREHOUSE})
    @Log(module = "物料管理", operation = "损耗登记")
    public Result<Void> registerStockLoss(@Valid @RequestBody StockLossRegisterDTO dto) {
        materialService.registerStockLoss(dto);
        return Result.success();
    }

    @GetMapping("/cost/{orderId}")
    @Log(module = "物料管理", operation = "查询订单成本")
    public Result<OrderCostDetailVO> calculateOrderCost(@PathVariable Long orderId) {
        OrderCostDetailVO vo = materialService.calculateOrderCost(orderId);
        return Result.success(vo);
    }

    @PostMapping("/lock/release/{orderId}")
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.WAREHOUSE})
    @Log(module = "物料管理", operation = "释放库存锁定")
    public Result<Void> releaseStockLock(@PathVariable Long orderId) {
        materialService.releaseStockLock(orderId);
        return Result.success();
    }
}
