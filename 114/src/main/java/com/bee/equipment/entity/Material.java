package com.bee.equipment.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material")
public class Material extends BaseEntity {

    private String batchNo;

    private String name;

    private Long categoryId;

    private String spec;

    private String origin;

    private String unit;

    private BigDecimal quantity;

    private BigDecimal warnQuantity;

    private BigDecimal price;

    private Integer isMoistureSensitive;

    private LocalDate expiryDate;

    private String status;
}
