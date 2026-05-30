package com.mining.maintenance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaintenanceOrderDTO {

    private Long id;

    @NotNull(message = "设备ID不能为空")
    private Long equipmentId;

    private String equipmentCode;

    @NotBlank(message = "所属矿区不能为空")
    private String miningArea;

    @NotBlank(message = "故障等级不能为空")
    private String faultLevel;

    private String faultDescription;

    private Long reportUserId;

    private Long assignedTechnicianId;

    private String status;

    private String maintenanceContent;

    private String partsUsed;

    private BigDecimal laborHours;

    private Long checkerId;

    private String checkOpinion;
}