package com.stationery.manufacture;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
@MapperScan("com.stationery.manufacture.mapper")
public class StationeryManufactureApplication {

    public static void main(String[] args) {
        SpringApplication.run(StationeryManufactureApplication.class, args);
    }
}
