package com.mushroom.traceability.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("area_quota")
public class AreaQuota extends BaseEntity {
    private Long areaId;
    private String areaCode;
    private String quotaPeriod;
    private BigDecimal totalQuota;
    private BigDecimal usedQuota;
    private BigDecimal lockedQuota;
    private Integer status;
    private LocalDateTime quotaDate;
}