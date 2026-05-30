package com.mushroom.traceability.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("harvest_detail")
public class HarvestDetail extends BaseEntity {
    @NotNull(message = "任务ID不能为空")
    private Long taskId;

    @NotNull(message = "品类ID不能为空")
    private Long categoryId;

    private String categoryName;

    private BigDecimal harvestQuantity;

    private BigDecimal lossQuantity;

    private String qualityLevel;

    private String harvestLocation;

    private LocalDateTime harvestTime;

    private String harvesterRemark;
}