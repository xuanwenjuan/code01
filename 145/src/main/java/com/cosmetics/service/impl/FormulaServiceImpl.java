package com.cosmetics.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cosmetics.common.PageQuery;
import com.cosmetics.common.ResultCode;
import com.cosmetics.entity.Formula;
import com.cosmetics.entity.FormulaDetail;
import com.cosmetics.exception.BusinessException;
import com.cosmetics.mapper.FormulaDetailMapper;
import com.cosmetics.mapper.FormulaMapper;
import com.cosmetics.service.FormulaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FormulaServiceImpl implements FormulaService {

    private final FormulaMapper formulaMapper;
    private final FormulaDetailMapper formulaDetailMapper;

    @Override
    public Page<Formula> getPage(PageQuery pageQuery, Long productId, Integer status) {
        LambdaQueryWrapper<Formula> wrapper = new LambdaQueryWrapper<>();
        if (productId != null) {
            wrapper.eq(Formula::getProductId, productId);
        }
        if (status != null) {
            wrapper.eq(Formula::getStatus, status);
        }
        wrapper.orderByDesc(Formula::getCreateTime);

        return formulaMapper.selectPage(
                new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()),
                wrapper
        );
    }

    @Override
    public Formula getById(Long id) {
        return formulaMapper.selectById(id);
    }

    @Override
    public List<FormulaDetail> getDetailsByFormulaId(Long formulaId) {
        return formulaDetailMapper.selectList(
                new LambdaQueryWrapper<FormulaDetail>()
                        .eq(FormulaDetail::getFormulaId, formulaId)
                        .orderByAsc(FormulaDetail::getSortOrder)
        );
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void add(Formula formula, List<FormulaDetail> details) {
        Long count = formulaMapper.selectCount(
                new LambdaQueryWrapper<Formula>()
                        .eq(Formula::getFormulaCode, formula.getFormulaCode())
        );
        if (count > 0) {
            throw new BusinessException(ResultCode.DATA_ALREADY_EXISTS.getCode(), "配方编码已存在");
        }
        if (formula.getStatus() == null) {
            formula.setStatus(1);
        }
        formulaMapper.insert(formula);

        if (details != null && !details.isEmpty()) {
            for (FormulaDetail detail : details) {
                detail.setFormulaId(formula.getId());
                formulaDetailMapper.insert(detail);
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(Formula formula, List<FormulaDetail> details) {
        Formula exist = formulaMapper.selectById(formula.getId());
        if (exist == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }
        if (!exist.getFormulaCode().equals(formula.getFormulaCode())) {
            Long count = formulaMapper.selectCount(
                    new LambdaQueryWrapper<Formula>()
                            .eq(Formula::getFormulaCode, formula.getFormulaCode())
                            .ne(Formula::getId, formula.getId())
            );
            if (count > 0) {
                throw new BusinessException(ResultCode.DATA_ALREADY_EXISTS.getCode(), "配方编码已存在");
            }
        }
        formulaMapper.updateById(formula);

        formulaDetailMapper.delete(
                new LambdaQueryWrapper<FormulaDetail>()
                        .eq(FormulaDetail::getFormulaId, formula.getId())
        );

        if (details != null && !details.isEmpty()) {
            for (FormulaDetail detail : details) {
                detail.setId(null);
                detail.setFormulaId(formula.getId());
                formulaDetailMapper.insert(detail);
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        formulaMapper.deleteById(id);
        formulaDetailMapper.delete(
                new LambdaQueryWrapper<FormulaDetail>()
                        .eq(FormulaDetail::getFormulaId, id)
        );
    }

    @Override
    public void updateStatus(Long id, Integer status) {
        Formula formula = new Formula();
        formula.setId(id);
        formula.setStatus(status);
        formulaMapper.updateById(formula);
    }
}
