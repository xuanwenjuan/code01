package com.bee.equipment.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.bee.equipment.dto.MaterialDTO;
import com.bee.equipment.dto.MaterialQueryDTO;
import com.bee.equipment.entity.Material;
import com.bee.equipment.vo.MaterialVO;

import java.math.BigDecimal;

public interface MaterialService extends IService<Material> {

    Page<MaterialVO> queryByConditions(MaterialQueryDTO queryDTO);

    void addMaterial(MaterialDTO materialDTO);

    void updateMaterial(MaterialDTO materialDTO);

    void updateStatus(Long id, String status);

    void checkExpiryAndWarn();

    MaterialVO getDetailById(Long id);

    void lockStock(Long materialId, BigDecimal quantity, Long workOrderId);

    void unlockStock(Long materialId, BigDecimal quantity, Long workOrderId);
}
