package com.radiator.management.dto;

import lombok.Data;

import java.util.Map;

@Data
public class PageRequest {
    private int page = 1;
    private int size = 10;
    private String sortField = "createTime";
    private String sortOrder = "desc";
    private Map<String, Object> filters;
}
