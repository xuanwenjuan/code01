package com.camping;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.camping.mapper")
public class CampingDistributionApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampingDistributionApplication.class, args);
    }
}
