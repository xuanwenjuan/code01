package com.snacktrace.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("production_work_order")
public class ProductionWorkOrder {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String orderNo;
    private Long productId;
    private String productName;
    private BigDecimal planQuantity;
    private BigDecimal actualQuantity;
    private Integer priority;
    private Integer status;
    private Long teamLeaderId;
    private String teamLeaderName;
    private LocalDateTime planStartTime;
    private LocalDateTime actualStartTime;
    private LocalDateTime completeTime;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    @TableLogic
    private Integer deleted;
}
