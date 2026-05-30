package com.spindle.manage.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_inventory")
public class MaterialInventory extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String batchNo;

    @NotBlank(message = "物料名称不能为空")
    private String materialName;

    @NotBlank(message = "物料类型不能为空")
    private String materialType;

    private String specification;

    @NotNull(message = "库存数量不能为空")
    private BigDecimal quantity;

    private String unit;

    private BigDecimal unitPrice;

    private BigDecimal totalValue;

    private Integer inventoryStatus;

    private LocalDateTime constantTempExpireTime;

    private String supplier;

    private String warehouseLocation;

    private java.math.BigDecimal minimumStock;

    private String remark;

}
