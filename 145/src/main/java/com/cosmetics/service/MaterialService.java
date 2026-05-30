package com.cosmetics.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cosmetics.common.PageQuery;
import com.cosmetics.dto.MaterialQueryDTO;
import com.cosmetics.entity.Material;

import java.util.List;
import java.util.Map;

public interface MaterialService {

    Page<Material> getPage(PageQuery pageQuery, Integer type, String keyword, Integer status);

    Page<Material> getPageByConditions(PageQuery pageQuery, MaterialQueryDTO queryDTO);

    Material getById(Long id);

    void add(Material material);

    void update(Material material);

    void delete(Long id);

    void updateStatus(Long id, Integer status);

    List<Map<String, Object>> getMaterialStatistics();
}
