package com.snack.processing.dto.material;

import com.snack.processing.common.PageQuery;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.validator.constraints.Length;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
public class StockQueryDTO extends PageQuery {

    private Long materialId;

    @Size(max = 100, message = "材料名称长度不能超过100")
    private String materialName;

    @Size(max = 50, message = "材料编码长度不能超过50")
    private String materialCode;

    @Size(max = 50, message = "批次号长度不能超过50")
    private String batchNo;

    private Integer stockStatus;

    private Integer isExpiring;

    private LocalDate expireDateStart;

    private LocalDate expireDateEnd;

    private Long categoryId;

    @Size(max = 50, message = "仓库长度不能超过50")
    private String warehouse;

    @Size(max = 50, message = "库位长度不能超过50")
    private String location;

    @DecimalMin(value = "0", message = "最小数量不能为负数")
    private BigDecimal minQuantity;

    @DecimalMin(value = "0", message = "最大数量不能为负数")
    private BigDecimal maxQuantity;

    private Boolean needSortByExpireDate;

    private String sortBy;

    private String sortOrder;
}
