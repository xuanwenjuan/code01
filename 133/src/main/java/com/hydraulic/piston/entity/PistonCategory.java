package com.hydraulic.piston.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("piston_category")
@Schema(description = "活塞产品分类实体")
public class PistonCategory extends BaseEntity {

    @Schema(description = "分类名称")
    @TableField("category_name")
    private String categoryName;

    @Schema(description = "分类编码")
    @TableField("category_code")
    private String categoryCode;

    @Schema(description = "父分类ID")
    @TableField("parent_id")
    private Long parentId;

    @Schema(description = "层级")
    @TableField("level")
    private Integer level;

    @Schema(description = "排序")
    @TableField("sort")
    private Integer sort;

    @Schema(description = "排产优先级")
    @TableField("priority")
    private Integer priority;

    @Schema(description = "状态 0-下线 1-启用")
    @TableField("status")
    private Integer status;

    @Schema(description = "描述")
    @TableField("description")
    private String description;
}
