package com.mining.maintenance.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("technician_schedule")
public class TechnicianSchedule extends BaseEntity {

    private Long technicianId;

    private String technicianName;

    private Long orderId;

    private String orderNo;

    private String miningArea;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String status;

    private String remarks;
}