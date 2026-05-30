package com.spindle.manage.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("order_material_detail")
public class OrderMaterialDetail extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;

    private Long materialId;

    private String materialName;

    private String batchNo;

    private BigDecimal quantity;

    private String unit;

    private BigDecimal unitPrice;

    private BigDecimal totalPrice;

    private LocalDateTime receiveTime;

    private Long receiverId;

    private String receiverName;

    private BigDecimal returnQuantity;

    private LocalDateTime returnTime;

    private String materialType;

    private String remark;

}
