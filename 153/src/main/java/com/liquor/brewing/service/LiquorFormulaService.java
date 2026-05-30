package com.liquor.brewing.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.liquor.brewing.common.PageQuery;
import com.liquor.brewing.entity.LiquorFormula;

public interface LiquorFormulaService extends IService<LiquorFormula> {

    IPage<LiquorFormula> page(String keyword, Long categoryId, Integer status, PageQuery pageQuery);

    void add(LiquorFormula formula);

    void update(LiquorFormula formula);

    void delete(Long id);

    void updateStatus(Long id, Integer status);
}
