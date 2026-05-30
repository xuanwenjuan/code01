package com.battery.shell.constant;

public class OrderStatus {
    public static final String PENDING = "PENDING";
    public static final String CUTTING = "CUTTING";
    public static final String STAMPING = "STAMPING";
    public static final String BENDING = "BENDING";
    public static final String GRINDING = "GRINDING";
    public static final String TESTING = "TESTING";
    public static final String PACKAGING = "PACKAGING";
    public static final String FINISHED = "FINISHED";
    public static final String PAUSED = "PAUSED";
    public static final String CANCELLED = "CANCELLED";

    public static final String[] PROCESS_FLOW = {
            CUTTING, STAMPING, BENDING, GRINDING, TESTING, PACKAGING
    };

    public static int getProcessIndex(String status) {
        for (int i = 0; i < PROCESS_FLOW.length; i++) {
            if (PROCESS_FLOW[i].equals(status)) {
                return i;
            }
        }
        return -1;
    }

    public static String getNextProcess(String currentStatus) {
        int index = getProcessIndex(currentStatus);
        if (index >= 0 && index < PROCESS_FLOW.length - 1) {
            return PROCESS_FLOW[index + 1];
        }
        return null;
    }

    public static boolean isInProcess(String status) {
        return getProcessIndex(status) >= 0;
    }
}
