package com.watchrepair.admin.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("watch_category")
public class WatchCategory extends BaseEntity {

    private String categoryName;

    private Long parentId;

    private Integer level;

    private Integer sort;

    private Integer status;

    private String categoryCode;

    private String description;

    @TableField(exist = false)
    private List<WatchCategory> children;
}