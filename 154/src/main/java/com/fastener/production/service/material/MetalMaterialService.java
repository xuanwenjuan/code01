package com.fastener.production.service.material;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.fastener.production.common.entity.PageQuery;
import com.fastener.production.entity.material.MetalMaterial;
import com.fastener.production.entity.material.dto.MetalMaterialDTO;
import com.fastener.production.entity.material.dto.MetalMaterialQueryDTO;

import java.util.List;

public interface MetalMaterialService extends IService<MetalMaterial> {

    IPage<MetalMaterial> page(PageQuery pageQuery, String materialName, Integer materialType, Integer status);

    IPage<MetalMaterial> queryByConditions(PageQuery pageQuery, MetalMaterialQueryDTO queryDTO);

    List<MetalMaterial> listByConditions(MetalMaterialQueryDTO queryDTO);

    List<MetalMaterial> listByType(Integer materialType);

    List<String> listAllGrades();

    List<String> listAllSuppliers();

    List<String> listAllOrigins();

    void add(MetalMaterialDTO dto);

    void update(MetalMaterialDTO dto);

    void delete(Long id);
}
