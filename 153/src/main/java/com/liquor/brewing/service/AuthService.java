package com.liquor.brewing.service;

import com.liquor.brewing.dto.LoginDTO;
import com.liquor.brewing.vo.LoginVO;

public interface AuthService {

    LoginVO login(LoginDTO loginDTO);

    void logout();
}
