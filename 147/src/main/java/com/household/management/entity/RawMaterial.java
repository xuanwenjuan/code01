package com.household.management.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.household.management.common.entity.BaseEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("raw_material")
@Schema(description = "原材料实体")
public class RawMaterial extends BaseEntity {

    @Schema(description = "原料名称")
    private String materialName;

    @Schema(description = "原料编码")
    private String materialCode;

    @Schema(description = "原料类型：塑料颗粒、纯棉布料、纸质原料、日化助剂、外包装纸箱")
    private String materialType;

    @Schema(description = "原料材质：PE、PP、PVC、纯棉、涤纶、牛皮纸、铜版纸、食品级等")
    private String materialTexture;

    @Schema(description = "规格型号")
    private String specification;

    @Schema(description = "单位")
    private String unit;

    @Schema(description = "单价")
    private BigDecimal unitPrice;

    @Schema(description = "预警库存")
    private BigDecimal warnStock;

    @Schema(description = "是否易潮：0-否 1-是")
    private Integer isMoistureSensitive;

    @Schema(description = "防潮提醒天数")
    private Integer moistureWarningDays;

    @Schema(description = "状态：1-库存充足 2-库存预警 3-暂停采购")
    private Integer status;

    @Schema(description = "当前库存数量")
    private transient BigDecimal currentStock;
}
