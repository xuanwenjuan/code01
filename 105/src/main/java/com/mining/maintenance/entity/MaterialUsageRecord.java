package com.mining.maintenance.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_usage_record")
public class MaterialUsageRecord extends BaseEntity {

    private String recordNo;

    private Long orderId;

    private String orderNo;

    private Long materialId;

    private String materialCode;

    private String materialName;

    private String specification;

    private String unit;

    private BigDecimal unitPrice;

    private Integer quantity;

    private BigDecimal totalAmount;

    private String miningArea;

    private Long equipmentId;

    private String equipmentCode;

    private Long receiverId;

    private String receiverName;

    private LocalDateTime receiveTime;

    private String usagePurpose;

    private String status;

    private Long verifierId;

    private String verifierName;

    private LocalDateTime verifyTime;

    private String remarks;
}