package com.household.management.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.household.management.common.entity.BaseEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("finished_product_stock")
@Schema(description = "成品库存实体")
public class FinishedProductStock extends BaseEntity {

    @Schema(description = "产品ID")
    private Long productId;

    @Schema(description = "库存数量")
    private Integer quantity;

    @Schema(description = "仓库位置")
    private String warehouseLocation;

    @Schema(description = "预警库存")
    private Integer warnStock;

    @Schema(description = "状态：1-正常 2-库存预警")
    private Integer status;

    @Schema(description = "产品名称")
    private transient String productName;

    @Schema(description = "产品编码")
    private transient String productCode;

    @Schema(description = "规格型号")
    private transient String specification;

    @Schema(description = "单位")
    private transient String unit;
}
