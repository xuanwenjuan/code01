package com.gearbox.manage;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.gearbox.manage.mapper")
public class GearboxManageApplication {

    public static void main(String[] args) {
        SpringApplication.run(GearboxManageApplication.class, args);
    }

}
