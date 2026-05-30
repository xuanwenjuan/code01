package com.woodendoor.production;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.woodendoor.production.mapper")
public class WoodenDoorProductionApplication {

    public static void main(String[] args) {
        SpringApplication.run(WoodenDoorProductionApplication.class, args);
    }

}