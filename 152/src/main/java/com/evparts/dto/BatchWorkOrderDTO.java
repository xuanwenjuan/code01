package com.evparts.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class BatchWorkOrderDTO {

    @NotEmpty(message = "工单ID列表不能为空")
    private List<Long> ids;

    private String sourceStatus;

    private String targetStatus;

}
