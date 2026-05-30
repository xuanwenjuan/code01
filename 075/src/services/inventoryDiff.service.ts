
import { Asset } from '../models';
import { 
  InventoryDiffResult, 
  InventorySummary, 
  InventoryResult, 
  AssetStatus 
} from '../types';

export class InventoryDiffService {
  private static getStatusText(status?: AssetStatus): string {
    const statusMap: Record<AssetStatus, string> = {
      [AssetStatus.IDLE]: '闲置',
      [AssetStatus.IN_USE]: '在用',
      [AssetStatus.IN_REPAIR]: '维修中',
      [AssetStatus.SCRAPPED]: '已报废'
    };
    return status ? statusMap[status] || '未知' : '未设置';
  }

  private static getResultText(result: InventoryResult): string {
    const resultMap: Record<InventoryResult, string> = {
      [InventoryResult.NORMAL]: '正常',
      [InventoryResult.PROFIT]: '盘盈',
      [InventoryResult.LOSS]: '盘亏'
    };
    return resultMap[result];
  }

  static compareInventoryItem(
    asset: any,
    actualStatus?: AssetStatus
  ): InventoryDiffResult {
    const bookStatus = asset.status as AssetStatus;
    let result: InventoryResult;
    let diffDescription: string;
    let isAbnormal: boolean;

    if (!actualStatus) {
      result = InventoryResult.LOSS;
      diffDescription = '账面有记录，但实际无此资产';
      isAbnormal = true;
    } else if (!bookStatus) {
      result = InventoryResult.PROFIT;
      diffDescription = '账面无记录，但实际存在此资产';
      isAbnormal = true;
    } else if (bookStatus === actualStatus) {
      result = InventoryResult.NORMAL;
      diffDescription = '账面状态与实际状态一致';
      isAbnormal = false;
    } else {
      const bookStatusText = this.getStatusText(bookStatus);
      const actualStatusText = this.getStatusText(actualStatus);
      
      if (actualStatus === AssetStatus.SCRAPPED && bookStatus !== AssetStatus.SCRAPPED) {
        result = InventoryResult.LOSS;
        diffDescription = `状态差异：账面[${bookStatusText}]，实际[${actualStatusText}]，资产已报废`;
        isAbnormal = true;
      } else if (bookStatus === AssetStatus.SCRAPPED && actualStatus !== AssetStatus.SCRAPPED) {
        result = InventoryResult.PROFIT;
        diffDescription = `状态差异：账面[${bookStatusText}]，实际[${actualStatusText}]，报废资产仍存在`;
        isAbnormal = true;
      } else {
        result = InventoryResult.NORMAL;
        diffDescription = `状态差异：账面[${bookStatusText}]，实际[${actualStatusText}]`;
        isAbnormal = true;
      }
    }

    return {
      assetId: asset.id,
      assetCode: asset.assetCode,
      assetName: asset.name,
      bookStatus,
      actualStatus,
      result,
      diffDescription,
      isAbnormal
    };
  }

  static async batchCompareInventory(
    inventoryItems: Array<{ assetId: number; actualStatus?: AssetStatus; result?: InventoryResult }>
  ): Promise<{
    summary: InventorySummary;
    diffDetails: InventoryDiffResult[];
  }> {
    const assetIds = inventoryItems.map(item => item.assetId);
    
    const assets = await Asset.findAll({
      where: { id: assetIds },
      attributes: ['id', 'assetCode', 'name', 'status']
    });

    const assetMap = new Map(assets.map(asset => [asset.id, asset]));
    const diffResults: InventoryDiffResult[] = [];

    let normalCount = 0;
    let profitCount = 0;
    let lossCount = 0;

    for (const item of inventoryItems) {
      const asset = assetMap.get(item.assetId);
      
      if (!asset) {
        diffResults.push({
          assetId: item.assetId,
          assetCode: 'UNKNOWN',
          assetName: '未知资产',
          bookStatus: undefined,
          actualStatus: item.actualStatus,
          result: InventoryResult.LOSS,
          diffDescription: '系统中不存在该资产',
          isAbnormal: true
        });
        lossCount++;
        continue;
      }

      const diffResult = this.compareInventoryItem(asset, item.actualStatus);
      
      if (item.result) {
        diffResult.result = item.result;
        diffResult.diffDescription = `人工标记为${this.getResultText(item.result)}`;
        diffResult.isAbnormal = item.result !== InventoryResult.NORMAL;
      }

      diffResults.push(diffResult);

      switch (diffResult.result) {
        case InventoryResult.NORMAL:
          normalCount++;
          break;
        case InventoryResult.PROFIT:
          profitCount++;
          break;
        case InventoryResult.LOSS:
          lossCount++;
          break;
      }
    }

    const totalCount = diffResults.length;
    const normalRate = totalCount > 0 ? ((normalCount / totalCount) * 100).toFixed(2) : '0.00';
    const profitRate = totalCount > 0 ? ((profitCount / totalCount) * 100).toFixed(2) : '0.00';
    const lossRate = totalCount > 0 ? ((lossCount / totalCount) * 100).toFixed(2) : '0.00';

    const abnormalAssets = diffResults.filter(r => r.isAbnormal);

    return {
      summary: {
        totalCount,
        normalCount,
        profitCount,
        lossCount,
        normalRate: `${normalRate}%`,
        profitRate: `${profitRate}%`,
        lossRate: `${lossRate}%`,
        abnormalAssets
      },
      diffDetails: diffResults
    };
  }

  static async fullInventoryCompare(
    department?: string
  ): Promise<{
    summary: InventorySummary;
    diffDetails: InventoryDiffResult[];
  }> {
    const whereClause: any = {
      status: {
        [Symbol.for('ne')]: AssetStatus.SCRAPPED
      }
    };
    
    if (department) {
      whereClause.department = department;
    }

    const assets = await Asset.findAll({
      where: whereClause,
      attributes: ['id', 'assetCode', 'name', 'status']
    });

    const inventoryItems = assets.map(asset => ({
      assetId: asset.id,
      actualStatus: undefined
    }));

    return this.batchCompareInventory(inventoryItems);
  }

  static generateDiffReport(diffDetails: InventoryDiffResult[]): {
    normalAssets: InventoryDiffResult[];
    abnormalAssets: InventoryDiffResult[];
    profitAssets: InventoryDiffResult[];
    lossAssets: InventoryDiffResult[];
  } {
    return {
      normalAssets: diffDetails.filter(d => d.result === InventoryResult.NORMAL),
      abnormalAssets: diffDetails.filter(d => d.isAbnormal),
      profitAssets: diffDetails.filter(d => d.result === InventoryResult.PROFIT),
      lossAssets: diffDetails.filter(d => d.result === InventoryResult.LOSS)
    };
  }
}

export default InventoryDiffService;
