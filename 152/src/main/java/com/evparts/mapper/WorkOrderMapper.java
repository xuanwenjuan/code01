package com.evparts.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.evparts.entity.WorkOrder;
import com.evparts.entity.WorkOrderMaterial;
import com.evparts.entity.WorkOrderProcess;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface WorkOrderMapper extends BaseMapper<WorkOrder> {

    IPage<WorkOrder> getWorkOrderDetailPage(Page<WorkOrder> page,
                                           @Param("orderNo") String orderNo,
                                           @Param("productName") String productName,
                                           @Param("categoryId") Long categoryId,
                                           @Param("orderStatus") String orderStatus,
                                           @Param("workshop") String workshop,
                                           @Param("operatorId") Long operatorId,
                                           @Param("startDate") String startDate,
                                           @Param("endDate") String endDate);

    List<WorkOrderProcess> getWorkOrderProcesses(@Param("workOrderId") Long workOrderId);

    List<WorkOrderMaterial> getWorkOrderMaterials(@Param("workOrderId") Long workOrderId);

    Map<String, Object> getWorkOrderStats(@Param("startDate") String startDate, @Param("endDate") String endDate);

    int batchUpdateStatus(@Param("ids") List<Long> ids,
                          @Param("targetStatus") String targetStatus,
                          @Param("sourceStatus") String sourceStatus);

}

