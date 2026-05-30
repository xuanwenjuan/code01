package com.mining.maintenance.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("equipment_category")
public class EquipmentCategory extends BaseEntity {

    private Long parentId;

    private String categoryName;

    private String categoryCode;

    private String categoryType;

    private Integer sortOrder;

    private Integer status;

    private String miningArea;

    private String description;

    @TableField(exist = false)
    private List<EquipmentCategory> children;
}