package com.aromatherapy.entity.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("work_order_formula")
public class WorkOrderFormulaPO {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long workOrderId;

    private Long rawMaterialId;

    private String materialName;

    private BigDecimal proportion;

    private BigDecimal dosage;

    private BigDecimal actualUsage;

    private BigDecimal lossRate;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    private Integer deleted;
}
