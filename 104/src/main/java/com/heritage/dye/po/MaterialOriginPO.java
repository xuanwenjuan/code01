package com.heritage.dye.po;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_origin")
public class MaterialOriginPO extends BasePO {
    private String originCode;
    private String originName;
    private String region;
    private String harvestSeason;
    private BigDecimal extractContent;
    private BigDecimal annualOutput;
    private BigDecimal currentStock;
    private BigDecimal lockedStock;
    private BigDecimal warningThreshold;
    private Integer status;
    private String remark;
}
