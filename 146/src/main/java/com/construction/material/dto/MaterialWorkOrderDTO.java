package com.construction.material.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class MaterialWorkOrderDTO {

    private Long id;

    @NotNull(message = "工单类型不能为空")
    private Integer orderType;

    @NotBlank(message = "项目名称不能为空")
    private String projectName;

    private String constructionTeam;

    private String teamLeader;

    private String teamLeaderPhone;

    private LocalDateTime planUseDate;

    private String remark;

    @Valid
    @NotNull(message = "工单明细不能为空")
    private List<WorkOrderDetailDTO> details;
}
