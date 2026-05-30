package com.spindle.manage.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("order_process_record")
public class OrderProcessRecord extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;

    private Integer processCode;

    private String processName;

    private Integer processStatus;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Long operatorId;

    private String operatorName;

    private Long processDuration;

    private String qualityResult;

    private String qualityRemark;

    private Long inspectorId;

    private String inspectorName;

    private String remark;

}
