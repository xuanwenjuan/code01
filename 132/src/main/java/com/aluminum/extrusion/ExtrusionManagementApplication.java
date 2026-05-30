package com.aluminum.extrusion;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.aluminum.extrusion.mapper")
public class ExtrusionManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExtrusionManagementApplication.class, args);
    }
}
