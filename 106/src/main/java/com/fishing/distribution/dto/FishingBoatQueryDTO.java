package com.fishing.distribution.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class FishingBoatQueryDTO extends PageQuery {

    @Size(max = 100, message = "渔船名称长度不能超过100字符")
    private String boatName;

    @Size(max = 50, message = "渔船编号长度不能超过50字符")
    private String boatCode;

    @Size(max = 100, message = "船队名称长度不能超过100字符")
    private String fleetName;

    @Size(max = 200, message = "捕捞海域长度不能超过200字符")
    private String approvedArea;

    private Integer status;
}
