package com.household.management.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.household.management.common.entity.BaseEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("finished_product_inbound")
@Schema(description = "成品入库单实体")
public class FinishedProductInbound extends BaseEntity {

    @Schema(description = "入库单号")
    private String inboundNo;

    @Schema(description = "关联工单ID")
    private Long workOrderId;

    @Schema(description = "产品ID")
    private Long productId;

    @Schema(description = "入库数量")
    private Integer quantity;

    @Schema(description = "合格数量")
    private Integer qualifiedQuantity;

    @Schema(description = "次品数量")
    private Integer defectiveQuantity;

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

    @Schema(description = "产品名称")
    private transient String productName;

    @Schema(description = "产品编码")
    private transient String productCode;

    @Schema(description = "工单号")
    private transient String workOrderNo;

    @Schema(description = "审核人姓名")
    private transient String auditorName;
}
