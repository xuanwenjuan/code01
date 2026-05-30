package com.bee.equipment.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class EquipmentCategoryVO extends BaseVO {

    private Long parentId;

    private String name;

    private String code;

    private Integer sortOrder;

    private Integer status;

    private String statusDesc;

    private List<EquipmentCategoryVO> children;
}
