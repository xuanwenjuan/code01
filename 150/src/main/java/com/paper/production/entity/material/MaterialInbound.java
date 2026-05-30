package com.paper.production.entity.material;

import com.baomidou.mybatisplus.annotation.TableName;
import com.paper.production.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_inbound")
public class MaterialInbound extends BaseEntity {

    private String inboundNo;
    private Long materialId;
    private String materialCode;
    private String materialName;
    private String batchNo;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String supplier;
    private LocalDateTime inboundTime;
    private String storageLocation;
    private String operator;
    private Integer status;
    private String remark;
}
