package com.bee.equipment.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.bee.equipment.po.OperationLogPO;

public interface OperationLogService extends IService<OperationLogPO> {

    void saveLogAsync(OperationLogPO log);
}
