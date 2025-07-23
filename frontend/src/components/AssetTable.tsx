// src/components/AssetTable.tsx
import React from "react";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */
export interface Asset {
  id: number | string; // DataGrid row ids can be number or string
  asset_code: string;
  asset_name: string;
  location_code: string;
  status: string;
}

interface AssetTableProps {
  rows: Asset[];
  loading?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Columns                                                                    */
/* -------------------------------------------------------------------------- */
const columns: GridColDef[] = [
  { field: "asset_code", headerName: "Code", width: 140 },
  { field: "asset_name", headerName: "Name", flex: 1 },
  { field: "location_code", headerName: "Location", width: 120 },
  { field: "status", headerName: "Status", width: 120 },
];

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */
const AssetTable: React.FC<AssetTableProps> = ({ rows, loading = false }) => {
  const [paginationModel, setPaginationModel] =
    React.useState<GridPaginationModel>({
      page: 0,
      pageSize: 10,
    });

  return (
    <DataGrid
      autoHeight
      rows={rows}
      columns={columns}
      pageSizeOptions={[10, 25, 50]}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      loading={loading}
      disableRowSelectionOnClick
    />
  );
};

export default AssetTable;