package com.liquor.brewing.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.liquor.brewing.common.PageQuery;
import com.liquor.brewing.entity.MaterialBatch;
import com.liquor.brewing.mapper.MaterialBatchMapper;
import com.liquor.brewing.service.MaterialBatchService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class MaterialBatchServiceImpl extends ServiceImpl<MaterialBatchMapper, MaterialBatch> implements MaterialBatchService {

    @Override
    public IPage<MaterialBatch> page(Long materialId, Integer status, String batchCode, PageQuery pageQuery) {
        LambdaQueryWrapper<MaterialBatch> wrapper = new LambdaQueryWrapper<>();
        if (materialId != null) {
            wrapper.eq(MaterialBatch::getMaterialId, materialId);
        }
        if (status != null) {
            wrapper.eq(MaterialBatch::getStatus, status);
        }
        if (StrUtil.isNotBlank(batchCode)) {
            wrapper.like(MaterialBatch::getBatchCode, batchCode);
        }
        wrapper.orderByDesc(MaterialBatch::getCreateTime);
        IPage<MaterialBatch> page = baseMapper.selectBatchPage(new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()), wrapper);

        for (MaterialBatch batch : page.getRecords()) {
            if (batch.getExpireDate() != null) {
                batch.setDaysToExpire((int) ChronoUnit.DAYS.between(LocalDate.now(), batch.getExpireDate()));
            }
        }
        return page;
    }

    @Override
    public List<MaterialBatch> getByMaterialId(Long materialId) {
        return list(new LambdaQueryWrapper<MaterialBatch>()
                .eq(MaterialBatch::getMaterialId, materialId)
                .eq(MaterialBatch::getStatus, 1)
                .orderByAsc(MaterialBatch::getExpireDate));
    }
}
