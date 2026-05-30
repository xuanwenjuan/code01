package com.aromatherapy;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.aromatherapy.mapper")
public class AromaSupplyApplication {

    public static void main(String[] args) {
        SpringApplication.run(AromaSupplyApplication.class, args);
    }

}
