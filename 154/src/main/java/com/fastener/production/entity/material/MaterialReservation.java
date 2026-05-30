package com.fastener.production.entity.material;

import com.baomidou.mybatisplus.annotation.TableName;
import com.fastener.production.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_reservation")
public class MaterialReservation extends BaseEntity {

    private String reservationNo;

    private Long workOrderId;

    private String orderNo;

    private Long materialId;

    private String materialName;

    private Long batchId;

    private String batchNo;

    private BigDecimal reservedQuantity;

    private BigDecimal actualUsedQuantity;

    private Integer status;

    private LocalDateTime expireTime;
}
