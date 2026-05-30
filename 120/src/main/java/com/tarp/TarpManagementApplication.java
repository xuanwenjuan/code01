package com.tarp;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.tarp.mapper")
public class TarpManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(TarpManagementApplication.class, args);
    }
}
