package com.fastener.production.service.system;

import com.fastener.production.entity.system.dto.LoginDTO;
import com.fastener.production.entity.system.vo.LoginVO;

public interface AuthService {

    LoginVO login(LoginDTO dto);

    void logout();
}
