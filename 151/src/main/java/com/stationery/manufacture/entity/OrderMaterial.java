package com.stationery.manufacture.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("order_material")
public class OrderMaterial {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;

    private Long materialId;

    private String materialCode;

    private String materialName;

    private String specification;

    private String unit;

    private BigDecimal plannedQuantity;

    private BigDecimal actualQuantity;

    private BigDecimal unitPrice;

    private BigDecimal totalPrice;

    private String batchNo;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
