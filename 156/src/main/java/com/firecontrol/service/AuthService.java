package com.firecontrol.service;

import com.firecontrol.dto.LoginDTO;
import com.firecontrol.vo.LoginVO;

public interface AuthService {

    LoginVO login(LoginDTO loginDTO);

    void logout();
}
