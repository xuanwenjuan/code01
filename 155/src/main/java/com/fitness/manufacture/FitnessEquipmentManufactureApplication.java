package com.fitness.manufacture;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.fitness.manufacture.mapper")
public class FitnessEquipmentManufactureApplication {

    public static void main(String[] args) {
        SpringApplication.run(FitnessEquipmentManufactureApplication.class, args);
    }

}
