package com.snack.processing.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("supplier")
public class Supplier extends BaseEntity {

    private String code;
    private String name;
    private String contactPerson;
    private String contactPhone;
    private String address;
    private String businessScope;
    private String qualification;
    private Integer status;
    private String remark;
}
