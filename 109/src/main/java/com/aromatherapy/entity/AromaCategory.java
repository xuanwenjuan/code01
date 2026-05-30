package com.aromatherapy.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("aroma_category")
public class AromaCategory extends BaseEntity {

    private Long parentId;

    private String categoryName;

    private String categoryCode;

    private String description;

    private Integer sort;

    private Integer supplySort;

    private Integer status;

    private Integer level;

    @TableField(exist = false)
    private List<AromaCategory> children;
}
