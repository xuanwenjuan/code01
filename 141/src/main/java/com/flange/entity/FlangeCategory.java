package com.flange.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("flange_category")
public class FlangeCategory {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long parentId;

    private String categoryName;

    private String categoryCode;

    private String categoryType;

    private Integer priority;

    private Integer status;

    private String description;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;

    @TableField(exist = false)
    private List<FlangeCategory> children;
}
