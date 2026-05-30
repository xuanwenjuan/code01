package com.amber.polish.service;

import com.amber.polish.dto.LoginDTO;
import com.amber.polish.entity.User;
import com.amber.polish.vo.LoginVO;
import com.baomidou.mybatisplus.extension.service.IService;

public interface UserService extends IService<User> {

    LoginVO login(LoginDTO loginDTO);

    User getByUsername(String username);
}
