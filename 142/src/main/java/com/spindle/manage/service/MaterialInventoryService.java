package com.spindle.manage.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.spindle.manage.dto.MaterialOutDTO;
import com.spindle.manage.dto.MaterialQueryDTO;
import com.spindle.manage.entity.MaterialInventory;

import java.math.BigDecimal;
import java.util.List;

public interface MaterialInventoryService extends IService<MaterialInventory> {

    IPage<MaterialInventory> getMaterialPage(Page<MaterialInventory> page, String materialName, String materialType, Integer inventoryStatus);

    IPage<MaterialInventory> queryByConditions(Page<MaterialInventory> page, MaterialQueryDTO dto);

    boolean addMaterial(MaterialInventory material);

    boolean updateMaterial(MaterialInventory material);

    boolean updateInventoryStatus(Long id, Integer status);

    boolean materialOut(MaterialOutDTO dto);

    boolean materialIn(Long id, BigDecimal quantity, String remark);

    boolean batchMaterialIn(List<MaterialOutDTO> list);

    boolean batchMaterialOut(List<MaterialOutDTO> list);

    boolean prepareMaterialForOrder(Long orderId);

    boolean lockInventory(Long orderId, Long materialId, BigDecimal quantity, String remark);

    boolean releaseInventory(Long orderId, Long materialId);

    BigDecimal getAvailableQuantity(Long materialId);

    void checkStockWarning();

    void checkConstantTempExpire();

}
