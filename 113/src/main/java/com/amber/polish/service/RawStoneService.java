package com.amber.polish.service;

import com.amber.polish.dto.RawStoneDTO;
import com.amber.polish.dto.RawStoneQueryDTO;
import com.amber.polish.entity.RawStone;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;

public interface RawStoneService extends IService<RawStone> {

    Page<RawStone> getRawStonePage(int pageNum, int pageSize, Long categoryId, String status);

    Page<RawStone> queryRawStoneByConditions(int pageNum, int pageSize, RawStoneQueryDTO queryDTO);

    boolean lockRawStone(Long rawStoneId, Long orderId, Long operatorId);

    boolean unlockRawStone(Long rawStoneId, Long operatorId);

    boolean addRawStone(RawStoneDTO dto, Long purchaserId);

    boolean addRawStone(RawStone rawStone);

    boolean updateRawStoneStatus(Long id, String status);

    void inspectOverdueStones();
}
