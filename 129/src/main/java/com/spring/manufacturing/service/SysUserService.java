package com.spring.manufacturing.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.spring.manufacturing.dto.LoginDTO;
import com.spring.manufacturing.entity.SysUser;

import java.util.Map;

public interface SysUserService extends IService<SysUser> {

    Map<String, Object> login(LoginDTO loginDTO);

    void register(SysUser user);

    SysUser getByUsername(String username);

    Object getUserIdFromToken(String token);
}