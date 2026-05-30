package com.zongshi.brush.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("brush_category")
public class BrushCategory extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long parentId;

    private String categoryName;

    private String categoryCode;

    private Integer categoryType;

    private String brushType;

    private String craftType;

    private String suitableFor;

    private Integer sortOrder;

    private Integer status;
}
