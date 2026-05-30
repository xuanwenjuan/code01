package com.liquor.brewing.common;

public class Constants {

    public static final String DEFAULT_PASSWORD = "123456";

    public static final String TOKEN_KEY = "token:";

    public static final String USER_KEY = "user:";

    public static final String PERMISSION_KEY = "permission:";

    public static final Long TOKEN_EXPIRE = 86400L;

    public static final Integer ROOT_PARENT_ID = 0;

    public static final String BATCH_CODE_PREFIX = "LQ";

    public static final String WORK_ORDER_PREFIX = "WO";

    public static final String MATERIAL_PREFIX = "MT";

    public static final String CATEGORY_PREFIX = "CT";

    public interface Status {
        Integer ENABLE = 1;
        Integer DISABLE = 0;
    }

    public interface DeleteStatus {
        Integer NOT_DELETED = 0;
        Integer DELETED = 1;
    }

    public interface MaterialStatus {
        Integer NORMAL = 1;
        Integer WARNING = 2;
        Integer STOPPED = 3;
    }

    public interface WorkOrderStatus {
        Integer CREATED = 0;
        Integer FERMENTING = 10;
        Integer BLENDING = 20;
        Integer AGING = 30;
        Integer FILTERING = 40;
        Integer BOTTLING = 50;
        Integer LABELING = 60;
        Integer INSPECTING = 70;
        Integer FINISHED = 80;
        Integer FROZEN = 90;
        Integer CANCELLED = 99;
    }

    public interface RoleCode {
        String PURCHASER = "purchaser";
        String BREWER = "brewer";
        String SUPERVISOR = "supervisor";
        String INSPECTOR = "inspector";
    }

    public interface OperationType {
        String CREATE = "新增";
        String UPDATE = "修改";
        String DELETE = "删除";
        String QUERY = "查询";
        String EXPORT = "导出";
        String STATUS_CHANGE = "状态变更";
        String RESERVE = "预占";
        String RELEASE = "释放";
        String CONFIRM = "确认";
    }

    public interface ReservationStatus {
        Integer RESERVED = 1;
        Integer RELEASED = 0;
        Integer CONFIRMED = 2;
    }
}
