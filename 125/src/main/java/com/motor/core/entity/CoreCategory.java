package com.motor.core.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("core_category")
public class CoreCategory extends BaseEntity {
    private Long parentId;
    private String categoryName;
    private String categoryCode;
    private String categoryType;
    private Integer sortOrder;
    private Integer status;

    @TableField(exist = false)
    private List<CoreCategory> children;
}
