package com.firecontrol.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.firecontrol.common.PageQuery;
import com.firecontrol.dto.MaterialDTO;
import com.firecontrol.dto.MaterialStockInDTO;
import com.firecontrol.entity.Material;
import com.firecontrol.entity.MaterialBatch;
import com.firecontrol.entity.MaterialStockRecord;

import java.math.BigDecimal;
import java.util.List;

public interface MaterialService {

    void addMaterial(MaterialDTO dto);

    void updateMaterial(MaterialDTO dto);

    void deleteMaterial(Long id);

    Material getMaterialById(Long id);

    IPage<Material> getMaterialPage(MaterialDTO dto, PageQuery pageQuery);

    List<Material> getWarningStockList();

    List<Material> getRecheckSoonList();

    void stockIn(MaterialStockInDTO dto);

    void stockOut(Long workOrderId, Long materialId, Long batchId, BigDecimal quantity, String remark);

    void stockReturn(Long workOrderId, Long materialId, Long batchId, BigDecimal quantity, String remark);

    String generateBatchCode(String materialCode);

    void updateRecheckStatus(Long batchId, Integer status, String remark);

    List<MaterialBatch> getMaterialBatches(Long materialId);

    IPage<MaterialStockRecord> getStockRecordPage(Long materialId, Integer recordType, PageQuery pageQuery);

    List<Material> searchMaterials(String keyword, String materialType, Integer stockStatus);
}
