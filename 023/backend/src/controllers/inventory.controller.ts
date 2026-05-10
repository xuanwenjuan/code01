import { Request, Response } from 'express';
import inventoryService from '../services/inventory.service';
import { InventoryLog, ApiResponse } from '../types';

export const getLogs = async (req: Request, res: Response<ApiResponse<InventoryLog[]>>) => {
  try {
    const logs = await inventoryService.getAllLogs();
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('获取出入库记录失败', error);
    res.status(500).json({ success: false, message: '获取出入库记录失败' });
  }
};

export const getLog = async (req: Request, res: Response<ApiResponse<InventoryLog | null>>) => {
  try {
    const id = parseInt(req.params.id);
    const log = await inventoryService.getLogById(id);
    res.json({ success: true, data: log });
  } catch (error) {
    console.error('获取记录失败', error);
    res.status(500).json({ success: false, message: '获取记录失败' });
  }
};

export const createInbound = async (req: Request, res: Response<ApiResponse<InventoryLog>>) => {
  try {
    const { product_id, quantity, price, reason } = req.body;
    const log = await inventoryService.createInbound(product_id, quantity, price, reason);
    res.json({ success: true, data: log });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : '入库失败';
    console.error('入库失败', error);
    res.status(400).json({ success: false, message: errMsg });
  }
};

export const createSale = async (req: Request, res: Response<ApiResponse<InventoryLog>>) => {
  try {
    const { product_id, quantity, price, reason } = req.body;
    const log = await inventoryService.createSale(product_id, quantity, price, reason);
    res.json({ success: true, data: log });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : '售卖失败';
    console.error('售卖失败', error);
    res.status(400).json({ success: false, message: errMsg });
  }
};

export const createDefective = async (req: Request, res: Response<ApiResponse<InventoryLog>>) => {
  try {
    const { product_id, quantity, reason } = req.body;
    const log = await inventoryService.createDefective(product_id, quantity, reason);
    res.json({ success: true, data: log });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : '残次下架失败';
    console.error('残次下架失败', error);
    res.status(400).json({ success: false, message: errMsg });
  }
};
