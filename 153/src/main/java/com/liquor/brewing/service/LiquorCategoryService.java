package com.liquor.brewing.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.liquor.brewing.entity.LiquorCategory;

import java.util.List;

public interface LiquorCategoryService extends IService<LiquorCategory> {

    List<LiquorCategory> tree();

    void add(LiquorCategory category);

    void update(LiquorCategory category);

    void delete(Long id);

    void updateStatus(Long id, Integer status);
}
