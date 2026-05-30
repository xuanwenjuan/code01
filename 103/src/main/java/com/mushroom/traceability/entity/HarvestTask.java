package com.mushroom.traceability.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("harvest_task")
public class HarvestTask extends BaseEntity {
    private String taskCode;

    @NotBlank(message = "任务名称不能为空")
    private String taskName;

    @NotNull(message = "产区ID不能为空")
    private Long areaId;

    private String areaName;

    private String categoryIds;

    private Long harvesterId;

    private String harvesterName;

    private String taskDescription;

    private BigDecimal expectedQuantity;

    private BigDecimal actualQuantity;

    private String taskStatus;

    private String qualityLevel;

    private String qualityRemark;

    private LocalDateTime warehouseTime;

    private LocalDateTime shipTime;

    @NotNull(message = "任务失效时间不能为空")
    private LocalDateTime expireTime;

    private Long createBy;
}