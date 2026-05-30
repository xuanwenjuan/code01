package com.spring.manufacturing.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_work_order")
public class ProductionWorkOrder extends BaseEntity {

    private String workOrderNo;

    @NotNull(message = "产品分类ID不能为空")
    private Long categoryId;

    @NotBlank(message = "产品名称不能为空")
    @Size(max = 100, message = "产品名称长度不能超过100个字符")
    private String productName;

    @Size(max = 200, message = "规格型号长度不能超过200个字符")
    private String specification;

    @NotNull(message = "计划数量不能为空")
    private Integer planQuantity;

    private Integer actualQuantity;

    private Integer defectiveQuantity;

    private String status;

    private Integer priority;

    private LocalDate planStartDate;

    private LocalDate planEndDate;

    private LocalDateTime actualStartDate;

    private LocalDateTime actualEndDate;

    private String currentProcess;

    private Long processOperatorId;

    @Size(max = 500, message = "备注长度不能超过500个字符")
    private String remark;
}