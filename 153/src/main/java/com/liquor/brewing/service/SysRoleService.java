package com.liquor.brewing.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.liquor.brewing.entity.SysRole;

import java.util.List;

public interface SysRoleService extends IService<SysRole> {

    List<SysRole> listAll();
}
