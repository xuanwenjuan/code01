package com.zongshi.brush;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.zongshi.brush.mapper")
public class BrushManufactureApplication {

    public static void main(String[] args) {
        SpringApplication.run(BrushManufactureApplication.class, args);
    }

}
