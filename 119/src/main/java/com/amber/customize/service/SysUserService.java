package com.amber.customize.service;

import com.amber.customize.dto.LoginDTO;
import com.amber.customize.entity.SysUser;
import com.amber.customize.enums.RoleEnum;
import com.amber.customize.exception.BusinessException;
import com.amber.customize.mapper.SysUserMapper;
import com.amber.customize.util.BeanConvertUtil;
import com.amber.customize.util.JwtUtil;
import com.amber.customize.vo.LoginUserVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SysUserService extends ServiceImpl<SysUserMapper, SysUser> {

    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Map<String, Object> login(LoginDTO dto) {
        SysUser user = getOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, dto.getUsername()));
        if (user == null) {
            throw new BusinessException("用户名或密码错误");
        }
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }
        if (user.getStatus() == 0) {
            throw new BusinessException("账号已被禁用");
        }
        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());
        LoginUserVO userVO = convertToVO(user);
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("user", userVO);
        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    public void register(SysUser user) {
        SysUser exist = getOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, user.getUsername()));
        if (exist != null) {
            throw new BusinessException("用户名已存在");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getStatus() == null) {
            user.setStatus(1);
        }
        save(user);
    }

    public LoginUserVO getCurrentUserInfo(Long userId) {
        SysUser user = getById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        return convertToVO(user);
    }

    private LoginUserVO convertToVO(SysUser user) {
        LoginUserVO vo = BeanConvertUtil.convert(user, LoginUserVO::new);
        vo.setRoleDesc(RoleEnum.getDescByCode(user.getRole()));
        return vo;
    }

}
