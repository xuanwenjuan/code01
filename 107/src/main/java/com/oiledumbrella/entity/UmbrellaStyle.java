package com.oiledumbrella.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("umbrella_style")
public class UmbrellaStyle extends BaseEntity {
    private String styleName;
    private String styleCode;
    private Long categoryId;
    private BigDecimal basePrice;
    private String description;
    private String imageUrl;
    private Integer productionCycle;
    private Integer sortOrder;
    private Integer status;
    private Integer viewCount;
    private Integer orderCount;

    @TableField(exist = false)
    private String categoryName;
}
