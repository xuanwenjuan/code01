package com.spring.manufacturing;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("com.spring.manufacturing.mapper")
@EnableScheduling
public class SpringManufacturingApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringManufacturingApplication.class, args);
    }
}