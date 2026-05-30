package com.fitness.manufacture.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fitness.manufacture.common.BusinessException;
import com.fitness.manufacture.common.ResultCode;
import com.fitness.manufacture.common.UserContext;
import com.fitness.manufacture.common.UserContextHolder;
import com.fitness.manufacture.dto.LoginDTO;
import com.fitness.manufacture.entity.SysUser;
import com.fitness.manufacture.mapper.SysUserMapper;
import com.fitness.manufacture.service.AuthService;
import com.fitness.manufacture.utils.JwtUtil;
import com.fitness.manufacture.vo.LoginVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final SysUserMapper sysUserMapper;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${jwt.expiration}")
    private Long expiration;

    private static final String LOGIN_USER_KEY = "login:user:";

    @Override
    public LoginVO login(LoginDTO loginDTO) {
        SysUser user = sysUserMapper.selectOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, loginDTO.getUsername()));

        if (user == null) {
            throw new BusinessException(ResultCode.LOGIN_USER_NOT_EXIST);
        }

        if (user.getStatus() == 0) {
            throw new BusinessException(ResultCode.LOGIN_USER_DISABLED);
        }

        String password = DigestUtils.md5DigestAsHex(loginDTO.getPassword().getBytes());
        if (!password.equals(user.getPassword())) {
            throw new BusinessException(ResultCode.LOGIN_PASSWORD_ERROR);
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getPostCode());

        List<String> roleCodes = sysUserMapper.selectRoleCodesByUserId(user.getId());
        List<String> permissions = sysUserMapper.selectPermissionsByUserId(user.getId());

        user.setLastLoginTime(LocalDateTime.now());
        sysUserMapper.updateById(user);

        UserContext userContext = new UserContext();
        userContext.setUserId(user.getId());
        userContext.setUsername(user.getUsername());
        userContext.setRealName(user.getRealName());
        userContext.setPostCode(user.getPostCode());
        userContext.setRoleCodes(roleCodes);
        userContext.setPermissions(permissions);
        userContext.setToken(token);
        UserContextHolder.setUserContext(userContext);

        redisTemplate.opsForValue().set(LOGIN_USER_KEY + user.getId(), userContext, 2, TimeUnit.HOURS);

        LoginVO loginVO = new LoginVO();
        loginVO.setUserId(user.getId());
        loginVO.setUsername(user.getUsername());
        loginVO.setRealName(user.getRealName());
        loginVO.setAvatar(user.getAvatar());
        loginVO.setPostCode(user.getPostCode());
        loginVO.setPostName(getPostName(user.getPostCode()));
        loginVO.setRoleCodes(roleCodes);
        loginVO.setPermissions(permissions);
        loginVO.setToken(token);
        loginVO.setTokenType("Bearer");
        loginVO.setExpiresIn(expiration / 1000);

        return loginVO;
    }

    @Override
    public void logout() {
        Long userId = UserContextHolder.getUserId();
        if (userId != null) {
            redisTemplate.delete(LOGIN_USER_KEY + userId);
        }
        UserContextHolder.clear();
    }

    private String getPostName(String postCode) {
        Map<String, String> postMap = new HashMap<>();
        postMap.put("PURCHASE", "物料采购员");
        postMap.put("PROCESS", "结构工艺员");
        postMap.put("LINE_LEADER", "产线组长");
        postMap.put("QC", "安全质检员");
        postMap.put("ADMIN", "系统管理员");
        return postMap.getOrDefault(postCode, "未知岗位");
    }
}
