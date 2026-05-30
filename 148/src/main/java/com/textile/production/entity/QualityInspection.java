package com.textile.production.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("quality_inspection")
public class QualityInspection implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;

    private Long processId;

    private String inspectType;

    private java.math.BigDecimal inspectQuantity;

    private java.math.BigDecimal qualifiedQuantity;

    private java.math.BigDecimal defectiveQuantity;

    private java.math.BigDecimal passRate;

    private String defectDetails;

    private Long inspectorId;

    private Integer inspectResult;

    @TableLogic
    private Integer deleted;

    private LocalDateTime createTime;
}
