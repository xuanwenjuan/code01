package com.bearing.production.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("bearing_category")
public class BearingCategory extends BaseEntity {
    private String categoryCode;
    private String categoryName;
    private Long parentId;
    private Integer level;
    private Integer sort;
    private Integer priority;
    private Integer status;
    private String specification;
    private String material;
    private String remark;

    @TableField(exist = false)
    private List<BearingCategory> children;
}
