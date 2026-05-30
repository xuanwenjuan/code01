package com.oiledumbrella.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderMaterialLockDTO {
    @NotNull(message = "工单ID不能为空")
    private Long orderId;
    
    @NotNull(message = "原料清单不能为空")
    private List<MaterialItem> materials;
    
    @Data
    public static class MaterialItem {
        @NotNull(message = "原料ID不能为空")
        private Long materialId;
        
        @NotNull(message = "数量不能为空")
        @DecimalMin(value = "0.01", message = "数量必须大于0")
        private BigDecimal quantity;
    }
}
