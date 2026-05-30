package com.spindle.manage.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.spindle.manage.dto.LoginDTO;
import com.spindle.manage.entity.SysUser;
import com.spindle.manage.vo.LoginVO;

public interface SysUserService extends IService<SysUser> {

    LoginVO login(LoginDTO loginDTO);

}
