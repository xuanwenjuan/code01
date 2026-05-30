package com.liquor.brewing.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.liquor.brewing.common.PageQuery;
import com.liquor.brewing.entity.MaterialBatch;

import java.util.List;

public interface MaterialBatchService extends IService<MaterialBatch> {

    IPage<MaterialBatch> page(Long materialId, Integer status, String batchCode, PageQuery pageQuery);

    List<MaterialBatch> getByMaterialId(Long materialId);
}
