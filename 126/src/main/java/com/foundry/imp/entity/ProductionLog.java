package com.foundry.impeller.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_log")
public class ProductionLog extends BaseEntity {

    private Long workOrderId;

    private String operationType;

    private String operationContent;

    private Long operatorId;

    private String operatorName;

    private String operatorRole;
}
