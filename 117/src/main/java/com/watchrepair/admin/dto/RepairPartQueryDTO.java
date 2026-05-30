package com.watchrepair.admin.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RepairPartQueryDTO {

    @Size(max = 50, message = "配件编码长度不能超过50")
    private String partCode;

    @Size(max = 100, message = "配件名称长度不能超过100")
    private String partName;

    @Size(max = 50, message = "配件类型长度不能超过50")
    private String partType;

    @Size(max = 100, message = "产地长度不能超过100")
    private String origin;

    @Size(max = 200, message = "适配型号长度不能超过200")
    private String compatibleModels;

    private Integer status;

    private Integer moistureProof;

    private Integer minQuantity;

    private Integer maxQuantity;
}