package com.plastic.injection.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CategoryTreeVO {

    private Long id;

    private String categoryName;

    private String categoryCode;

    private Long parentId;

    private Integer level;

    private Integer sort;

    private Integer priority;

    private Integer status;

    private String remark;

    private List<CategoryTreeVO> children;

    private LocalDateTime createTime;
}
