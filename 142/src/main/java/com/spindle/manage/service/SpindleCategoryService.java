package com.spindle.manage.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.spindle.manage.entity.SpindleCategory;
import com.spindle.manage.vo.CategoryTreeVO;

import java.util.List;

public interface SpindleCategoryService extends IService<SpindleCategory> {

    List<CategoryTreeVO> getCategoryTree();

    boolean addCategory(SpindleCategory category);

    boolean updateCategory(SpindleCategory category);

    boolean offlineCategory(Long id);

    boolean updatePriority(Long id, Integer sort);

}
