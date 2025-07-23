import React, { useEffect, useState } from "react";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridColumnApi,
  GridRenderCellParams,
  GridValueGetter,
} from "@mui/x-data-grid";
import API_ENDPOINTS from "../config/api";
import { 
  Box, 
  CircularProgress, 
  Typography, 
  TextField, 
  InputAdornment, 
  Button, 
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import BuildIcon from "@mui/icons-material/Build";
import ReceiptIcon from "@mui/icons-material/Receipt";
import InfoIcon from "@mui/icons-material/Info";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import HistoryIcon from "@mui/icons-material/History";
import InventoryIcon from "@mui/icons-material/Inventory";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface Asset {
  id: number;
  name: string;
  description: string;
  asset_category_id: number;
  location_id: number;
  status: string;
  manufacturer: string;
  model: string;
  serial_number: string;
  installation_date: string;
  warranty_expiry: string;
  specifications: string;
  running_hours: number;
  power_generation: number;
  load_factor: number;
  availability: number;
  cod: string;
  bim: number;
  created_at: string;
  updated_at: string;
  asset_category?: AssetCategory;
  location?: Location;
}

interface AssetCategory {
  id: number;
  name: string;
  description: string;
}

interface Location {
  id: number;
  name: string;
  address: string;
}

interface AssetFilters {
  plant: string;
  asset_category: string;
  status: string;
  running_hours_min: number | null;
  running_hours_max: number | null;
  power_generation_min: number | null;
  power_generation_max: number | null;
  load_factor_min: number | null;
  load_factor_max: number | null;
  availability_min: number | null;
  availability_max: number | null;
  cod_start: string | null;
  cod_end: string | null;
  bim_min: number | null;
  bim_max: number | null;
}

interface FilterOptions {
  plants: string[];
  asset_categories: string[];
  statuses: string[];
}

const Assets: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    plants: [],
    asset_categories: [],
    statuses: []
  });
  const [filters, setFilters] = useState<AssetFilters>({
    plant: "",
    asset_category: "",
    status: "",
    running_hours_min: null,
    running_hours_max: null,
    power_generation_min: null,
    power_generation_max: null,
    load_factor_min: null,
    load_factor_max: null,
    availability_min: null,
    availability_max: null,
    cod_start: null,
    cod_end: null,
    bim_min: null,
    bim_max: null
  });
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch assets with filters
  const fetchAssets = async (appliedFilters: AssetFilters, search: string = "") => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });
      
      if (search) {
        params.append('search', search);
      }
      
      const url = `${API_ENDPOINTS.ASSETS}?${params.toString()}`;
      console.log('Fetching assets from:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Assets data received:', data.length, 'items');
        console.log('First asset:', data[0]);
        setAssets(data);
      } else {
        console.error('API response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      console.log('Fetching filter options from:', API_ENDPOINTS.ASSETS_FILTERS);
      const response = await fetch(API_ENDPOINTS.ASSETS_FILTERS);
      console.log('Filter options response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Filter options received:', data);
        setFilterOptions(data);
      } else {
        console.error('Filter options API response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  useEffect(() => {
    console.log('API_ENDPOINTS.ASSETS:', API_ENDPOINTS.ASSETS);
    console.log('API_ENDPOINTS.ASSETS_FILTERS:', API_ENDPOINTS.ASSETS_FILTERS);
    fetchFilterOptions();
    fetchAssets(filters, searchQuery);
  }, []);

  const handleFilterChange = (field: keyof AssetFilters, value: any) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    fetchAssets(newFilters, searchQuery);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    fetchAssets(filters, query);
  };

  const clearFilters = () => {
    const clearedFilters: AssetFilters = {
      plant: "",
      asset_category: "",
      status: "",
      running_hours_min: null,
      running_hours_max: null,
      power_generation_min: null,
      power_generation_max: null,
      load_factor_min: null,
      load_factor_max: null,
      availability_min: null,
      availability_max: null,
      cod_start: null,
      cod_end: null,
      bim_min: null,
      bim_max: null
    };
    setFilters(clearedFilters);
    setSearchQuery("");
    fetchAssets(clearedFilters, "");
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Asset Name', width: 200 },
    { field: 'description', headerName: 'Description', width: 250 },
    { 
      field: 'asset_category', 
      headerName: 'Asset Category', 
      width: 150,
      valueGetter: (params: any) => {
        if (!params || !params.row) return '';
        return params.row.asset_category?.name || '';
      }
    },
    { 
      field: 'location', 
      headerName: 'Plant', 
      width: 150,
      valueGetter: (params: any) => {
        if (!params || !params.row) return '';
        return params.row.location?.address || params.row.location?.name || '';
      }
    },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'manufacturer', headerName: 'Manufacturer', width: 150 },
    { field: 'model', headerName: 'Model', width: 120 },
    { field: 'serial_number', headerName: 'Serial Number', width: 150 },
    { field: 'installation_date', headerName: 'Installation Date', width: 150 },
    { field: 'warranty_expiry', headerName: 'Warranty Expiry', width: 150 },
    { field: 'running_hours', headerName: 'Running Hours', width: 130, type: 'number' },
    { field: 'power_generation', headerName: 'Power Generation', width: 150, type: 'number' },
    { field: 'load_factor', headerName: 'Load Factor', width: 120, type: 'number' },
    { field: 'availability', headerName: 'Availability', width: 120, type: 'number' },
    { field: 'cod', headerName: 'COD', width: 120 },
    { field: 'bim', headerName: 'BIM', width: 100, type: 'number' },
  ];

  const handleViewAsset = (asset: Asset) => {
    console.log('View asset:', asset);
  };

  const handleEditAsset = (asset: Asset) => {
    console.log('Edit asset:', asset);
  };

  const handleDeleteAsset = async (id: number) => {
    console.log('Delete asset:', id);
  };

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh", p: 3 }}>
      {/* White Container */}
      <Box sx={{ backgroundColor: "#fff", borderRadius: 2, p: 3, boxShadow: 1 }}>
        {/* Title and Layout Container */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Title */}
          <Typography variant="h4" sx={{ alignSelf: 'flex-start' }}>Assets</Typography>
          
          {/* Search and Filters Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 3 }}>
            {/* Left Side - Default Filters */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: '400px' }}>
              {/* Quick Filters */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {/* Plant Filter */}
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Plant</InputLabel>
                  <Select
                    value={filters.plant}
                    onChange={(e) => handleFilterChange('plant', e.target.value)}
                    label="Plant"
                  >
                    <MenuItem value="">All Plants</MenuItem>
                    {filterOptions.plants.map((plant) => (
                      <MenuItem key={plant} value={plant}>{plant}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Asset Category Filter */}
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Asset Category</InputLabel>
                  <Select
                    value={filters.asset_category}
                    onChange={(e) => handleFilterChange('asset_category', e.target.value)}
                    label="Asset Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {filterOptions.asset_categories.map((category) => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Status Filter */}
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    {filterOptions.statuses.map((status) => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Right Side - Search Bar */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', minWidth: '300px' }}>
              <TextField
                placeholder="Search assets..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 300 }}
              />
            </Box>
          </Box>

          {/* Advanced Filters Section */}
          <Accordion 
            expanded={filtersExpanded} 
            onChange={() => setFiltersExpanded(!filtersExpanded)}
            sx={{ mb: 3 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterListIcon />
                <Typography variant="h6">Advanced Filters</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>

                {/* Running Hours Range */}
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="Min Running Hours"
                      type="number"
                      size="small"
                      value={filters.running_hours_min || ''}
                      onChange={(e) => handleFilterChange('running_hours_min', e.target.value ? Number(e.target.value) : null)}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Max Running Hours"
                      type="number"
                      size="small"
                      value={filters.running_hours_max || ''}
                      onChange={(e) => handleFilterChange('running_hours_max', e.target.value ? Number(e.target.value) : null)}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                </Box>

                {/* Power Generation Range */}
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="Min Power Generation"
                      type="number"
                      size="small"
                      value={filters.power_generation_min || ''}
                      onChange={(e) => handleFilterChange('power_generation_min', e.target.value ? Number(e.target.value) : null)}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Max Power Generation"
                      type="number"
                      size="small"
                      value={filters.power_generation_max || ''}
                      onChange={(e) => handleFilterChange('power_generation_max', e.target.value ? Number(e.target.value) : null)}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                </Box>

                {/* Load Factor Range */}
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="Min Load Factor"
                      type="number"
                      size="small"
                      value={filters.load_factor_min || ''}
                      onChange={(e) => handleFilterChange('load_factor_min', e.target.value ? Number(e.target.value) : null)}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Max Load Factor"
                      type="number"
                      size="small"
                      value={filters.load_factor_max || ''}
                      onChange={(e) => handleFilterChange('load_factor_max', e.target.value ? Number(e.target.value) : null)}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                </Box>

                {/* Availability Range */}
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="Min Availability"
                      type="number"
                      size="small"
                      value={filters.availability_min || ''}
                      onChange={(e) => handleFilterChange('availability_min', e.target.value ? Number(e.target.value) : null)}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Max Availability"
                      type="number"
                      size="small"
                      value={filters.availability_max || ''}
                      onChange={(e) => handleFilterChange('availability_max', e.target.value ? Number(e.target.value) : null)}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                </Box>

                {/* COD Date Range */}
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="COD Start Date"
                      type="date"
                      size="small"
                      value={filters.cod_start || ''}
                      onChange={(e) => handleFilterChange('cod_start', e.target.value || null)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="COD End Date"
                      type="date"
                      size="small"
                      value={filters.cod_end || ''}
                      onChange={(e) => handleFilterChange('cod_end', e.target.value || null)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                </Box>

                {/* BIM Range */}
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="Min BIM"
                      type="number"
                      size="small"
                      value={filters.bim_min || ''}
                      onChange={(e) => handleFilterChange('bim_min', e.target.value ? Number(e.target.value) : null)}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Max BIM"
                      type="number"
                      size="small"
                      value={filters.bim_max || ''}
                      onChange={(e) => handleFilterChange('bim_max', e.target.value ? Number(e.target.value) : null)}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                </Box>

                {/* Clear Filters Button */}
                <Box sx={{ flex: '1 1 100%', width: '100%' }}>
                  <Button 
                    variant="outlined" 
                    onClick={clearFilters}
                    sx={{ mt: 1 }}
                  >
                    Clear All Filters
                  </Button>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Assets Data Grid */}
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={assets}
              columns={columns}
              loading={loading}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 25 },
                },
              }}
              disableRowSelectionOnClick
              sx={{
                backgroundColor: '#fff',
                '& .MuiDataGrid-root': {
                  backgroundColor: '#fff',
                },
                '& .MuiDataGrid-main': {
                  backgroundColor: '#fff',
                },
                '& .MuiDataGrid-virtualScroller': {
                  backgroundColor: '#fff',
                },
                '& .MuiDataGrid-virtualScrollerContent': {
                  backgroundColor: '#fff',
                },
                '& .MuiDataGrid-virtualScrollerRenderZone': {
                  backgroundColor: '#fff',
                },
                '& .MuiDataGrid-row': {
                  backgroundColor: '#fff',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                },
                '& .MuiDataGrid-cell': {
                  backgroundColor: '#fff',
                  borderBottom: '1px solid #e0e0e0',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f5f5f5',
                  borderBottom: '2px solid #e0e0e0',
                },
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Assets;