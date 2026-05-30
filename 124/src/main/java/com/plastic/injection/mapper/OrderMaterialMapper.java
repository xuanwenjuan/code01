package com.plastic.injection.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.plastic.injection.po.OrderMaterialPO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface OrderMaterialMapper extends BaseMapper<OrderMaterialPO> {

    List<OrderMaterialPO> selectByOrderId(@Param("orderId") Long orderId);

    int batchInsert(@Param("list") List<OrderMaterialPO> list);

    int updateLockStatus(@Param("orderId") Long orderId, @Param("isLocked") Integer isLocked,
                          @Param("operator") String operator);
}
