package com.zongshi.brush.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zongshi.brush.entity.OrderMaterial;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface OrderMaterialMapper extends BaseMapper<OrderMaterial> {

    List<OrderMaterial> selectByOrderId(@Param("orderId") Long orderId);
}
