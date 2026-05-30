package com.camping.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("order_member")
public class OrderMember extends BaseEntity {

    @NotNull(message = "订单ID不能为空")
    private Long orderId;

    @NotBlank(message = "团员姓名不能为空")
    private String memberName;

    @NotBlank(message = "团员手机号不能为空")
    private String memberPhone;

    private String address;

    private Integer quantity;

    private BigDecimal amount;

    private Integer status;

    private String remark;
}
