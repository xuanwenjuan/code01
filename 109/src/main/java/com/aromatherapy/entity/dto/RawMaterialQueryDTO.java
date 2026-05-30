package com.aromatherapy.entity.dto;

import lombok.Data;

@Data
public class RawMaterialQueryDTO {

    private String materialName;

    private String extractionProcess;

    private Integer stockStatus;

    private Integer status;

    private Integer pageNum = 1;

    private Integer pageSize = 10;
}
