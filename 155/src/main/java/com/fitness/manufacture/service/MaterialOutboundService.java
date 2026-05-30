package com.fitness.manufacture.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.fitness.manufacture.common.PageQuery;
import com.fitness.manufacture.dto.MaterialOutboundDTO;
import com.fitness.manufacture.dto.MaterialOutboundQueryDTO;
import com.fitness.manufacture.entity.MaterialOutbound;

public interface MaterialOutboundService extends IService<MaterialOutbound> {

    void saveOutbound(MaterialOutboundDTO dto);

    void auditOutbound(Long id, Integer status, String remark);

    IPage<MaterialOutbound> getOutboundPage(PageQuery query, Long materialId, Long workOrderId, Integer status);

    IPage<MaterialOutbound> getOutboundPageByConditions(MaterialOutboundQueryDTO queryDTO);

    String generateOutboundNo();
}
