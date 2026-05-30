package com.sheetmetal.compressor.dto;

import com.sheetmetal.compressor.common.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class MaterialQueryDTO extends PageQuery {
    private String materialName;
    private String materialCode;
    private Integer materialType;
    private String materialTexture;
    private Integer status;
    private String supplier;
}
