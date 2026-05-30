package com.cosmetics.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cosmetics.common.PageQuery;
import com.cosmetics.entity.Formula;
import com.cosmetics.entity.FormulaDetail;

import java.util.List;

public interface FormulaService {

    Page<Formula> getPage(PageQuery pageQuery, Long productId, Integer status);

    Formula getById(Long id);

    List<FormulaDetail> getDetailsByFormulaId(Long formulaId);

    void add(Formula formula, List<FormulaDetail> details);

    void update(Formula formula, List<FormulaDetail> details);

    void delete(Long id);

    void updateStatus(Long id, Integer status);
}
