package com.snack.processing.dto.material;

import com.snack.processing.common.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class MaterialQueryDTO extends PageQuery {

    private String name;
    private String code;
    private Long categoryId;
    private Integer isFresh;
    private Integer status;
    private String supplier;
}
