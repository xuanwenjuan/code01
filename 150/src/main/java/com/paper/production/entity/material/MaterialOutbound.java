package com.paper.production.entity.material;

import com.baomidou.mybatisplus.annotation.TableName;
import com.paper.production.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_outbound")
public class MaterialOutbound extends BaseEntity {

    private String outboundNo;
    private Long materialId;
    private String materialCode;
    private String materialName;
    private String batchNo;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String workOrderNo;
    private String receiver;
    private LocalDateTime outboundTime;
    private String operator;
    private Integer status;
    private String remark;
}
