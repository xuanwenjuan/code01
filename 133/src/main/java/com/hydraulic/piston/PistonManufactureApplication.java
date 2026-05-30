package com.hydraulic.piston;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.hydraulic.piston.mapper")
public class PistonManufactureApplication {

    public static void main(String[] args) {
        SpringApplication.run(PistonManufactureApplication.class, args);
    }

}
