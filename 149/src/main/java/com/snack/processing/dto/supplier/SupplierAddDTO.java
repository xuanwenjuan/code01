package com.snack.processing.dto.supplier;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.hibernate.validator.constraints.Length;

@Data
public class SupplierAddDTO {

    @NotBlank(message = "供应商编码不能为空")
    private String code;

    @NotBlank(message = "供应商名称不能为空")
    private String name;

    @Length(max = 50, message = "联系人长度不能超过50")
    private String contactPerson;

    @Length(max = 20, message = "联系电话长度不能超过20")
    private String contactPhone;

    @Length(max = 255, message = "地址长度不能超过255")
    private String address;

    @Length(max = 500, message = "经营范围长度不能超过500")
    private String businessScope;

    @Length(max = 500, message = "资质文件长度不能超过500")
    private String qualification;

    private Integer status;

    @Length(max = 500, message = "备注长度不能超过500")
    private String remark;
}
