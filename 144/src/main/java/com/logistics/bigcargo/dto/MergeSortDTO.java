package com.logistics.bigcargo.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class MergeSortDTO {
    @NotEmpty(message = "工单ID列表不能为空")
    private List<Long> orderIds;

    @NotNull(message = "分拣员ID不能为空")
    private Long sorterId;

    private String sortRemark;
}
