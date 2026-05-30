package com.firecontrol;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("com.firecontrol.mapper")
@EnableScheduling
@EnableAsync
public class FireEquipmentApplication {

    public static void main(String[] args) {
        SpringApplication.run(FireEquipmentApplication.class, args);
    }
}
