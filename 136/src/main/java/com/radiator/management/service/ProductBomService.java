package com.radiator.management.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.radiator.management.entity.ProductBom;
import com.radiator.management.entity.ProductBomDetail;
import com.radiator.management.exception.BusinessException;
import com.radiator.management.mapper.ProductBomDetailMapper;
import com.radiator.management.mapper.ProductBomMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductBomService {

    private final ProductBomMapper bomMapper;
    private final ProductBomDetailMapper detailMapper;

    @Transactional(rollbackFor = Exception.class)
    public void createBom(ProductBom bom) {
        LambdaQueryWrapper<ProductBom> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductBom::getBomCode, bom.getBomCode());
        if (bomMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("BOM编码已存在");
        }

        bom.setStatus(1);
        bomMapper.insert(bom);

        if (bom.getDetails() != null) {
            int sort = 1;
            for (ProductBomDetail detail : bom.getDetails()) {
                detail.setBomId(bom.getId());
                detail.setSortOrder(sort++);
                detailMapper.insert(detail);
            }
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateBom(ProductBom bom) {
        ProductBom existing = bomMapper.selectById(bom.getId());
        if (existing == null) {
            throw new BusinessException("BOM不存在");
        }

        detailMapper.delete(
                new LambdaQueryWrapper<ProductBomDetail>().eq(ProductBomDetail::getBomId, bom.getId())
        );

        if (bom.getDetails() != null) {
            int sort = 1;
            for (ProductBomDetail detail : bom.getDetails()) {
                detail.setBomId(bom.getId());
                detail.setSortOrder(sort++);
                detailMapper.insert(detail);
            }
        }

        bomMapper.updateById(bom);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteBom(Long id) {
        ProductBom bom = bomMapper.selectById(id);
        if (bom == null) {
            throw new BusinessException("BOM不存在");
        }
        bom.setStatus(0);
        bomMapper.updateById(bom);
    }

    public Page<ProductBom> listBoms(int page, int size, Long categoryId, String keyword) {
        LambdaQueryWrapper<ProductBom> wrapper = new LambdaQueryWrapper<>();
        if (categoryId != null) {
            wrapper.eq(ProductBom::getCategoryId, categoryId);
        }
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(ProductBom::getBomCode, keyword)
                    .or().like(ProductBom::getBomName, keyword));
        }
        wrapper.eq(ProductBom::getStatus, 1)
                .orderByDesc(ProductBom::getCreateTime);
        return bomMapper.selectPage(new Page<>(page, size), wrapper);
    }

    public ProductBom getBomById(Long id) {
        ProductBom bom = bomMapper.selectById(id);
        if (bom != null) {
            List<ProductBomDetail> details = detailMapper.selectList(
                    new LambdaQueryWrapper<ProductBomDetail>()
                            .eq(ProductBomDetail::getBomId, id)
                            .orderByAsc(ProductBomDetail::getSortOrder)
            );
            bom.setDetails(details);
        }
        return bom;
    }

    public ProductBom getBomByCategoryId(Long categoryId) {
        ProductBom bom = bomMapper.selectOne(
                new LambdaQueryWrapper<ProductBom>()
                        .eq(ProductBom::getCategoryId, categoryId)
                        .eq(ProductBom::getStatus, 1)
                        .orderByDesc(ProductBom::getVersion)
                        .last("LIMIT 1")
        );
        if (bom != null) {
            List<ProductBomDetail> details = detailMapper.selectList(
                    new LambdaQueryWrapper<ProductBomDetail>()
                            .eq(ProductBomDetail::getBomId, bom.getId())
                            .orderByAsc(ProductBomDetail::getSortOrder)
            );
            bom.setDetails(details);
        }
        return bom;
    }

    public List<ProductBomDetail> getBomDetails(Long bomId) {
        return detailMapper.selectList(
                new LambdaQueryWrapper<ProductBomDetail>()
                        .eq(ProductBomDetail::getBomId, bomId)
                        .orderByAsc(ProductBomDetail::getSortOrder)
        );
    }
}
