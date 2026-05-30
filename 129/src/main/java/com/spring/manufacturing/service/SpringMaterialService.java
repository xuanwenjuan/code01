package com.spring.manufacturing.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.spring.manufacturing.dto.MaterialInboundDTO;
import com.spring.manufacturing.dto.MaterialQueryDTO;
import com.spring.manufacturing.entity.SpringMaterial;

import java.math.BigDecimal;
import java.util.List;

public interface SpringMaterialService extends IService<SpringMaterial> {

    void inboundMaterial(MaterialInboundDTO dto, Long operatorId);

    IPage<SpringMaterial> queryMaterialPage(MaterialQueryDTO queryDTO);

    List<SpringMaterial> getWarningMaterials();

    boolean lockMaterial(Long materialId, Long workOrderId, String workOrderNo,
                         BigDecimal lockQuantity, Long operatorId);

    boolean releaseMaterial(Long materialId, Long workOrderId, Long operatorId);

    boolean consumeMaterial(Long materialId, Long workOrderId, BigDecimal consumeQuantity, Long operatorId);
}