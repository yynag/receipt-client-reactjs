import { Modal, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import type { HistoryRecord } from "../types";

export interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  records: HistoryRecord[];
  title: string;
  emptyText: string;
  columnLabels: {
    user: string;
    cdk: string;
    time: string;
  };
}

export default function HistoryModal({ open, onClose, records, title, emptyText, columnLabels }: HistoryModalProps) {
  const columns: ColumnsType<HistoryRecord> = useMemo(
    () => [
      {
        title: columnLabels.user,
        dataIndex: "user",
        key: "user",
        render: (value: string, record) => (
          <div className="flex flex-col">
            <span className="font-medium text-slate-800 dark:text-slate-100">{value}</span>
            {record.userId ? (
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{record.userId}</span>
            ) : null}
          </div>
        )
      },
      {
        title: columnLabels.cdk,
        dataIndex: "cdk",
        key: "cdk",
        render: (value: string, record) => (
          <div className="flex flex-col">
            <span className="font-mono text-sm text-slate-700 dark:text-slate-200">{value}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{record.appName}</span>
          </div>
        )
      },
      {
        title: columnLabels.time,
        dataIndex: "redeemedAt",
        key: "redeemedAt",
        render: (value: string) => (
          <span className="text-sm text-slate-600 dark:text-slate-300">{new Date(value).toLocaleString()}</span>
        )
      }
    ],
    [columnLabels]
  );

  return (
    <Modal
      open={open}
      title={title}
      onCancel={onClose}
      footer={null}
      width={720}
      centered
      rootClassName="redeem-history-modal-root"
      wrapClassName="redeem-history-modal-wrap"
      className="redeem-history-modal"
    >
      <Table
        rowKey="id"
        dataSource={records}
        columns={columns}
        pagination={false}
        locale={{ emptyText }}
        className="redeem-history-table"
      />
    </Modal>
  );
}
