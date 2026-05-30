package com.household.management.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.household.management.entity.RawMaterial;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface RawMaterialMapper extends BaseMapper<RawMaterial> {

    @Select("SELECT rm.*, COALESCE(SUM(rms.quantity), 0) as currentStock " +
            "FROM raw_material rm " +
            "LEFT JOIN raw_material_stock rms ON rm.id = rms.material_id AND rms.status = 1 AND rms.deleted = 0 " +
            "WHERE rm.deleted = 0 " +
            "GROUP BY rm.id " +
            "ORDER BY rm.id DESC")
    List<RawMaterial> selectMaterialListWithStock();

    @Select("SELECT rm.*, COALESCE(SUM(rms.quantity), 0) as currentStock " +
            "FROM raw_material rm " +
            "LEFT JOIN raw_material_stock rms ON rm.id = rms.material_id AND rms.status = 1 AND rms.deleted = 0 " +
            "WHERE rm.deleted = 0 AND rm.id = #{id} " +
            "GROUP BY rm.id")
    RawMaterial selectMaterialWithStockById(@Param("id") Long id);

    IPage<RawMaterial> selectMaterialPageWithConditions(Page<RawMaterial> page,
                                                         @Param("materialType") String materialType,
                                                         @Param("materialTexture") String materialTexture,
                                                         @Param("status") Integer status,
                                                         @Param("keyword") String keyword);
}
