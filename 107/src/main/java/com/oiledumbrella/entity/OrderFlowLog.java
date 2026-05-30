package com.oiledumbrella.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("order_flow_log")
public class OrderFlowLog extends BaseEntity {
    private Long orderId;
    private String previousStatus;
    private String currentStatus;
    private Long operatorId;
    private String operatorName;
    private String remark;
}
