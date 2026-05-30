package com.sheetmetal.compressor.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("order_material_detail")
public class OrderMaterialDetail {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String detailNo;
    private Long orderId;
    private String orderNo;
    private Long materialId;
    private String materialName;
    private String materialCode;
    private String batchNo;
    private Integer materialType;
    private String spec;
    private BigDecimal receiveQuantity;
    private BigDecimal actualUsage;
    private BigDecimal returnQuantity;
    private BigDecimal lossQuantity;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal totalAmount;
    private Long receiverId;
    private String receiverName;
    private Integer status;
    private String remark;
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;
}
