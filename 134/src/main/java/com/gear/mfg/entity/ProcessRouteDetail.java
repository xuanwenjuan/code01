package com.gear.mfg.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("process_route_detail")
public class ProcessRouteDetail extends BaseEntity {

    private Long routeId;

    private String routeCode;

    private Integer processNo;

    private String processName;

    private Long workstationId;

    private String workstationName;

    private Long equipmentId;

    private String equipmentName;

    private BigDecimal standardHours;

    private BigDecimal standardPrice;

    private Integer sort;

    private String remark;
}
