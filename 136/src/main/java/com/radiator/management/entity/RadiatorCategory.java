package com.radiator.management.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("radiator_category")
public class RadiatorCategory {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long parentId;

    private String categoryName;

    private String categoryCode;

    private String categoryType;

    private Integer priority;

    private Integer status;

    @TableField(exist = false)
    private List<RadiatorCategory> children;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer isDeleted;
}