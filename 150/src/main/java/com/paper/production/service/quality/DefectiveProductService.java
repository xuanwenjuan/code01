package com.paper.production.service.quality;

import com.baomidou.mybatisplus.extension.service.IService;
import com.paper.production.common.PageQuery;
import com.paper.production.common.PageResult;
import com.paper.production.dto.quality.DefectiveProductDTO;
import com.paper.production.entity.quality.DefectiveProduct;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface DefectiveProductService extends IService<DefectiveProduct> {

    void saveDefective(DefectiveProductDTO dto);

    void updateDefective(DefectiveProductDTO dto);

    void deleteDefective(Long id);

    PageResult<DefectiveProduct> queryPage(PageQuery query);

    List<DefectiveProduct> getByWorkOrderId(Long workOrderId);

    Map<String, Object> getDefectiveStatistics(LocalDate startDate, LocalDate endDate);

    Map<String, Object> getProcessDefectiveRate(Long workOrderId);
}
