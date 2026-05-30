package com.paper.production.service.system;

import com.baomidou.mybatisplus.extension.service.IService;
import com.paper.production.dto.system.LoginDTO;
import com.paper.production.dto.system.UserRegisterDTO;
import com.paper.production.entity.system.User;

import java.util.Map;

public interface UserService extends IService<User> {

    Map<String, Object> login(LoginDTO loginDTO);

    void register(UserRegisterDTO registerDTO);

    User getUserInfo();
}
