package com.gear.mfg.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("gear_category")
public class GearCategory extends BaseEntity {

    private String categoryName;

    private String categoryCode;

    private Long parentId;

    private Integer level;

    private Integer sort;

    private Integer priority;

    private Integer status;

    private String description;
}