package com.leathercraft.dto;

import jakarta.validation.constraints.Positive;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
public class MaterialInventoryQueryDTO {
    private String materialName;
    private String materialType;
    private String status;
    private String origin;
    private String batchNo;
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate expireStartDate;
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate expireEndDate;
    private Integer pageNum = 1;
    private Integer pageSize = 10;
}
