package com.fastener.production.service.material;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.fastener.production.common.entity.PageQuery;
import com.fastener.production.entity.material.MaterialBatch;
import com.fastener.production.entity.material.dto.MaterialInboundDTO;
import com.fastener.production.entity.material.dto.MaterialOutboundDTO;

import java.math.BigDecimal;
import java.util.List;

public interface MaterialBatchService extends IService<MaterialBatch> {

    IPage<MaterialBatch> page(PageQuery pageQuery, Long materialId, String batchCode, Integer status);

    List<MaterialBatch> getAvailableBatches(Long materialId);

    BigDecimal getAvailableQuantity(Long materialId);

    String generateBatchCode(Long materialId);

    void inbound(MaterialInboundDTO dto);

    void outbound(MaterialOutboundDTO dto);
}
