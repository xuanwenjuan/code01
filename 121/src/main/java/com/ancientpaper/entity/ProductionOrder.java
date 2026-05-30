package com.ancientpaper.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_order")
public class ProductionOrder extends BaseEntity {
    private String orderNo;
    private Long categoryId;
    private BigDecimal targetQuantity;
    private BigDecimal actualQuantity;
    private Integer status;
    private LocalDateTime soakStartTime;
    private LocalDateTime soakEndTime;
    private LocalDateTime pulpStartTime;
    private LocalDateTime pulpEndTime;
    private LocalDateTime paperStartTime;
    private LocalDateTime paperEndTime;
    private LocalDateTime dryStartTime;
    private LocalDateTime dryEndTime;
    private LocalDateTime calenderStartTime;
    private LocalDateTime calenderEndTime;
    private LocalDateTime cutStartTime;
    private LocalDateTime cutEndTime;
    private LocalDateTime inWarehouseTime;
    private Long craftsmanId;
    private String remarks;
}