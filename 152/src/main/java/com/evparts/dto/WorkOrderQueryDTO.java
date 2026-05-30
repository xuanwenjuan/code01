package com.evparts.dto;

import com.evparts.common.PageQuery;
import lombok.Data;

@Data
public class WorkOrderQueryDTO extends PageQuery {

    private String orderNo;
    private Long productId;
    private String orderStatus;
    private String startDate;
    private String endDate;

}
