package com.snack.processing.dto.equipment;

import com.snack.processing.common.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class EquipmentQueryDTO extends PageQuery {
    private String code;
    private String name;
    private String workshop;
    private Integer status;
}
