package com.mushroom.traceability.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_area")
public class ProductionArea extends BaseEntity {
    @NotBlank(message = "产区编码不能为空")
    private String areaCode;

    @NotBlank(message = "产区名称不能为空")
    private String areaName;

    private String province;

    private String city;

    private String district;

    private Integer altitude;

    private String climate;

    private String mainCategories;

    private String harvestCycle;

    private String status;

    private Integer isRainySeason;

    private String warningMessage;

    private Integer sortOrder;
}