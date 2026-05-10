import React from 'react';
import { Material } from '../types';
import { getDaysRemaining } from '../utils/helpers';
import { Modal } from './Modal';

interface ExpiryWarningModalProps {
  isOpen: boolean;
  expiringMaterials: Material[];
  expiredMaterials: Material[];
  onClose: () => void;
  onGoToInventory: () => void;
}

export const ExpiryWarningModal: React.FC<ExpiryWarningModalProps> = ({
  isOpen,
  expiringMaterials,
  expiredMaterials,
  onClose,
  onGoToInventory,
}) => {
  if (!isOpen) return null;

  const handleNavigate = () => {
    onClose();
    onGoToInventory();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="⚠️ 物料状态提醒"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            稍后处理
          </button>
          <button className="btn btn-warning" onClick={handleNavigate}>
            前往处理
          </button>
        </>
      }
    >
      <div style={{ marginBottom: '20px' }}>
        {expiredMaterials.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#c62828', marginBottom: '10px' }}>
              🔴 已过期物料 ({expiredMaterials.length})
            </h3>
            <div style={{ background: '#ffebee', padding: '15px', borderRadius: '6px' }}>
              {expiredMaterials.map((material) => (
                <div
                  key={material.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px dashed #ffcdd2',
                  }}
                >
                  <span>
                    <strong>{material.name}</strong> ({material.category})
                  </span>
                  <span style={{ color: '#c62828' }}>
                    已过期 {Math.abs(getDaysRemaining(material.expiryDate))} 天
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {expiringMaterials.length > 0 && (
          <div>
            <h3 style={{ color: '#f57c00', marginBottom: '10px' }}>
              🟡 即将过期物料 ({expiringMaterials.length})
            </h3>
            <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '6px' }}>
              {expiringMaterials.map((material) => (
                <div
                  key={material.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px dashed #ffe0b2',
                  }}
                >
                  <span>
                    <strong>{material.name}</strong> ({material.category})
                  </span>
                  <span style={{ color: '#f57c00' }}>
                    {getDaysRemaining(material.expiryDate)} 天后到期
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '15px' }}>
        <p>💡 建议：</p>
        <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
          <li>已过期物料应立即丢弃处理</li>
          <li>临期物料优先使用或促销</li>
          <li>低库存物料及时补充</li>
        </ul>
      </div>
    </Modal>
  );
};
