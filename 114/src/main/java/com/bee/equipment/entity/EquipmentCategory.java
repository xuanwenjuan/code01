package com.bee.equipment.entity;

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

    private String name;

    private String code;

    private Integer sortOrder;

    private Integer status;

    @TableField(exist = false)
    private List<EquipmentCategory> children;
}
