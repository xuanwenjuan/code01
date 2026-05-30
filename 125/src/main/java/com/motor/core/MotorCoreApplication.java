package com.motor.core;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.motor.core.mapper")
public class MotorCoreApplication {
    public static void main(String[] args) {
        SpringApplication.run(MotorCoreApplication.class, args);
    }
}
