package com.fitness.manufacture.service;

import com.fitness.manufacture.dto.LoginDTO;
import com.fitness.manufacture.vo.LoginVO;

public interface AuthService {

    LoginVO login(LoginDTO loginDTO);

    void logout();
}
