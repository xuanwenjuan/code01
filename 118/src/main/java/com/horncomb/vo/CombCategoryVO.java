package com.horncomb.vo;

import lombok.Data;
import java.util.List;

@Data
public class CombCategoryVO {
    private Long id;
    private Long parentId;
    private String categoryName;
    private String categoryCode;
    private Integer level;
    private Integer sortOrder;
    private Integer status;
    private List<CombCategoryVO> children;
}
