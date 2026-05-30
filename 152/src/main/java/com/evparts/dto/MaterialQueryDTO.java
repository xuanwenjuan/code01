package com.evparts.dto;

import com.evparts.common.PageQuery;
import lombok.Data;

@Data
public class MaterialQueryDTO extends PageQuery {

    private String materialName;
    private String materialCode;
    private String materialType;
    private Integer status;

}
