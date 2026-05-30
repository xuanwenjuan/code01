package com.aromatherapy.entity.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("aroma_category")
public class AromaCategoryPO {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long parentId;

    private String categoryName;

    private String categoryCode;

    private String description;

    private Integer sort;

    private Integer supplySort;

    private Integer status;

    private Integer level;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    private Integer deleted;
}
