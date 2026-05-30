package com.flange.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("inventory_check")
public class InventoryCheck {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String checkNo;

    private Long materialId;

    private String materialName;

    private String batchNo;

    private BigDecimal systemQuantity;

    private BigDecimal actualQuantity;

    private BigDecimal diffQuantity;

    private String diffReason;

    private Long operatorId;

    private String operatorName;

    private String status;

    private Long approverId;

    private String approverName;

    private LocalDateTime approveTime;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
