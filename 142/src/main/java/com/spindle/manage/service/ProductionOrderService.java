package com.spindle.manage.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.spindle.manage.dto.OrderMaterialDetailDTO;
import com.spindle.manage.dto.ProductionOrderQueryDTO;
import com.spindle.manage.dto.QualityCheckDTO;
import com.spindle.manage.entity.OrderProcessRecord;
import com.spindle.manage.entity.ProductionOrder;

import java.util.List;

public interface ProductionOrderService extends IService<ProductionOrder> {

    IPage<ProductionOrder> getOrderPage(Page<ProductionOrder> page, String orderNo, Integer orderStatus, Long categoryId);

    IPage<ProductionOrder> queryByConditions(Page<ProductionOrder> page, ProductionOrderQueryDTO dto);

    boolean createOrder(ProductionOrder order);

    boolean startProcess(Long orderId, Integer processCode, Long operatorId);

    boolean completeProcess(Long orderId, Integer processCode, Long operatorId, String remark);

    boolean qualityCheck(QualityCheckDTO dto);

    boolean recordProductionLoss(Long orderId, Integer processCode, String lossType, String materialName,
                                 java.math.BigDecimal lossQuantity, java.math.BigDecimal lossAmount, String remark);

    List<OrderProcessRecord> getProcessRecords(Long orderId);

    boolean pauseOrder(Long orderId, String reason);

    boolean resumeOrder(Long orderId);

    boolean cancelOrder(Long orderId, String reason);

    boolean finalQualityCheck(Long orderId, String result, String remark);

    boolean addOrderMaterialDetail(OrderMaterialDetailDTO dto);

    boolean batchAddOrderMaterialDetail(List<OrderMaterialDetailDTO> list);

    void checkAndPauseOverdueOrders();

}
