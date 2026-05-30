package com.liquor.brewing.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.liquor.brewing.common.PageQuery;
import com.liquor.brewing.entity.CostStatistics;
import com.liquor.brewing.entity.WorkOrderCost;
import com.liquor.brewing.entity.WorkOrderMaterial;
import jakarta.servlet.http.HttpServletResponse;

import java.util.List;

public interface CostService {

    IPage<WorkOrderCost> costPage(String month, PageQuery pageQuery);

    IPage<CostStatistics> statisticsPage(PageQuery pageQuery);

    WorkOrderCost calculateWorkOrderCost(Long workOrderId);

    void generateMonthlyStatistics();

    List<WorkOrderMaterial> exportWorkOrderMaterials(Long workOrderId);

    void exportWorkOrderMaterialsToExcel(Long workOrderId, HttpServletResponse response);
}
