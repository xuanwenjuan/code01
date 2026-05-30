package com.ancientpaper.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("paper_category")
public class PaperCategory extends BaseEntity {
    private Long parentId;
    private String categoryName;
    private String categoryCode;
    private Integer sortOrder;
    private Integer status;
    private Integer level;
}