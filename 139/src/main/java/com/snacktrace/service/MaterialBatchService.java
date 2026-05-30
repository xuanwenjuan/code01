package com.snacktrace.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.snacktrace.entity.MaterialBatch;
import com.snacktrace.mapper.MaterialBatchMapper;
import org.springframework.stereotype.Service;

@Service
public class MaterialBatchService extends ServiceImpl<MaterialBatchMapper, MaterialBatch> {
}
