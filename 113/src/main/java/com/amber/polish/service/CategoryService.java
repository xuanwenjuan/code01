package com.amber.polish.service;

import com.amber.polish.entity.Category;
import com.amber.polish.vo.CategoryTreeVO;
import com.baomidou.mybatisplus.extension.service.IService;

import java.util.List;

public interface CategoryService extends IService<Category> {

    List<CategoryTreeVO> getCategoryTree();

    List<CategoryTreeVO> getHotCategoryTree();

    boolean addCategory(Category category);

    boolean updateCategory(Category category);

    boolean deleteCategory(Long id);
}
