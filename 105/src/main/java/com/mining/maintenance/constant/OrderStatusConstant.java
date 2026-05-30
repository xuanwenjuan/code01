package com.mining.maintenance.constant;

import java.util.Arrays;
import java.util.List;

public class OrderStatusConstant {

    public static final String REPORTED = "REPORTED";
    public static final String ASSIGNED = "ASSIGNED";
    public static final String ACCEPTED = "ACCEPTED";
    public static final String IN_PROGRESS = "IN_PROGRESS";
    public static final String COMPLETED = "COMPLETED";
    public static final String ACCEPTED_OK = "ACCEPTED_OK";
    public static final String REOPENED = "REOPENED";

    public static final List<String> REPORTED_NEXT_STATUS = Arrays.asList(ASSIGNED);
    public static final List<String> ASSIGNED_NEXT_STATUS = Arrays.asList(ACCEPTED, REPORTED);
    public static final List<String> ACCEPTED_NEXT_STATUS = Arrays.asList(IN_PROGRESS);
    public static final List<String> IN_PROGRESS_NEXT_STATUS = Arrays.asList(COMPLETED);
    public static final List<String> COMPLETED_NEXT_STATUS = Arrays.asList(ACCEPTED_OK, REOPENED);
    public static final List<String> REOPENED_NEXT_STATUS = Arrays.asList(ASSIGNED);

    public static boolean canTransition(String currentStatus, String nextStatus) {
        switch (currentStatus) {
            case REPORTED:
                return REPORTED_NEXT_STATUS.contains(nextStatus);
            case ASSIGNED:
                return ASSIGNED_NEXT_STATUS.contains(nextStatus);
            case ACCEPTED:
                return ACCEPTED_NEXT_STATUS.contains(nextStatus);
            case IN_PROGRESS:
                return IN_PROGRESS_NEXT_STATUS.contains(nextStatus);
            case COMPLETED:
                return COMPLETED_NEXT_STATUS.contains(nextStatus);
            case REOPENED:
                return REOPENED_NEXT_STATUS.contains(nextStatus);
            default:
                return false;
        }
    }

    public static String getStatusDesc(String status) {
        switch (status) {
            case REPORTED:
                return "已上报";
            case ASSIGNED:
                return "已指派";
            case ACCEPTED:
                return "已接单";
            case IN_PROGRESS:
                return "维修中";
            case COMPLETED:
                return "已完成";
            case ACCEPTED_OK:
                return "验收通过";
            case REOPENED:
                return "重新开单";
            default:
                return "未知状态";
        }
    }
}