package com.hydraulic.piston.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hydraulic.piston.entity.sys.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
