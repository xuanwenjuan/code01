package com.logistics.bigcargo.vo;

import com.logistics.bigcargo.entity.Vehicle;
import lombok.Data;

import java.util.List;

@Data
public class VehicleMatchResultVO {
    private List<Vehicle> matchedVehicles;
    private Vehicle bestMatch;
    private String matchReason;
}
