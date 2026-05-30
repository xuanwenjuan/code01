package com.gear.mfg.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("process_route")
public class ProcessRoute extends BaseEntity {

    private String routeCode;

    private String routeName;

    private Long productId;

    private String productCode;

    private String productName;

    private Integer version;

    private Integer status;

    private String auditor;

    private String remark;
}
