package com.fastener.production.entity.material.dto;

import lombok.Data;

@Data
public class MetalMaterialQueryDTO {

    private String materialName;

    private String materialCode;

    private Integer materialType;

    private String materialGrade;

    private String specification;

    private String origin;

    private String supplier;

    private Integer status;

    private String keyword;
}
