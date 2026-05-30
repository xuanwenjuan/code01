package com.incense.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MaterialQueryDTO {

    @Min(value = 1, message = "页码最小为1")
    private Integer pageNum = 1;

    @Min(value = 1, message = "每页条数最小为1")
    @Max(value = 100, message = "每页条数最大为100")
    private Integer pageSize = 10;

    @Size(max = 50, message = "原料类型长度不能超过50")
    private String materialType;

    @Size(max = 20, message = "库存状态长度不能超过20")
    private String status;

    @Size(max = 100, message = "关键词长度不能超过100")
    private String keyword;

    @Size(max = 50, message = "研磨细度长度不能超过50")
    private String fineness;

    @Size(max = 100, message = "产地长度不能超过100")
    private String origin;

    private Boolean includeLocked = false;
}
