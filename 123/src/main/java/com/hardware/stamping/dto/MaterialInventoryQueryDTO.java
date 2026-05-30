package com.hardware.stamping.dto;

import com.hardware.stamping.common.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class MaterialInventoryQueryDTO extends PageQuery {
    private String materialType;
    private String specification;
    private Integer stockStatus;
    private String supplier;
    private String batchCode;
}
