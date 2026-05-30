package com.hydraulic.piston.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_stock")
@Schema(description = "棒料原料库存实体")
public class MaterialStock extends BaseEntity {

    @Schema(description = "批次号")
    @TableField("batch_no")
    private String batchNo;

    @Schema(description = "原料类型")
    @TableField("material_type")
    private String materialType;

    @Schema(description = "原料名称")
    @TableField("material_name")
    private String materialName;

    @Schema(description = "钢材材质牌号")
    @TableField("steel_grade")
    private String steelGrade;

    @Schema(description = "规格型号")
    @TableField("specification")
    private String specification;

    @Schema(description = "数量")
    @TableField("quantity")
    private BigDecimal quantity;

    @Schema(description = "单位")
    @TableField("unit")
    private String unit;

    @Schema(description = "单价")
    @TableField("unit_price")
    private BigDecimal unitPrice;

    @Schema(description = "总价")
    @TableField("total_price")
    private BigDecimal totalPrice;

    @Schema(description = "库存状态 1-库存充足 2-库存预警 3-已锁定 4-已出库 5-停止采购")
    @TableField("stock_status")
    private Integer stockStatus;

    @Schema(description = "锁定工单ID")
    @TableField("locked_order_id")
    private Long lockedOrderId;

    @Schema(description = "供应商")
    @TableField("supplier")
    private String supplier;

    @Schema(description = "入库日期")
    @TableField("inbound_date")
    private LocalDate inboundDate;

    @Schema(description = "有效期至")
    @TableField("expiry_date")
    private LocalDate expiryDate;

    @Schema(description = "存放位置")
    @TableField("warehouse_location")
    private String warehouseLocation;

    @Schema(description = "备注")
    @TableField("remark")
    private String remark;
}
