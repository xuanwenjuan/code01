package com.mushroom.traceability.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mushroom_category")
public class MushroomCategory extends BaseEntity {
    private Long parentId;

    @NotBlank(message = "类目名称不能为空")
    private String categoryName;

    @NotBlank(message = "类目类型不能为空")
    private String categoryType;

    private String categoryCode;

    private String icon;

    private Integer sortOrder;

    private Integer isWild;

    private Integer isForbidden;

    private Integer status;

    private String originAreas;

    @TableField(exist = false)
    private List<MushroomCategory> children;
}