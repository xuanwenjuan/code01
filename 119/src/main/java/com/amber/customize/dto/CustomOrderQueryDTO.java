package com.amber.customize.dto;

import lombok.Data;

@Data
public class CustomOrderQueryDTO {

    private Integer status;

    private Long categoryId;

    private Long carverId;

    private String customerName;

    private String customerPhone;

}
