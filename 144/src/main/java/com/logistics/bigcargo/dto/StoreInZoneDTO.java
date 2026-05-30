package com.logistics.bigcargo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StoreInZoneDTO {
    @NotNull(message = "库存ID不能为空")
    private Long inventoryId;

    @NotBlank(message = "库区编号不能为空")
    private String storageZone;

    @NotBlank(message = "库位编号不能为空")
    private String locationCode;

    private String storeRemark;
}
