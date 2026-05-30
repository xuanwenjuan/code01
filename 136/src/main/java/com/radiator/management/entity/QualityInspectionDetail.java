package com.radiator.management.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("quality_inspection_detail")
public class QualityInspectionDetail {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long inspectionId;

    private String inspectionItem;

    private String standardValue;

    private String actualValue;

    private String inspectionResult;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer isDeleted;
}
