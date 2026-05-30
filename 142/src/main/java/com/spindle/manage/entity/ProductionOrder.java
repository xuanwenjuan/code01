package com.spindle.manage.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_order")
public class ProductionOrder extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String orderNo;

    @NotNull(message = "产品分类ID不能为空")
    private Long categoryId;

    @NotBlank(message = "产品名称不能为空")
    private String productName;

    @NotNull(message = "生产数量不能为空")
    private Integer quantity;

    private Integer currentProcess;

    private Integer orderStatus;

    private LocalDateTime planStartTime;

    private LocalDateTime planEndTime;

    private LocalDateTime actualStartTime;

    private LocalDateTime actualEndTime;

    private Long responsiblePerson;

    private Integer materialPrepareStatus;

    private Integer qualityCheckStatus;

    private String remark;

}
