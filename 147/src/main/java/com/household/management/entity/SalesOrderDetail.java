package com.household.management.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("sales_order_detail")
@Schema(description = "销售订单明细实体")
public class SalesOrderDetail implements Serializable {

    @Schema(description = "主键ID")
    private Long id;

    @Schema(description = "订单ID")
    private Long orderId;

    @Schema(description = "产品ID")
    private Long productId;

    @Schema(description = "数量")
    private Integer quantity;

    @Schema(description = "单价")
    private BigDecimal unitPrice;

    @Schema(description = "总金额")
    private BigDecimal totalAmount;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;

    @Schema(description = "产品名称")
    private transient String productName;

    @Schema(description = "产品编码")
    private transient String productCode;

    @Schema(description = "规格型号")
    private transient String specification;

    @Schema(description = "单位")
    private transient String unit;
}
