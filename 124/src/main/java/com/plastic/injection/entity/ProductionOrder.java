package com.plastic.injection.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_order")
public class ProductionOrder extends BaseEntity {

    private String orderNo;

    private Long productId;

    private String productName;

    private Long categoryId;

    private BigDecimal planQuantity;

    private BigDecimal actualQuantity;

    private BigDecimal defectiveQuantity;

    private Integer orderStatus;

    private LocalDateTime planStartTime;

    private LocalDateTime planEndTime;

    private LocalDateTime actualStartTime;

    private LocalDateTime actualEndTime;

    private Long technicianId;

    private String technicianName;

    private Long machineId;

    private String machineName;

    private Integer dryingTime;

    private Integer moldInstallTime;

    private Integer injectionCycle;

    private Integer coolingTime;

    private Integer trimmingTime;

    private String remark;

    private Integer isDelayed;

    private LocalDateTime delayTime;

    @TableField(exist = false)
    private List<OrderMaterial> materials;
}
