package com.fitness.manufacture.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fitness.manufacture.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_outbound")
public class MaterialOutbound extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String outboundNo;

    private Long workOrderId;

    private Long materialId;

    private String materialName;

    private String batchNo;

    private BigDecimal quantity;

    private BigDecimal unitPrice;

    private BigDecimal totalAmount;

    private String outboundType;

    private String receiver;

    private Integer status;

    private Long auditBy;

    private LocalDateTime auditTime;

    private String remark;
}
