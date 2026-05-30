package com.rotor.manufacture.dto;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Data
public class ProductionOrderQueryDTO {
    private String keyword;
    private String orderNo;
    private Long productId;
    private Integer status;
    private Long groupLeaderId;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startPlanTime;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endPlanTime;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startActualTime;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endActualTime;

    private Integer pageNum = 1;
    private Integer pageSize = 10;
    private String orderBy = "createTime";
    private String orderDirection = "desc";
}