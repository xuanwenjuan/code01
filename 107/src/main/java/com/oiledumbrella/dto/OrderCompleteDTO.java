package com.oiledumbrella.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class OrderCompleteDTO {
    @NotNull(message = "工单ID不能为空")
    private Long orderId;
    
    @NotNull(message = "完工数量不能为空")
    @DecimalMin(value = "1", message = "完工数量必须大于0")
    private Integer completeQuantity;
    
    private Integer scrapQuantity;
    
    private List<LaborCost> laborCosts;
    
    private List<MaterialScrap> materialScraps;
    
    private String remark;
    
    @Data
    public static class LaborCost {
        @NotNull(message = "工匠ID不能为空")
        private Long artisanId;
        
        @NotNull(message = "工时不能为空")
        @DecimalMin(value = "0.5", message = "工时必须大于0.5")
        private BigDecimal workHours;
        
        @NotNull(message = "小时工资不能为空")
        @DecimalMin(value = "0.01", message = "小时工资必须大于0")
        private BigDecimal hourlyWage;
        
        private String workType;
    }
    
    @Data
    public static class MaterialScrap {
        @NotNull(message = "原料ID不能为空")
        private Long materialId;
        
        @NotNull(message = "报废数量不能为空")
        @DecimalMin(value = "0.01", message = "报废数量必须大于0")
        private BigDecimal quantity;
        
        private String reason;
    }
}
