package com.mining.maintenance.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mining.maintenance.dto.EquipmentAssetDTO;
import com.mining.maintenance.entity.EquipmentAsset;

import java.util.List;

public interface EquipmentAssetService extends IService<EquipmentAsset> {

    void addEquipment(EquipmentAssetDTO dto);

    void updateEquipment(EquipmentAssetDTO dto);

    void deleteEquipment(Long id);

    Page<EquipmentAsset> pageQuery(int page, int size, String miningArea, String status, String keyword);

    List<EquipmentAsset> getWarningList();

    void updateStatus(Long id, String status);

    void refreshMaintenanceDate(Long id);
}