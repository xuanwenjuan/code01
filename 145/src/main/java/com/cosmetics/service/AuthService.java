package com.cosmetics.service;

import com.cosmetics.dto.LoginDTO;
import com.cosmetics.vo.LoginVO;

public interface AuthService {

    LoginVO login(LoginDTO loginDTO);

    void logout();
}
