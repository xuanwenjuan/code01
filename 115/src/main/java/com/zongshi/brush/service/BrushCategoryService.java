package com.zongshi.brush.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zongshi.brush.dto.BrushCategoryDTO;
import com.zongshi.brush.entity.BrushCategory;
import com.zongshi.brush.vo.BrushCategoryTreeVO;

import java.util.List;

public interface BrushCategoryService extends IService<BrushCategory> {

    Long addCategory(BrushCategoryDTO dto);

    void updateCategory(BrushCategoryDTO dto);

    void deleteCategory(Long id);

    BrushCategory getCategoryById(Long id);

    List<BrushCategoryTreeVO> getCategoryTree(Integer status);

    void offlineCategory(Long id);

    void updateSort(List<BrushCategoryDTO> list);

    List<BrushCategory> getChildrenById(Long id);

    List<BrushCategory> getHotCategories();

    void incrementViewCount(Long id);
}
