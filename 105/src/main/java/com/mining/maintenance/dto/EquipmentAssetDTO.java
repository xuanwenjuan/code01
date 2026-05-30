package com.mining.maintenance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EquipmentAssetDTO {

    private Long id;

    @NotBlank(message = "设备编码不能为空")
    private String equipmentCode;

    @NotBlank(message = "出厂编号不能为空")
    private String factorySerial;

    @NotBlank(message = "设备名称不能为空")
    private String equipmentName;

    @NotNull(message = "类目ID不能为空")
    private Long categoryId;

    @NotBlank(message = "服役矿区不能为空")
    private String miningArea;

    private Integer useYears;

    private String ratedCondition;

    private String status;

    private LocalDate lastMaintenanceDate;

    private LocalDate nextMaintenanceDate;

    private Integer maintenanceCycleDays;

    private String location;

    private String remarks;
}