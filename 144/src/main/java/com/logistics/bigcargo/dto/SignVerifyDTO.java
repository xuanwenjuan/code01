package com.logistics.bigcargo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SignVerifyDTO {
    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotBlank(message = "签收人姓名不能为空")
    private String signerName;

    @NotBlank(message = "签收人手机号不能为空")
    private String signerPhone;

    private String idCardNo;

    private Integer signQuantity;

    private Boolean abnormalFlag = false;

    private String abnormalDesc;

    private String signRemark;
}
