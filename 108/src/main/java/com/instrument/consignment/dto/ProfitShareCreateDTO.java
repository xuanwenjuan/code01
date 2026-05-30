package com.instrument.consignment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProfitShareCreateDTO {

    @NotNull(message = "乐器档案ID不能为空")
    private Long archiveId;

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotNull(message = "收品渠道不能为空")
    private String receiveChannel;

    @NotNull(message = "成交价格不能为空")
    private BigDecimal salePrice;

    private BigDecimal otherCost;

    private String remark;
}
