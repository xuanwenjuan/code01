package com.snack.processing.dto.supplier;

import com.snack.processing.common.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class SupplierQueryDTO extends PageQuery {
    private String code;
    private String name;
    private String contactPhone;
    private Integer status;
}
