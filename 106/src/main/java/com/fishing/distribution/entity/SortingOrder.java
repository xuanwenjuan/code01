package com.fishing.distribution.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sorting_order")
public class SortingOrder extends BaseEntity {

    private String orderNo;

    private Long boatId;

    private String boatCode;

    private String boatName;

    private LocalDateTime arrivalTime;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private BigDecimal totalWeight;

    private Integer status;

    private Integer warningStatus;

    private LocalDateTime warningTime;

    private String remark;

    private Long createBy;

    @TableField(exist = false)
    private List<SortingOrderDetail> details;
}
