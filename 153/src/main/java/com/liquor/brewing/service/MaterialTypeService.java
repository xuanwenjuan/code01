package com.liquor.brewing.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.liquor.brewing.entity.MaterialType;

import java.util.List;

public interface MaterialTypeService extends IService<MaterialType> {

    List<MaterialType> listAll();

    void add(MaterialType materialType);

    void update(MaterialType materialType);

    void delete(Long id);
}
