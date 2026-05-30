package com.textile.production.common;

import java.util.Arrays;
import java.util.List;

public class ProcessConstants {

    public static final List<String> PROCESSES = Arrays.asList(
            "丝线整经", "纱线织造", "胚布印染", "高温定型", "缩水处理", "瑕疵质检", "成品卷布入库"
    );

    public static final String ORDER_STATUS_PENDING = "PENDING";
    public static final String ORDER_STATUS_IN_PROGRESS = "IN_PROGRESS";
    public static final String ORDER_STATUS_SUSPENDED = "SUSPENDED";
    public static final String ORDER_STATUS_COMPLETED = "COMPLETED";
    public static final String ORDER_STATUS_CANCELLED = "CANCELLED";

    public static final String PROCESS_STATUS_PENDING = "PENDING";
    public static final String PROCESS_STATUS_IN_PROGRESS = "IN_PROGRESS";
    public static final String PROCESS_STATUS_COMPLETED = "COMPLETED";
    public static final String PROCESS_STATUS_SKIPPED = "SKIPPED";
}
