package com.instrument.consignment.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.instrument.consignment.dto.InstrumentArchiveQueryDTO;
import com.instrument.consignment.po.InstrumentArchivePO;
import com.instrument.consignment.vo.InstrumentArchiveVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface InstrumentArchiveMapper extends BaseMapper<InstrumentArchivePO> {

    Page<InstrumentArchiveVO> selectArchivePage(Page<InstrumentArchiveVO> page,
                                                 @Param("query") InstrumentArchiveQueryDTO queryDTO);
}
