package com.sheetmetal.compressor.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("shell_category")
public class ShellCategory {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String categoryName;
    private String categoryCode;
    private Long parentId;
    private Integer level;
    private Integer sortOrder;
    private Integer priority;
    private Integer status;
    private String description;
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;
    @TableLogic
    private Integer deleted;

    @TableField(exist = false)
    private List<ShellCategory> children;
}
