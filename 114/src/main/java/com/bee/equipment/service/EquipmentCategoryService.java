package com.bee.equipment.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.bee.equipment.dto.CategoryDTO;
import com.bee.equipment.entity.EquipmentCategory;
import com.bee.equipment.vo.EquipmentCategoryVO;

import java.util.List;

public interface EquipmentCategoryService extends IService<EquipmentCategory> {

    List<EquipmentCategoryVO> listWithTree();

    void addCategory(CategoryDTO categoryDTO);

    void updateCategory(CategoryDTO categoryDTO);

    void removeCategory(Long id);

    void updateStatus(Long id, Integer status);

    EquipmentCategoryVO getCategoryById(Long id);

    boolean isCategoryEnabled(Long id);
}
