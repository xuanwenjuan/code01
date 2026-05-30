package com.household.management.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.household.management.common.entity.BaseEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sales_outbound")
@Schema(description = "销售出库单实体")
public class SalesOutbound extends BaseEntity {

    @Schema(description = "出库单号")
    private String outboundNo;

    @Schema(description = "关联订单ID")
    private Long orderId;

    @Schema(description = "客户ID")
    private Long customerId;

    @Schema(description = "总金额")
    private BigDecimal totalAmount;

    @Schema(description = "状态：1-待审核 2-已出库 3-已驳回")
    private Integer status;

    @Schema(description = "审核人ID")
    private Long auditorId;

    @Schema(description = "审核时间")
    private LocalDateTime auditTime;

    @Schema(description = "送货人")
    private String deliveryPerson;

    @Schema(description = "备注")
    private String remark;

    @Schema(description = "客户名称")
    private transient String customerName;

    @Schema(description = "订单号")
    private transient String orderNo;

    @Schema(description = "审核人姓名")
    private transient String auditorName;

    @Schema(description = "出库明细")
    private transient List<SalesOutboundDetail> details;
}
