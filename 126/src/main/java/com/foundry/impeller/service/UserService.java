package com.foundry.impeller.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.foundry.impeller.entity.User;
import com.foundry.impeller.enums.UserRole;
import com.foundry.impeller.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;

    public Page<User> list(int page, int size, String role) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (role != null && !role.isEmpty()) {
            wrapper.eq(User::getRole, role);
        }
        wrapper.orderByDesc(User::getCreateTime);
        return userMapper.selectPage(new Page<>(page, size), wrapper);
    }

    public List<User> listByRole(String role) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getRole, role)
                .eq(User::getStatus, 1);
        return userMapper.selectList(wrapper);
    }

    public User getById(Long id) {
        return userMapper.selectById(id);
    }

    public void update(User user) {
        userMapper.updateById(user);
    }

    public void delete(Long id) {
        userMapper.deleteById(id);
    }

    public List<User> getProcessUsers() {
        return listByRole(UserRole.PROCESS.getCode());
    }

    public List<User> getTeamLeaders() {
        return listByRole(UserRole.TEAM_LEADER.getCode());
    }

    public List<User> getInspectors() {
        return listByRole(UserRole.INSPECTOR.getCode());
    }
}
