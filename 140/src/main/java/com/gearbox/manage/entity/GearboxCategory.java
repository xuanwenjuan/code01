package com.gearbox.manage.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("gearbox_category")
public class GearboxCategory extends BaseEntity {
    private Long parentId;
    private String categoryName;
    private String categoryCode;
    private String categoryType;
    private String description;
    private Integer priority;
    private Integer status;

    @TableField(exist = false)
    private List<GearboxCategory> children;
}
