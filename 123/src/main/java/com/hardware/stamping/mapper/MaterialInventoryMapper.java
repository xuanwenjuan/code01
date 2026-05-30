package com.hardware.stamping.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hardware.stamping.dto.MaterialInventoryQueryDTO;
import com.hardware.stamping.entity.MaterialInventory;
import com.hardware.stamping.vo.MaterialInventoryVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface MaterialInventoryMapper extends BaseMapper<MaterialInventory> {

    IPage<MaterialInventoryVO> queryPage(Page<MaterialInventoryVO> page, @Param("query") MaterialInventoryQueryDTO query);

    @Update("UPDATE material_inventory SET quantity = quantity - #{quantity}, update_time = NOW() WHERE id = #{id} AND deleted = 0")
    int lockStock(@Param("id") Long id, @Param("quantity") java.math.BigDecimal quantity);

    @Update("UPDATE material_inventory SET quantity = quantity + #{quantity}, update_time = NOW() WHERE id = #{id} AND deleted = 0")
    int unlockStock(@Param("id") Long id, @Param("quantity") java.math.BigDecimal quantity);
}
