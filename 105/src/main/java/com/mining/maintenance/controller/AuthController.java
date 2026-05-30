package com.mining.maintenance.controller;

import com.mining.maintenance.common.Result;
import com.mining.maintenance.constant.RoleConstant;
import com.mining.maintenance.context.UserContext;
import com.mining.maintenance.dto.LoginDTO;
import com.mining.maintenance.service.AuthService;
import com.mining.maintenance.vo.LoginVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String TOKEN_HEADER = "Authorization";
    private static final String TOKEN_PREFIX = "Bearer ";
    private static final String TOKEN_BLACKLIST_PREFIX = "token:blacklist:";

    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO dto) {
        return Result.success(authService.login(dto));
    }

    @PostMapping("/logout")
    public Result<Void> logout(HttpServletRequest request) {
        String token = request.getHeader(TOKEN_HEADER);
        if (token != null && token.startsWith(TOKEN_PREFIX)) {
            token = token.substring(TOKEN_PREFIX.length());
            redisTemplate.opsForValue().set(TOKEN_BLACKLIST_PREFIX + token, 1, 24, TimeUnit.HOURS);
        }
        return Result.success();
    }

    @GetMapping("/info")
    public Result<UserContext.CurrentUser> getUserInfo() {
        return Result.success(UserContext.getUser());
    }
}