package com.heritage.dye.po;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("dye_category")
public class DyeCategoryPO extends BasePO {
    private String categoryCode;
    private String categoryName;
    private Long parentId;
    private Integer categoryLevel;
    private Integer categoryType;
    private String formula;
    private String description;
    private BigDecimal sortOrder;
    private Integer status;
}
