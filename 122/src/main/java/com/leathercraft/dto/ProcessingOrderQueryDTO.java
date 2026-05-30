package com.leathercraft.dto;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Data
public class ProcessingOrderQueryDTO {
    private String orderNo;
    private String status;
    private Long productCategoryId;
    private Long tannerId;
    private Long cutterId;
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createStartTime;
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createEndTime;
    private Integer pageNum = 1;
    private Integer pageSize = 10;
}
