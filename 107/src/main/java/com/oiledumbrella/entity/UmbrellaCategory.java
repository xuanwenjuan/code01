package com.oiledumbrella.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("umbrella_category")
public class UmbrellaCategory extends BaseEntity {
    private String categoryName;
    private String categoryCode;
    private Long parentId;
    private Integer level;
    private Integer sortOrder;
    private String description;
    private Integer status;
}
