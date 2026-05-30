package com.firecontrol.common.constant;

import java.util.Arrays;
import java.util.List;

public class WorkOrderConstants {

    public static final Integer STATUS_DRAFT = 0;
    public static final Integer STATUS_PENDING = 1;
    public static final Integer STATUS_IN_PRODUCTION = 2;
    public static final Integer STATUS_QUALITY_CHECK = 3;
    public static final Integer STATUS_FINISHED = 4;
    public static final Integer STATUS_PAUSED = 5;
    public static final Integer STATUS_CANCELLED = 6;

    public static final Integer AUDIT_STATUS_PENDING = 0;
    public static final Integer AUDIT_STATUS_APPROVED = 1;
    public static final Integer AUDIT_STATUS_REJECTED = 2;

    public static final String PROCESS_STAMPING = "STAMPING";
    public static final String PROCESS_SEALING = "SEALING";
    public static final String PROCESS_FILLING = "FILLING";
    public static final String PROCESS_ASSEMBLY = "ASSEMBLY";
    public static final String PROCESS_FIRE_TEST = "FIRE_TEST";
    public static final String PROCESS_PRESSURE_TEST = "PRESSURE_TEST";
    public static final String PROCESS_LABELING = "LABELING";
    public static final String PROCESS_WAREHOUSING = "WAREHOUSING";

    public static final List<String> PRODUCTION_PROCESSES = Arrays.asList(
            PROCESS_STAMPING,
            PROCESS_SEALING,
            PROCESS_FILLING,
            PROCESS_ASSEMBLY,
            PROCESS_FIRE_TEST,
            PROCESS_PRESSURE_TEST,
            PROCESS_LABELING,
            PROCESS_WAREHOUSING
    );

    public static final String[] PROCESS_NAMES = {
            "罐体冲压成型",
            "耐压密封处理",
            "灭火剂灌装",
            "阀门组装调试",
            "防火性能检测",
            "压力试压核验",
            "防伪贴标",
            "成品入库"
    };

    public static String getProcessName(String processCode) {
        int index = PRODUCTION_PROCESSES.indexOf(processCode);
        return index >= 0 ? PROCESS_NAMES[index] : processCode;
    }
}
