package com.fishing.distribution.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class FishingBoatVO {

    private Long id;

    private String boatCode;

    private String boatName;

    private String fleetName;

    private String approvedArea;

    private BigDecimal tonnage;

    private String licenseNumber;

    private LocalDate licenseExpireDate;

    private String contactPerson;

    private String contactPhone;

    private Integer status;

    private String statusDesc;

    private LocalDateTime createTime;
}
