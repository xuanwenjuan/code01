package com.liquor.brewing.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.liquor.brewing.common.PageQuery;
import com.liquor.brewing.dto.MaterialQueryDTO;
import com.liquor.brewing.entity.Material;
import com.liquor.brewing.entity.MaterialBatch;

import java.util.List;

public interface MaterialService extends IService<Material> {

    IPage<Material> page(String keyword, Long typeId, Integer status, PageQuery pageQuery);

    IPage<Material> pageByCondition(MaterialQueryDTO query, PageQuery pageQuery);

    void add(Material material);

    void update(Material material);

    void delete(Long id);

    void updateStatus(Long id, Integer status);

    void stockIn(MaterialBatch batch);

    void stockOut(Long batchId, java.math.BigDecimal quantity, Long workOrderId, String remark);

    List<MaterialBatch> getExpireWarning();

    void batchUpdateStatus(List<Long> ids, Integer status);

    void batchDelete(List<Long> ids);
}
