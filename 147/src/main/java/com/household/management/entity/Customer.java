package com.household.management.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.household.management.common.entity.BaseEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("customer")
@Schema(description = "客户实体")
public class Customer extends BaseEntity {

    @Schema(description = "客户名称")
    private String customerName;

    @Schema(description = "客户编码")
    private String customerCode;

    @Schema(description = "联系人")
    private String contactPerson;

    @Schema(description = "联系电话")
    private String phone;

    @Schema(description = "地址")
    private String address;

    @Schema(description = "客户等级")
    private Integer level;

    @Schema(description = "状态")
    private Integer status;
}
