package com.rotor.manufacture.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_order")
public class ProductionOrder extends BaseEntity {
    private String orderNo;
    private Long productId;
    private String productName;
    private Integer quantity;
    private Integer status;
    private Long processId;
    private String processName;
    private LocalDateTime planStartTime;
    private LocalDateTime planEndTime;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    private Long groupLeaderId;
    private String groupLeaderName;
    private String remark;
}