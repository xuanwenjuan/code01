package com.aromatherapy.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_work_order")
public class ProductionWorkOrder extends BaseEntity {

    private String orderNo;

    private String customerName;

    private String aromaName;

    private Long categoryId;

    private BigDecimal targetQuantity;

    private BigDecimal actualQuantity;

    private String status;

    private LocalDateTime formulaConfirmedTime;

    private LocalDateTime mixingStartTime;

    private LocalDateTime mixingEndTime;

    private LocalDateTime agingStartTime;

    private LocalDateTime agingEndTime;

    private LocalDateTime qcTime;

    private String qcResult;

    private LocalDateTime packageTime;

    private LocalDateTime shipTime;

    private Long perfumerId;

    private Long warehouseId;

    private String remark;

    @TableField(exist = false)
    private List<WorkOrderFormula> formulaList;
}
