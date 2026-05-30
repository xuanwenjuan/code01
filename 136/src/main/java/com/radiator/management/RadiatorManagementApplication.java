package com.radiator.management;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.radiator.management.mapper")
public class RadiatorManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(RadiatorManagementApplication.class, args);
    }
}