package com.mining.maintenance.vo;

import lombok.Data;

import java.time.LocalDate;

@Data
public class EquipmentAssetDetailVO {

    private Long id;

    private String equipmentCode;

    private String factorySerial;

    private String equipmentName;

    private Long categoryId;

    private String categoryName;

    private String miningArea;

    private Integer useYears;

    private String ratedCondition;

    private String status;

    private String statusDesc;

    private LocalDate lastMaintenanceDate;

    private LocalDate nextMaintenanceDate;

    private Integer maintenanceCycleDays;

    private Boolean needMaintenance;

    private String location;

    private String remarks;
}