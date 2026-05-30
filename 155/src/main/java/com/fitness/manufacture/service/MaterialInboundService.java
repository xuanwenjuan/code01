package com.fitness.manufacture.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.fitness.manufacture.common.PageQuery;
import com.fitness.manufacture.dto.MaterialInboundDTO;
import com.fitness.manufacture.dto.MaterialInboundQueryDTO;
import com.fitness.manufacture.entity.MaterialInbound;

public interface MaterialInboundService extends IService<MaterialInbound> {

    void saveInbound(MaterialInboundDTO dto);

    void auditInbound(Long id, Integer status, String remark);

    IPage<MaterialInbound> getInboundPage(PageQuery query, Long materialId, Integer status);

    IPage<MaterialInbound> getInboundPageByConditions(MaterialInboundQueryDTO queryDTO);

    String generateInboundNo();
}
