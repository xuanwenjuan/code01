package com.bee.equipment.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.bee.equipment.dto.LoginDTO;
import com.bee.equipment.dto.RegisterDTO;
import com.bee.equipment.entity.SysUser;

public interface SysUserService extends IService<SysUser> {

    SysUser login(LoginDTO loginDTO);

    void register(RegisterDTO registerDTO);

    SysUser getUserById(Long userId);
}
