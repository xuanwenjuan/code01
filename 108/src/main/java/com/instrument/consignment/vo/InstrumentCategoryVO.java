package com.instrument.consignment.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class InstrumentCategoryVO {

    private Long id;

    private Long parentId;

    private String categoryName;

    private String categoryCode;

    private String categoryType;

    private Integer sortOrder;

    private Integer status;

    private String description;

    private List<InstrumentCategoryVO> children;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
