package com.mining.maintenance.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mining.maintenance.dto.MaintenanceOrderDTO;
import com.mining.maintenance.entity.MaintenanceOrder;
import com.mining.maintenance.entity.MaintenanceOrderLog;

import java.util.List;

public interface MaintenanceOrderService extends IService<MaintenanceOrder> {

    void reportOrder(MaintenanceOrderDTO dto);

    void assignOrder(Long id, Long technicianId);

    void acceptOrder(Long id);

    void startMaintenance(Long id);

    void completeMaintenance(Long id, String content, String partsUsed, java.math.BigDecimal laborHours);

    void checkOrder(Long id, Long checkerId, String checkOpinion, boolean passed);

    Page<MaintenanceOrder> pageQuery(int page, int size, String miningArea, String status, Long technicianId);

    List<MaintenanceOrderLog> getOrderLogs(Long orderId);

    void reassignTimeoutOrders();
}