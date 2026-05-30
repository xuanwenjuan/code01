package com.rotor.manufacture.dto;

import jakarta.validation.constraints.Positive;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class MaterialQueryDTO {
    private String keyword;
    private String materialType;
    private Integer stockStatus;
    private String supplier;
    private String batchNo;

    @Positive(message = "最小库存必须为正数")
    private BigDecimal minQuantity;

    @Positive(message = "最大库存必须为正数")
    private BigDecimal maxQuantity;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startCreateTime;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endCreateTime;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startExpiryDate;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endExpiryDate;

    private Integer pageNum = 1;
    private Integer pageSize = 10;
    private String orderBy = "createTime";
    private String orderDirection = "desc";
}