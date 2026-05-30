package com.household.management.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.household.management.common.entity.BaseEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("raw_material_inbound")
@Schema(description = "原料入库单实体")
public class RawMaterialInbound extends BaseEntity {

    @Schema(description = "入库单号")
    private String inboundNo;

    @Schema(description = "原料ID")
    private Long materialId;

    @Schema(description = "供应商名称")
    private String supplierName;

    @Schema(description = "入库数量")
    private BigDecimal quantity;

    @Schema(description = "单价")
    private BigDecimal unitPrice;

    @Schema(description = "总金额")
    private BigDecimal totalAmount;

    @Schema(description = "批次号")
    private String batchNo;

    @Schema(description = "生产日期")
    private LocalDate productionDate;

    @Schema(description = "到期日期")
    private LocalDate expirationDate;

    @Schema(description = "仓库位置")
    private String warehouseLocation;

    @Schema(description = "状态：1-待审核 2-已入库 3-已驳回")
    private Integer status;

    @Schema(description = "审核人ID")
    private Long auditorId;

    @Schema(description = "审核时间")
    private LocalDateTime auditTime;

    @Schema(description = "备注")
    private String remark;

    @Schema(description = "原料名称")
    private transient String materialName;

    @Schema(description = "原料编码")
    private transient String materialCode;

    @Schema(description = "原料类型")
    private transient String materialType;

    @Schema(description = "审核人姓名")
    private transient String auditorName;
}
