package com.tarp.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

import java.io.Serializable;

@Data
public class MaterialQueryDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private String keyword;

    private String materialType;

    private Integer status;

    private String origin;

    @Min(value = 1, message = "页码最小为1")
    private Integer pageNum = 1;

    @Min(value = 1, message = "每页条数最小为1")
    private Integer pageSize = 10;
}
