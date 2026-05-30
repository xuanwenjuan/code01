package com.spindle.manage.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("spindle_category")
public class SpindleCategory extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    @NotBlank(message = "分类编码不能为空")
    private String categoryCode;

    @NotBlank(message = "分类名称不能为空")
    private String categoryName;

    private Long parentId;

    private Integer level;

    private Integer sort;

    private Integer status;

    private String description;

}
