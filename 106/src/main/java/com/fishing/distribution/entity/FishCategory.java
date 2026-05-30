package com.fishing.distribution.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fish_category")
public class FishCategory extends BaseEntity {

    private Long parentId;

    private String categoryCode;

    private String categoryName;

    private String categoryType;

    private String icon;

    private Integer sortOrder;

    private Integer status;

    @TableField(exist = false)
    private List<FishCategory> children;
}
