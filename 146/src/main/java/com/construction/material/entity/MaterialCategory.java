package com.construction.material.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("material_category")
public class MaterialCategory {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String categoryName;

    private String categoryCode;

    private Long parentId;

    private String ancestors;

    private Integer level;

    private Integer sortOrder;

    private String unit;

    private String specification;

    private Integer priority;

    private Integer status;

    private String remark;

    @TableField(exist = false)
    private List<MaterialCategory> children;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableField(fill = FieldFill.INSERT)
    private Long createBy;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updateBy;

    @TableLogic
    private Integer deleted;
}
