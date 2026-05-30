package com.paper.production.service.cost;

import com.baomidou.mybatisplus.extension.service.IService;
import com.paper.production.common.PageQuery;
import com.paper.production.common.PageResult;
import com.paper.production.dto.cost.ProductionCostDTO;
import com.paper.production.entity.cost.CostDetail;
import com.paper.production.entity.cost.MonthlyReport;
import com.paper.production.entity.cost.ProductionCost;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface ProductionCostService extends IService<ProductionCost> {

    void calculateCost(Long workOrderId);

    void saveCost(ProductionCostDTO dto);

    void updateCost(ProductionCostDTO dto);

    void deleteCost(Long id);

    PageResult<ProductionCost> queryCostPage(PageQuery query);

    List<CostDetail> getCostDetails(Long costId);

    List<CostDetail> getWorkOrderCostDetails(Long workOrderId);

    MonthlyReport generateMonthlyReport(String reportMonth);

    List<MonthlyReport> getMonthlyReports();

    void autoGenerateMonthlyReport();

    Map<String, Object> calculateUnitCost(Long workOrderId);

    Map<String, Object> getCostComposition(Long workOrderId);

    BigDecimal getTotalLossAmount(Long workOrderId);

    Map<String, Object> getDefectiveCost(Long workOrderId);
}
