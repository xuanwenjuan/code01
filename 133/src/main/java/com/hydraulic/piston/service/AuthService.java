package com.hydraulic.piston.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.hydraulic.piston.dto.LoginDTO;
import com.hydraulic.piston.dto.RegisterDTO;
import com.hydraulic.piston.entity.sys.Role;
import com.hydraulic.piston.entity.sys.User;
import com.hydraulic.piston.exception.BusinessException;
import com.hydraulic.piston.mapper.RoleMapper;
import com.hydraulic.piston.mapper.UserMapper;
import com.hydraulic.piston.util.JwtUtil;
import com.hydraulic.piston.vo.LoginVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserMapper userMapper;
    private final RoleMapper roleMapper;
    private final JwtUtil jwtUtil;

    public LoginVO login(LoginDTO dto) {
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>()
                        .eq(User::getUsername, dto.getUsername())
        );

        if (user == null) {
            throw new BusinessException("用户名或密码错误");
        }

        String md5Password = DigestUtils.md5DigestAsHex(dto.getPassword().getBytes(StandardCharsets.UTF_8));
        if (!md5Password.equals(user.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }

        if (user.getStatus() == 0) {
            throw new BusinessException("账号已被禁用");
        }

        Role role = roleMapper.selectById(user.getRoleId());
        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRoleId());

        LoginVO vo = new LoginVO();
        vo.setUserId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setRealName(user.getRealName());
        vo.setToken(token);
        vo.setRoleId(user.getRoleId());
        vo.setRoleName(role != null ? role.getRoleName() : "");
        return vo;
    }

    public void register(RegisterDTO dto) {
        User existUser = userMapper.selectOne(
                new LambdaQueryWrapper<User>()
                        .eq(User::getUsername, dto.getUsername())
        );

        if (existUser != null) {
            throw new BusinessException("用户名已存在");
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        String md5Password = DigestUtils.md5DigestAsHex(dto.getPassword().getBytes(StandardCharsets.UTF_8));
        user.setPassword(md5Password);
        user.setRealName(dto.getRealName());
        user.setPhone(dto.getPhone());
        user.setEmail(dto.getEmail());
        user.setRoleId(dto.getRoleId());
        user.setStatus(1);
        userMapper.insert(user);
    }
}
