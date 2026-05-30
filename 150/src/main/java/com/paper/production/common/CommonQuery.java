package com.paper.production.common;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
public class CommonQuery extends PageQuery implements Serializable {

    private Long id;
    private String code;
    private String name;
    private Integer status;
    private String type;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String createBy;
}
