package com.camping.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("group_order")
public class GroupOrder extends BaseEntity {

    private String orderNo;

    @NotNull(message = "团长ID不能为空")
    private Long leaderId;

    @NotBlank(message = "团购名称不能为空")
    private String groupName;

    private Long categoryId;

    private String productName;

    private String customRequirements;

    private Integer targetCount;

    private Integer currentCount;

    private BigDecimal unitPrice;

    private BigDecimal totalAmount;

    private Integer status;

    private LocalDateTime expireTime;

    private String remark;

    @TableField(exist = false)
    private List<OrderMember> members;

    @TableField(exist = false)
    private List<OrderMaterial> materials;
}
