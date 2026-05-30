package com.gear.mfg.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("bom")
public class Bom extends BaseEntity {

    private String bomCode;

    private String bomName;

    private Long productId;

    private String productCode;

    private String productName;

    private String productSpec;

    private Integer version;

    private Integer status;

    private String auditor;

    private String remark;
}
