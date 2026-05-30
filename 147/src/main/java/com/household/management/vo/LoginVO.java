package com.household.management.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@Schema(description = "登录响应VO")
public class LoginVO {

    @Schema(description = "Token")
    private String token;

    @Schema(description = "用户信息")
    private UserInfoVO userInfo;
}
