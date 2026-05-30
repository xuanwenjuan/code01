package com.snack.processing.dto.equipment;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.hibernate.validator.constraints.Length;

import java.time.LocalDate;

@Data
public class EquipmentAddDTO {

    @NotBlank(message = "设备编码不能为空")
    private String code;

    @NotBlank(message = "设备名称不能为空")
    private String name;

    @Length(max = 100, message = "型号长度不能超过100")
    private String model;

    @Length(max = 100, message = "规格长度不能超过100")
    private String specification;

    @Length(max = 100, message = "生产厂家长度不能超过100")
    private String manufacturer;

    private LocalDate purchaseDate;

    @Length(max = 50, message = "所属车间长度不能超过50")
    private String workshop;

    private Integer status;

    private LocalDate lastMaintenanceDate;

    private LocalDate nextMaintenanceDate;

    @Length(max = 500, message = "备注长度不能超过500")
    private String remark;
}
