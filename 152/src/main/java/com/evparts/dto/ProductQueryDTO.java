package com.evparts.dto;

import com.evparts.common.PageQuery;
import lombok.Data;

@Data
public class ProductQueryDTO extends PageQuery {

    private String productName;
    private String productCode;
    private Long categoryId;
    private Integer status;

}
