package com.fishing.distribution;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.fishing.distribution.mapper")
public class FishingDistributionApplication {

    public static void main(String[] args) {
        SpringApplication.run(FishingDistributionApplication.class, args);
    }
}
