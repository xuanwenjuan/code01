package com.bee.equipment.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class WorkOrderDTO {

    private Long id;

    @NotNull(message = "器具类目不能为空")
    private Long equipmentCategoryId;

    @NotNull(message = "生产数量不能为空")
    @Min(value = 1, message = "生产数量不能小于1")
    private Integer quantity;

    private String status;

    private Long assemblerId;

    private LocalDateTime deadline;

    @Size(max = 500, message = "备注长度不能超过500个字符")
    private String remark;

    @NotEmpty(message = "工单物料不能为空")
    @Valid
    private List<WorkOrderMaterialDTO> materials;
}
