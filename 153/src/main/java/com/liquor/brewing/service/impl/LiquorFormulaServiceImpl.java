package com.liquor.brewing.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.liquor.brewing.common.Constants;
import com.liquor.brewing.common.PageQuery;
import com.liquor.brewing.entity.LiquorFormula;
import com.liquor.brewing.exception.BusinessException;
import com.liquor.brewing.mapper.LiquorFormulaMapper;
import com.liquor.brewing.service.LiquorFormulaService;
import com.liquor.brewing.util.CodeGenerator;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

@Service
public class LiquorFormulaServiceImpl extends ServiceImpl<LiquorFormulaMapper, LiquorFormula> implements LiquorFormulaService {

    @Resource
    private CodeGenerator codeGenerator;

    @Override
    public IPage<LiquorFormula> page(String keyword, Long categoryId, Integer status, PageQuery pageQuery) {
        LambdaQueryWrapper<LiquorFormula> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(LiquorFormula::getFormulaName, keyword)
                    .or().like(LiquorFormula::getFormulaCode, keyword));
        }
        if (categoryId != null) {
            wrapper.eq(LiquorFormula::getCategoryId, categoryId);
        }
        if (status != null) {
            wrapper.eq(LiquorFormula::getStatus, status);
        }
        wrapper.orderByDesc(LiquorFormula::getPriority, LiquorFormula::getCreateTime);
        return baseMapper.selectFormulaPage(new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()), wrapper);
    }

    @Override
    public void add(LiquorFormula formula) {
        formula.setFormulaCode(codeGenerator.generateMaterialCode());
        formula.setStatus(Constants.Status.ENABLE);
        save(formula);
    }

    @Override
    public void update(LiquorFormula formula) {
        LiquorFormula exist = getById(formula.getId());
        if (exist == null) {
            throw new BusinessException("配方不存在");
        }
        updateById(formula);
    }

    @Override
    public void delete(Long id) {
        removeById(id);
    }

    @Override
    public void updateStatus(Long id, Integer status) {
        LiquorFormula formula = new LiquorFormula();
        formula.setId(id);
        formula.setStatus(status);
        updateById(formula);
    }
}
