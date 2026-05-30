package com.spring.manufacturing.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("spring_category")
public class SpringCategory extends BaseEntity {

    @NotBlank(message = "分类名称不能为空")
    @Size(max = 100, message = "分类名称长度不能超过100个字符")
    private String categoryName;

    @Size(max = 50, message = "分类编码长度不能超过50个字符")
    private String categoryCode;

    private Long parentId;

    private String categoryType;

    private Integer priority;

    private Integer status;

    @Size(max = 500, message = "描述长度不能超过500个字符")
    private String description;
}