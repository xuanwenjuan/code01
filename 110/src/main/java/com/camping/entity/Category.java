package com.camping.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("category")
public class Category extends BaseEntity {

    @NotBlank(message = "类目名称不能为空")
    private String name;

    private Long parentId;

    private String icon;

    private Integer sort;

    private Integer status;

    private String remark;

    @TableField(exist = false)
    private List<Category> children;
}
