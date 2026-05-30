package com.stationery.manufacture.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("production_order")
public class ProductionOrder {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String orderNo;

    private Long categoryId;

    private String categoryName;

    private String productName;

    private String specification;

    private Integer quantity;

    private Integer priority;

    private Integer orderStatus;

    private String customerName;

    private String customerContact;

    private LocalDateTime planStartTime;

    private LocalDateTime planEndTime;

    private LocalDateTime actualStartTime;

    private LocalDateTime actualEndTime;

    private Long designUserId;

    private String designUserName;

    private Long productionUserId;

    private String productionUserName;

    private Long inspectionUserId;

    private String inspectionUserName;

    private Integer qualifiedQuantity;

    private Integer defectiveQuantity;

    private String designRequirements;

    private String remark;

    @TableLogic
    private Integer deleted;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    private transient List<OrderProcess> processes;

    private transient List<OrderMaterial> materials;
}
