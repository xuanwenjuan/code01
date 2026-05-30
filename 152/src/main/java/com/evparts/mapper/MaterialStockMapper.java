package com.evparts.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.evparts.entity.MaterialStock;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Mapper
public interface MaterialStockMapper extends BaseMapper<MaterialStock> {

    IPage<MaterialStock> getStockDetailPage(Page<MaterialStock> page,
                                           @Param("materialName") String materialName,
                                           @Param("materialCode") String materialCode,
                                           @Param("materialType") String materialType,
                                           @Param("stockStatus") Integer stockStatus,
                                           @Param("warehouse") String warehouse,
                                           @Param("moistureWarning") Boolean moistureWarning);

    List<MaterialStock> getStockByMaterialId(@Param("materialId") Long materialId);

    BigDecimal getTotalStockByMaterialId(@Param("materialId") Long materialId);

    int updateStockQuantity(@Param("stockId") Long stockId, @Param("changeQuantity") BigDecimal changeQuantity);

    List<Map<String, Object>> getStockSummary();

}

