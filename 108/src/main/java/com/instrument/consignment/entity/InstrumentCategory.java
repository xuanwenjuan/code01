package com.instrument.consignment.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("instrument_category")
public class InstrumentCategory extends BaseEntity {

    private Long parentId;

    private String categoryName;

    private String categoryCode;

    private String categoryType;

    private Integer sortOrder;

    private Integer status;

    private String description;

    @TableField(exist = false)
    private List<InstrumentCategory> children;
}
