package com.fastener.production.service.cost;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.fastener.production.common.entity.PageQuery;
import com.fastener.production.entity.cost.MonthlyProductionReport;
import com.fastener.production.entity.cost.ProductionCost;
import com.fastener.production.entity.cost.dto.CostSummaryDTO;
import com.fastener.production.entity.cost.dto.ProductionCostDTO;
import com.fastener.production.entity.cost.vo.CategoryCostVO;
import com.fastener.production.entity.cost.vo.WorkOrderCostVO;

import java.util.List;

public interface ProductionCostService extends IService<ProductionCost> {

    IPage<ProductionCost> page(PageQuery pageQuery, Integer costType, Long workOrderId, String costDateStart, String costDateEnd);

    String generateCostNo();

    void add(ProductionCostDTO dto);

    void update(ProductionCostDTO dto);

    void delete(Long id);

    MonthlyProductionReport generateMonthlyReport(String reportMonth);

    List<MonthlyProductionReport> getReportList(String startMonth, String endMonth);

    MonthlyProductionReport getReportByMonth(String reportMonth);

    WorkOrderCostVO calculateWorkOrderCost(Long workOrderId);

    List<WorkOrderCostVO> calculateWorkOrderCostList(CostSummaryDTO dto);

    List<CategoryCostVO> calculateCategoryCost(CostSummaryDTO dto);

    void autoRecordWorkOrderCost(Long workOrderId);

    void recalculateReport(String reportMonth);
}
