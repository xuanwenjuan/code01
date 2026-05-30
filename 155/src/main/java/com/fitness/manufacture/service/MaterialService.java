package com.fitness.manufacture.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.fitness.manufacture.common.PageQuery;
import com.fitness.manufacture.dto.MaterialDTO;
import com.fitness.manufacture.dto.MaterialQueryDTO;
import com.fitness.manufacture.entity.Material;

public interface MaterialService extends IService<Material> {

    void saveMaterial(MaterialDTO dto);

    void updateMaterial(MaterialDTO dto);

    void deleteMaterial(Long id);

    IPage<Material> getMaterialPage(PageQuery query, String keyword, String materialType, Integer status);

    IPage<Material> getMaterialPageByConditions(MaterialQueryDTO queryDTO);

    void updateMaterialStatus(Long id, Integer status);

    void checkStockWarning();

    void updateStock(Long materialId, java.math.BigDecimal quantity, int type);
}
