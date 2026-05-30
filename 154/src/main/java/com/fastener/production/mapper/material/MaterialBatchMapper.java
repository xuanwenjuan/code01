package com.fastener.production.mapper.material;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fastener.production.entity.material.MaterialBatch;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;
import java.util.List;

@Mapper
public interface MaterialBatchMapper extends BaseMapper<MaterialBatch> {

    @Select("SELECT * FROM material_batch WHERE batch_code = #{batchCode} AND deleted = 0 LIMIT 1")
    MaterialBatch selectByCode(@Param("batchCode") String batchCode);

    @Select("SELECT * FROM material_batch WHERE material_id = #{materialId} AND deleted = 0 AND available_quantity > 0 ORDER BY inbound_time ASC")
    List<MaterialBatch> selectAvailableByMaterialId(@Param("materialId") Long materialId);

    @Select("SELECT COALESCE(SUM(available_quantity), 0) FROM material_batch WHERE material_id = #{materialId} AND deleted = 0")
    BigDecimal sumAvailableQuantity(@Param("materialId") Long materialId);
}
