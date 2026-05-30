package com.mining.maintenance.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mining.maintenance.dto.EquipmentCategoryDTO;
import com.mining.maintenance.entity.EquipmentCategory;

import java.util.List;

public interface EquipmentCategoryService extends IService<EquipmentCategory> {

    void addCategory(EquipmentCategoryDTO dto);

    void updateCategory(EquipmentCategoryDTO dto);

    void deleteCategory(Long id);

    List<EquipmentCategory> treeList();

    List<EquipmentCategory> treeListByType(String categoryType);

    void offlineCategory(Long id);

    void onlineCategory(Long id);

    void updateSort(Long id, Integer sortOrder);
}