package com.liquor.brewing.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.liquor.brewing.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_reservation")
public class MaterialReservation extends BaseEntity {

    private String reservationNo;

    private Long materialId;

    private Long batchId;

    private Long workOrderId;

    private BigDecimal quantity;

    private Integer status;

    private LocalDateTime expireTime;

    private String remark;
}
