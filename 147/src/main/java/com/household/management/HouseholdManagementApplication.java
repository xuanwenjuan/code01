package com.household.management;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("com.household.management.mapper")
@EnableScheduling
@EnableAsync
public class HouseholdManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(HouseholdManagementApplication.class, args);
    }
}
