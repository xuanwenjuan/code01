package com.gear.mfg;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.gear.mfg.mapper")
public class GearManufactureApplication {

    public static void main(String[] args) {
        SpringApplication.run(GearManufactureApplication.class, args);
    }

}