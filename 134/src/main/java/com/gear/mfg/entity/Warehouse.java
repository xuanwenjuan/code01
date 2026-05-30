package com.gear.mfg.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("warehouse")
public class Warehouse extends BaseEntity {

    private String warehouseCode;

    private String warehouseName;

    private String warehouseType;

    private String address;

    private String manager;

    private String phone;

    private Integer capacity;

    private Integer status;

    private String remark;
}
