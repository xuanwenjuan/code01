package com.mushroom.traceability.dto;

import lombok.Data;

@Data
public class ProductionAreaQueryDTO {
    private String areaName;
    private String province;
    private String city;
    private String status;
    private Integer isRainySeason;
    private Integer altitudeMin;
    private Integer altitudeMax;
    private Integer pageNum = 1;
    private Integer pageSize = 10;
}