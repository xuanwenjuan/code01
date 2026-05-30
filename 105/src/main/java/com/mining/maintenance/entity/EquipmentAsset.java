package com.mining.maintenance.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("equipment_asset")
public class EquipmentAsset extends BaseEntity {

    private String equipmentCode;

    private String factorySerial;

    private String equipmentName;

    private Long categoryId;

    private String miningArea;

    private Integer useYears;

    private String ratedCondition;

    private String status;

    private LocalDate lastMaintenanceDate;

    private LocalDate nextMaintenanceDate;

    private Integer maintenanceCycleDays;

    private Integer warningFlag;

    private String location;

    private String remarks;
}