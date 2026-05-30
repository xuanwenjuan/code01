package com.evparts.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.evparts.entity.ProductionCost;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface ProductionCostMapper extends BaseMapper<ProductionCost> {

    IPage<ProductionCost> getCostDetailPage(Page<ProductionCost> page,
                                           @Param("costNo") String costNo,
                                           @Param("orderNo") String orderNo,
                                           @Param("productName") String productName,
                                           @Param("categoryId") Long categoryId,
                                           @Param("status") Integer status,
                                           @Param("startDate") String startDate,
                                           @Param("endDate") String endDate);

    List<Map<String, Object>> getCostAnalysis(@Param("startDate") String startDate,
                                              @Param("endDate") String endDate,
                                              @Param("productId") Long productId);

    List<Map<String, Object>> getCostByProduct(@Param("startDate") String startDate,
                                               @Param("endDate") String endDate);

}

