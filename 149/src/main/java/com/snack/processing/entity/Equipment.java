package com.snack.processing.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("equipment")
public class Equipment extends BaseEntity {

    private String code;
    private String name;
    private String model;
    private String specification;
    private String manufacturer;
    private LocalDate purchaseDate;
    private String workshop;
    private Integer status;
    private LocalDate lastMaintenanceDate;
    private LocalDate nextMaintenanceDate;
    private String remark;
}
