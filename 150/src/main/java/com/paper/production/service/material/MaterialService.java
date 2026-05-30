package com.paper.production.service.material;

import com.baomidou.mybatisplus.extension.service.IService;
import com.paper.production.common.PageQuery;
import com.paper.production.common.PageResult;
import com.paper.production.dto.material.MaterialDTO;
import com.paper.production.dto.material.MaterialInboundDTO;
import com.paper.production.dto.material.MaterialOutboundDTO;
import com.paper.production.dto.material.MaterialQueryDTO;
import com.paper.production.entity.material.Material;
import com.paper.production.entity.material.MaterialBatch;
import com.paper.production.entity.material.MaterialInbound;
import com.paper.production.entity.material.MaterialOutbound;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface MaterialService extends IService<Material> {

    void saveMaterial(MaterialDTO dto);

    void updateMaterial(MaterialDTO dto);

    void deleteMaterial(Long id);

    PageResult<Material> queryMaterialPage(PageQuery query);

    void inbound(MaterialInboundDTO dto);

    void outbound(MaterialOutboundDTO dto);

    List<MaterialBatch> getMaterialBatches(Long materialId);

    void updateStatus(Long id, Integer status);

    void checkStockWarning();

    List<Material> getWarningMaterials();

    List<Material> getMoistureProofExpiring();

    PageResult<MaterialInbound> queryInboundPage(PageQuery query);

    PageResult<MaterialOutbound> queryOutboundPage(PageQuery query);

    Map<String, Object> getMaterialStatistics();

    List<Material> listByType(String materialType);

    List<MaterialBatch> getBatchList();

    PageResult<MaterialBatch> queryBatchPage(PageQuery query);

    Map<String, Object> getInboundStatistics(LocalDate startDate, LocalDate endDate);

    Map<String, Object> getOutboundStatistics(LocalDate startDate, LocalDate endDate);

    PageResult<Material> queryMaterialByConditions(MaterialQueryDTO query);

    void lockStock(Long workOrderId, Long materialId, String batchNo, java.math.BigDecimal quantity, String operator);

    void releaseStock(Long workOrderId, Long materialId);

    void releaseAllStockByWorkOrder(Long workOrderId);

    java.util.List<com.paper.production.entity.material.MaterialStockLock> getStockLocksByWorkOrder(Long workOrderId);
}
