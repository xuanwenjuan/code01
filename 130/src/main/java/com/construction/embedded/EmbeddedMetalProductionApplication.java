package com.construction.embedded;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.construction.embedded.mapper")
public class EmbeddedMetalProductionApplication {

    public static void main(String[] args) {
        SpringApplication.run(EmbeddedMetalProductionApplication.class, args);
    }

}
