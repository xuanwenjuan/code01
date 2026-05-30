package com.heritage.dye;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.heritage.dye.mapper")
public class DyeSupplyManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(DyeSupplyManagementApplication.class, args);
    }
}
