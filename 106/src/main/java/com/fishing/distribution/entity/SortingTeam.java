package com.fishing.distribution.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sorting_team")
public class SortingTeam extends BaseEntity {

    private String teamCode;

    private String teamName;

    private String teamLeader;

    private String teamLeaderPhone;

    private Integer memberCount;

    private BigDecimal maxCapacity;

    private BigDecimal currentLoad;

    private Integer status;

    private String remark;
}
