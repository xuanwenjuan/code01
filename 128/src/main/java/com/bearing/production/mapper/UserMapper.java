package com.bearing.production.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.bearing.production.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
