package com.sheetmetal.compressor.common;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PageQuery {
    @NotNull(message = "页码不能为空")
    @Min(value = 1, message = "页码最小为1")
    private Long current = 1L;

    @NotNull(message = "每页条数不能为空")
    @Min(value = 1, message = "每页条数最小为1")
    private Long size = 10L;
}
