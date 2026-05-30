package com.logistics.bigcargo.vo;

import lombok.Data;

@Data
public class DispatchStatisticsVO {
    private Long totalOrders;
    private Long pendingStockIn;
    private Long pendingSort;
    private Long pendingDispatch;
    private Long inTransit;
    private Long completed;
    private Long shelved;
    private Long todayNew;
    private Long todayCompleted;
}
