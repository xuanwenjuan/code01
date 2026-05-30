package com.snack.processing.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("snack_category")
public class SnackCategory extends BaseEntity {

    private String name;
    private String code;
    private Long parentId;
    private Integer level;
    private Integer sortOrder;
    private Integer priority;
    private Integer status;
    private String description;

    @TableField(exist = false)
    private List<SnackCategory> children;
}
