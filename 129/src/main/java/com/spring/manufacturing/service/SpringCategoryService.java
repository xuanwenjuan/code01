package com.spring.manufacturing.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.spring.manufacturing.entity.SpringCategory;
import com.spring.manufacturing.vo.CategoryTreeVO;

import java.util.List;

public interface SpringCategoryService extends IService<SpringCategory> {

    List<CategoryTreeVO> getCategoryTree();

    void addCategory(SpringCategory category);

    void updateCategory(SpringCategory category);

    void deleteCategory(Long id);

    void offlineCategory(Long id);

    boolean isCategoryOffline(Long categoryId);
}