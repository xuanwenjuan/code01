package com.plastic.injection.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.plastic.injection.po.ProductionOrderPO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ProductionOrderMapper extends BaseMapper<ProductionOrderPO> {

    IPage<ProductionOrderPO> selectByConditions(Page<ProductionOrderPO> page,
                                                  @Param("orderNo") String orderNo,
                                                  @Param("productName") String productName,
                                                  @Param("categoryId") Long categoryId,
                                                  @Param("orderStatus") Integer orderStatus,
                                                  @Param("technicianId") Long technicianId);

    int updateOrderStatus(@Param("id") Long id, @Param("orderStatus") Integer orderStatus,
                          @Param("operator") String operator);
}
