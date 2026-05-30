package com.amber.customize.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CategoryVO {

    private Long id;

    private String name;

    private Long parentId;

    private Integer sort;

    private Integer status;

    private String statusDesc;

    private LocalDateTime createTime;

    private List<CategoryVO> children;

}
