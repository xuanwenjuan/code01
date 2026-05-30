package com.construction.material;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.construction.material.mapper")
public class MaterialManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(MaterialManagementApplication.class, args);
    }
}
