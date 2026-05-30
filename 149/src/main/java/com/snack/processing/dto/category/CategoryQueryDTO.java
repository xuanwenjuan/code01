package com.snack.processing.dto.category;

import com.snack.processing.common.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class CategoryQueryDTO extends PageQuery {

    private String name;
    private String code;
    private Integer status;
    private Long parentId;
}
