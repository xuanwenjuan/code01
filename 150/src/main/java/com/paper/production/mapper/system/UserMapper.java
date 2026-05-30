package com.paper.production.mapper.system;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.paper.production.entity.system.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
