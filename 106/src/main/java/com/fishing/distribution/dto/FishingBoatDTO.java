package com.fishing.distribution.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class FishingBoatDTO {

    @NotBlank(message = "渔船备案编号不能为空")
    @Size(max = 50, message = "渔船备案编号长度不能超过50字符")
    private String boatCode;

    @NotBlank(message = "渔船名称不能为空")
    @Size(max = 100, message = "渔船名称长度不能超过100字符")
    private String boatName;

    @Size(max = 100, message = "船队名称长度不能超过100字符")
    private String fleetName;

    @Size(max = 200, message = "捕捞海域长度不能超过200字符")
    private String approvedArea;

    @DecimalMin(value = "0", message = "载重吨位不能为负")
    @DecimalMax(value = "999999.99", message = "载重吨位超出范围")
    private BigDecimal tonnage;

    @Size(max = 100, message = "捕捞许可证号长度不能超过100字符")
    private String licenseNumber;

    private LocalDate licenseExpireDate;

    @Size(max = 50, message = "联系人长度不能超过50字符")
    private String contactPerson;

    @Size(max = 20, message = "联系电话长度不能超过20字符")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号码格式不正确")
    private String contactPhone;

    @Min(value = 1, message = "状态值不合法")
    @Max(value = 3, message = "状态值不合法")
    private Integer status = 1;
}
