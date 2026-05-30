package com.firecontrol.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.firecontrol.entity.Material;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

import java.math.BigDecimal;

@Mapper
public interface MaterialMapper extends BaseMapper<Material> {

    @Update("UPDATE material SET total_stock = total_stock + #{quantity}, available_stock = available_stock + #{quantity} WHERE id = #{id}")
    int addStock(@Param("id") Long id, @Param("quantity") BigDecimal quantity);

    @Update("UPDATE material SET total_stock = total_stock - #{quantity}, available_stock = available_stock - #{quantity} WHERE id = #{id}")
    int reduceStock(@Param("id") Long id, @Param("quantity") BigDecimal quantity);

    @Update("UPDATE material SET available_stock = available_stock - #{quantity}, frozen_stock = frozen_stock + #{quantity} WHERE id = #{id} AND available_stock >= #{quantity}")
    int freezeStock(@Param("id") Long id, @Param("quantity") BigDecimal quantity);

    @Update("UPDATE material SET frozen_stock = frozen_stock - #{quantity} WHERE id = #{id} AND frozen_stock >= #{quantity}")
    int unfreezeStock(@Param("id") Long id, @Param("quantity") BigDecimal quantity);
}
