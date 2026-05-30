package com.household.management.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.household.management.common.entity.BaseEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("raw_material_stock")
@Schema(description = "原料库存实体")
public class RawMaterialStock extends BaseEntity {

    @Schema(description = "原料ID")
    private Long materialId;

    @Schema(description = "生产批次号")
    private String batchNo;

    @Schema(description = "库存数量")
    private BigDecimal quantity;

    @Schema(description = "已锁定数量（生产工单占用）")
    private BigDecimal lockedQuantity;

    @Schema(description = "可用数量 = 库存数量 - 已锁定数量")
    private transient BigDecimal availableQuantity;

    @Schema(description = "入库单价")
    private BigDecimal unitPrice;

    @Schema(description = "总金额")
    private BigDecimal totalAmount;

    @Schema(description = "生产日期")
    private LocalDate productionDate;

    @Schema(description = "到期日期")
    private LocalDate expirationDate;

    @Schema(description = "仓库位置")
    private String warehouseLocation;

    @Schema(description = "状态：1-正常 0-已用完")
    private Integer status;

    @Schema(description = "原料名称")
    private transient String materialName;

    @Schema(description = "原料编码")
    private transient String materialCode;

    @Schema(description = "原料类型")
    private transient String materialType;

    @Schema(description = "是否易潮")
    private transient Integer isMoistureSensitive;

    @Schema(description = "距离到期天数")
    private transient Long daysToExpire;
}
