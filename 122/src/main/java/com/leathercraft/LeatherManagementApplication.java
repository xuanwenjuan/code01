package com.leathercraft;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.leathercraft.mapper")
public class LeatherManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(LeatherManagementApplication.class, args);
    }

}
