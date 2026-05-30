package com.valve.manufacture;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.valve.manufacture.mapper")
public class ValveManufactureApplication {

    public static void main(String[] args) {
        SpringApplication.run(ValveManufactureApplication.class, args);
    }
}
