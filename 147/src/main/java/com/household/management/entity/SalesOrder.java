package com.household.management.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.household.management.common.entity.BaseEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sales_order")
@Schema(description = "销售订单实体")
public class SalesOrder extends BaseEntity {

    @Schema(description = "订单号")
    private String orderNo;

    @Schema(description = "客户ID")
    private Long customerId;

    @Schema(description = "订单总金额")
    private BigDecimal totalAmount;

    @Schema(description = "订单优先级")
    private Integer priority;

    @Schema(description = "状态：1-待确认 2-生产中 3-待发货 4-已发货 5-已完成 6-已取消")
    private Integer status;

    @Schema(description = "交货日期")
    private LocalDate deliveryDate;

    @Schema(description = "送货地址")
    private String deliveryAddress;

    @Schema(description = "备注")
    private String remark;

    @Schema(description = "客户名称")
    private transient String customerName;

    @Schema(description = "客户编码")
    private transient String customerCode;

    @Schema(description = "订单明细")
    private transient List<SalesOrderDetail> details;
}
