package com.aluminum.extrusion.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("aluminum_stock")
public class AluminumStock extends BaseEntity {

    private String batchNo;

    @NotNull(message = "原料类型不能为空")
    @Min(value = 1, message = "原料类型无效")
    @Max(value = 4, message = "原料类型无效")
    private Integer materialType;

    @NotBlank(message = "合金牌号不能为空")
    @Size(max = 50, message = "合金牌号长度不能超过50个字符")
    private String alloyGrade;

    @NotBlank(message = "规格型号不能为空")
    @Size(max = 100, message = "规格型号长度不能超过100个字符")
    private String specification;

    @NotNull(message = "库存数量不能为空")
    @DecimalMin(value = "0", message = "库存数量不能小于0")
    @DecimalMax(value = "999999.99", message = "库存数量超出范围")
    private BigDecimal quantity;

    @DecimalMin(value = "0", message = "锁定数量不能小于0")
    private BigDecimal lockedQuantity;

    private String unit;

    @NotNull(message = "预警值不能为空")
    @DecimalMin(value = "0", message = "预警值不能小于0")
    @DecimalMax(value = "999999.99", message = "预警值超出范围")
    private BigDecimal warningQuantity;

    private Integer stockStatus;

    @Size(max = 100, message = "存放位置长度不能超过100个字符")
    private String storageLocation;

    private LocalDate productionDate;

    private LocalDate oxidationWarningDate;

    @Size(max = 500, message = "备注长度不能超过500个字符")
    private String remark;
}
