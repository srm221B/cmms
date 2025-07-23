import React, { useEffect, useState } from "react";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridColumnApi,
  GridRenderCellParams,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";

interface WorkOrder {
  id: number;
  work_order_number: string;
  title: string;
  description: string;
  asset_id?: number;
  type_id?: number;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "completed" | "cancelled";
  requested_by?: number;
  assigned_to?: number;
  requested_date: string;
  scheduled_date?: string;
  start_date?: string;
  end_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  created_at: string;
  updated_at: string;
  asset?: { id: number; name: string; asset_code: string };
  work_order_type?: { id: number; name: string };
  requester?: { id: number; username: string };
  assignee?: { id: number; username: string };
}

interface WorkOrderPart {
  id: number;
  spare_part_id: number;
  quantity_used: number;
  location_id: number;
  inventory_item: {
    part_code: string;
    part_name: string;
    unit_of_issue: string;
    unit_price: number;
  };
}

interface WorkOrderDetails {
  work_order: WorkOrder;
  parts_consumed: WorkOrderPart[];
}

interface WorkOrderFilters {
  plant: string;
  asset: string;
  type: string;
  status: string;
  scheduled_date_start: string | null;
  scheduled_date_end: string | null;
  start_date_start: string | null;
  start_date_end: string | null;
  end_date_start: string | null;
  end_date_end: string | null;
  estimated_hours_min: number | null;
  estimated_hours_max: number | null;
  actual_hours_min: number | null;
  actual_hours_max: number | null;
}

interface FilterOptions {
  plants: string[];
  asset_categories: string[];
  work_order_types: string[];
  statuses: string[];
}

const WorkOrders: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrderDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    plants: [],
    asset_categories: [],
    work_order_types: [],
    statuses: []
  });
  const [filters, setFilters] = useState<WorkOrderFilters>({
    plant: "",
    asset: "",
    type: "",
    status: "",
    scheduled_date_start: null,
    scheduled_date_end: null,
    start_date_start: null,
    start_date_end: null,
    end_date_start: null,
    end_date_end: null,
    estimated_hours_min: null,
    estimated_hours_max: null,
    actual_hours_min: null,
    actual_hours_max: null
  });
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  
  // Add Work Order Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    title: "",
    description: "",
    plant: "",
    asset_category: "",
    asset_id: "",
    type_id: "",
    priority: "medium",
    scheduled_date: "",
    start_date: "",
    end_date: "",
    estimated_hours: ""
  });
  const [assets, setAssets] = useState<Array<{id: number, name: string}>>([]);
  const [filteredAssets, setFilteredAssets] = useState<Array<{id: number, name: string}>>([]);
  const [workOrderTypes, setWorkOrderTypes] = useState<Array<{id: number, name: string}>>([]);
  const [plants, setPlants] = useState<string[]>([]);
  const [assetCategories, setAssetCategories] = useState<Array<{id: number, name: string}>>([]);
  const [inventoryItems, setInventoryItems] = useState<Array<{id: number, part_name: string, part_code: string}>>([]);
  const [spareParts, setSpareParts] = useState<Array<{part_id: number, part_name: string, part_code: string, quantity: number}>>([]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch work orders with filters
  const fetchWorkOrders = async (appliedFilters: WorkOrderFilters, search: string = "") => {
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
      
      const response = await fetch(`${API_ENDPOINTS.WORK_ORDERS}?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setWorkOrders(data);
      }
    } catch (error) {
      console.error('Error fetching work orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.WORK_ORDERS_FILTERS);
      if (response.ok) {
        const data = await response.json();
        setFilterOptions(data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
    fetchWorkOrders(filters, searchQuery);
  }, []);

  const handleFilterChange = (field: keyof WorkOrderFilters, value: any) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    fetchWorkOrders(newFilters, searchQuery);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    fetchWorkOrders(filters, query);
  };

  const clearFilters = () => {
    const clearedFilters: WorkOrderFilters = {
      plant: "",
      asset: "",
      type: "",
      status: "",
      scheduled_date_start: null,
      scheduled_date_end: null,
      start_date_start: null,
      start_date_end: null,
      end_date_start: null,
      end_date_end: null,
      estimated_hours_min: null,
      estimated_hours_max: null,
      actual_hours_min: null,
      actual_hours_max: null
    };
    setFilters(clearedFilters);
    setSearchQuery("");
    fetchWorkOrders(clearedFilters, "");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "error";
      case "high": return "warning";
      case "medium": return "info";
      case "low": return "success";
      default: return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "success";
      case "in_progress": return "info";
      case "open": return "warning";
      case "cancelled": return "error";
      default: return "default";
    }
  };

  const handleWorkOrderClick = async (workOrder: WorkOrder) => {
    setDetailsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.WORK_ORDER_DETAILS(workOrder.id));
      if (response.ok) {
        const details = await response.json();
        setSelectedWorkOrder(details);
        setDrawerOpen(true);
      }
    } catch (error) {
      console.error('Error fetching work order details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedWorkOrder(null);
  };

  // Add Work Order Modal Functions
  const handleOpenAddModal = async () => {
    setAddModalOpen(true);
    // Fetch all required data for the form
    try {
      const [assetsResponse, typesResponse, plantsResponse, categoriesResponse, inventoryResponse] = await Promise.all([
        fetch(API_ENDPOINTS.ASSETS),
        fetch(API_ENDPOINTS.WORK_ORDER_TYPES),
        fetch(API_ENDPOINTS.LOCATIONS_UNIQUE_ADDRESSES),
        fetch(API_ENDPOINTS.ASSET_CATEGORIES),
        fetch(API_ENDPOINTS.INVENTORY_ITEMS)
      ]);
      
      if (assetsResponse.ok) {
        const assetsData = await assetsResponse.json();
        setAssets(assetsData.map((asset: any) => ({ id: asset.id, name: asset.name })));
      }
      
      if (typesResponse.ok) {
        const typesData = await typesResponse.json();
        setWorkOrderTypes(typesData.map((type: any) => ({ id: type.id, name: type.name })));
      }
      
      if (plantsResponse.ok) {
        const plantsData = await plantsResponse.json();
        setPlants(plantsData);
      }
      
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setAssetCategories(categoriesData.map((category: any) => ({ id: category.id, name: category.name })));
      }
      
      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json();
        setInventoryItems(inventoryData.map((item: any) => ({ 
          id: item.id, 
          part_name: item.part_name, 
          part_code: item.part_code 
        })));
      }

      // Clear filtered assets when modal opens
      setFilteredAssets([]);
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  };

  const handleCloseAddModal = () => {
    setAddModalOpen(false);
    setAddFormData({
      title: "",
      description: "",
      plant: "",
      asset_category: "",
      asset_id: "",
      type_id: "",
      priority: "medium",
      scheduled_date: "",
      start_date: "",
      end_date: "",
      estimated_hours: ""
    });
    setSpareParts([]);
    setFilteredAssets([]);
  };

  const handleFormChange = (field: string, value: any) => {
    setAddFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // If plant or asset_category changes, fetch filtered assets
    if (field === 'plant' || field === 'asset_category') {
      fetchFilteredAssets(value, field === 'plant' ? addFormData.asset_category : addFormData.plant);
    }
  };

  const fetchFilteredAssets = async (plant: string, assetCategory: string) => {
    try {
      const params = new URLSearchParams();
      if (plant) params.append('plant', plant);
      if (assetCategory) params.append('asset_category', assetCategory);
      
      const response = await fetch(`${API_ENDPOINTS.ASSETS_FILTERED}?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setFilteredAssets(data);
      }
    } catch (error) {
      console.error('Error fetching filtered assets:', error);
    }
  };

  const handleAddSparePart = () => {
    const newPart = {
      part_id: 0,
      part_name: "",
      part_code: "",
      quantity: 1
    };
    setSpareParts(prev => [...prev, newPart]);
  };

  const handleRemoveSparePart = (index: number) => {
    setSpareParts(prev => prev.filter((_, i) => i !== index));
  };

  const handleSparePartChange = (index: number, field: string, value: any) => {
    setSpareParts(prev => prev.map((part, i) => {
      if (i === index) {
        return { ...part, [field]: value };
      }
      return part;
    }));
  };

  const handlePartSelection = (index: number, partId: number) => {
    const selectedItem = inventoryItems.find(item => item.id === partId);
    if (selectedItem) {
      setSpareParts(prev => prev.map((part, i) => {
        if (i === index) {
          return {
            ...part,
            part_id: selectedItem.id,
            part_name: selectedItem.part_name,
            part_code: selectedItem.part_code
          };
        }
        return part;
      }));
    }
  };

  const handleSubmitWorkOrder = async () => {
    if (!addFormData.title.trim()) {
      alert('Title is required');
      return;
    }

    setSubmitting(true);
    try {
      const workOrderData = {
        title: addFormData.title,
        description: addFormData.description || null,
        plant: addFormData.plant || null,
        asset_category: addFormData.asset_category || null,
        asset_id: addFormData.asset_id ? parseInt(addFormData.asset_id) : null,
        type_id: addFormData.type_id ? parseInt(addFormData.type_id) : null,
        priority: addFormData.priority,
        scheduled_date: addFormData.scheduled_date || null,
        start_date: addFormData.start_date || null,
        end_date: addFormData.end_date || null,
        estimated_hours: addFormData.estimated_hours ? parseFloat(addFormData.estimated_hours) : null,
        spare_parts: spareParts.filter(part => part.part_id > 0 && part.quantity > 0)
      };

      const response = await fetch(API_ENDPOINTS.WORK_ORDERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workOrderData)
      });

      if (response.ok) {
        const newWorkOrder = await response.json();
        console.log('Work order created:', newWorkOrder);
        
        // Refresh the work orders list
        fetchWorkOrders(filters, searchQuery);
        
        // Close modal and reset form
        handleCloseAddModal();
        alert('Work order created successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error creating work order: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating work order:', error);
      alert('Error creating work order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: GridColDef[] = [
    { 
      field: "work_order_number", 
      headerName: "Work Order #", 
      width: 150,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<WorkOrder>) => (
        <Box sx={{ 
          width: "100%", 
          height: "100%", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center" 
        }}>
          <Typography sx={{ fontWeight: "medium", fontSize: "0.875rem" }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    { 
      field: "title", 
      headerName: "Title", 
      width: 200,
      align: "left",
      headerAlign: "left",
      renderCell: (params: GridRenderCellParams<WorkOrder>) => (
        <Box sx={{ 
          width: "100%", 
          height: "100%", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "flex-start",
          pl: 1
        }}>
          <Typography 
            sx={{ 
              fontWeight: "medium", 
              color: "primary.main", 
              cursor: "pointer",
              textDecoration: "underline",
              "&:hover": {
                color: "primary.dark"
              }
            }}
            onClick={() => handleWorkOrderClick(params.row)}
          >
            {params.value}
          </Typography>
        </Box>
      )
    },
    { 
      field: "description", 
      headerName: "Description", 
      width: 250,
      align: "left",
      headerAlign: "left",
      renderCell: (params: GridRenderCellParams<WorkOrder>) => (
        <Box sx={{ 
          width: "100%", 
          height: "100%", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "flex-start",
          pl: 1
        }}>
          <Typography sx={{ fontWeight: "medium" }}>
            {params.value || "—"}
          </Typography>
        </Box>
      )
    },
    {
      field: "asset",
      headerName: "Asset",
      width: 150,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<WorkOrder>) => {
        const assetName = params.value?.name || "N/A";
        return (
          <Box sx={{ 
            width: "100%", 
            height: "100%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center" 
          }}>
            <Typography sx={{ fontWeight: "medium", fontSize: "0.875rem" }}>
              {assetName}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "work_order_type",
      headerName: "Type",
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<WorkOrder>) => {
        const typeName = params.value?.name || "N/A";
        return (
          <Box sx={{ 
            width: "100%", 
            height: "100%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center" 
          }}>
            <Typography sx={{ fontWeight: "medium", fontSize: "0.875rem" }}>
              {typeName}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<WorkOrder>) => (
        <Box sx={{ 
          width: "100%", 
          height: "100%", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center" 
        }}>
          <Chip
            label={params.value}
            color={getPriorityColor(params.value) as any}
            size="small"
            sx={{ fontWeight: "medium" }}
          />
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<WorkOrder>) => (
        <Box sx={{ 
          width: "100%", 
          height: "100%", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center" 
        }}>
          <Chip
            label={params.value.replace('_', ' ')}
            color={getStatusColor(params.value) as any}
            size="small"
            sx={{ fontWeight: "medium" }}
          />
        </Box>
      ),
    },
    {
      field: "scheduled_date",
      headerName: "Scheduled Date",
      width: 150,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<WorkOrder>) => (
        <Box sx={{ 
          width: "100%", 
          height: "100%", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center" 
        }}>
          <Typography sx={{ fontWeight: "medium", fontSize: "0.875rem" }}>
            {params.value ? new Date(params.value).toLocaleDateString() : "—"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "estimated_hours",
      headerName: "Est. Hours",
      width: 120,
      align: "center",
      headerAlign: "center",
      type: "number",
      renderCell: (params: GridRenderCellParams<WorkOrder>) => (
        <Box sx={{ 
          width: "100%", 
          height: "100%", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center" 
        }}>
          <Typography sx={{ fontWeight: "medium", fontSize: "0.875rem" }}>
            {params.value || "—"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "actual_hours",
      headerName: "Actual Hours",
      width: 120,
      align: "center",
      headerAlign: "center",
      type: "number",
      renderCell: (params: GridRenderCellParams<WorkOrder>) => (
        <Box sx={{ 
          width: "100%", 
          height: "100%", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center" 
        }}>
          <Typography sx={{ fontWeight: "medium", fontSize: "0.875rem" }}>
            {params.value || "—"}
          </Typography>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh", p: 3 }}>
      {/* White Container */}
      <Box sx={{ backgroundColor: "#fff", borderRadius: 2, p: 3, boxShadow: 1 }}>
        {/* Title and Layout Container */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Title */}
          <Typography variant="h4">Work Orders</Typography>
          
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

                {/* Asset Filter */}
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Asset</InputLabel>
                  <Select
                    value={filters.asset}
                    onChange={(e) => handleFilterChange('asset', e.target.value)}
                    label="Asset"
                  >
                    <MenuItem value="">All Assets</MenuItem>
                    {filterOptions.asset_categories.map((asset) => (
                      <MenuItem key={asset} value={asset}>{asset}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Type Filter */}
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    {filterOptions.work_order_types.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
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
                      <MenuItem key={status} value={status}>{status.replace('_', ' ')}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Right Side - Add Button and Search Bar */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, minWidth: '400px' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAddModal}
                sx={{
                  backgroundColor: '#0f62fe',
                  '&:hover': {
                    backgroundColor: '#0043ce'
                  },
                  borderRadius: '4px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1
                }}
              >
                Add Work Order
              </Button>
              <TextField
                placeholder="Search work orders..."
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

                {/* Scheduled Date Range */}
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="Scheduled Start Date"
                      type="date"
                      size="small"
                      value={filters.scheduled_date_start || ''}
                      onChange={(e) => handleFilterChange('scheduled_date_start', e.target.value || null)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Scheduled End Date"
                      type="date"
                      size="small"
                      value={filters.scheduled_date_end || ''}
                      onChange={(e) => handleFilterChange('scheduled_date_end', e.target.value || null)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                </Box>

                {/* Start Date Range */}
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="Start Date From"
                      type="date"
                      size="small"
                      value={filters.start_date_start || ''}
                      onChange={(e) => handleFilterChange('start_date_start', e.target.value || null)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Start Date To"
                      type="date"
                      size="small"
                      value={filters.start_date_end || ''}
                      onChange={(e) => handleFilterChange('start_date_end', e.target.value || null)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                </Box>

                {/* End Date Range */}
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="End Date From"
                      type="date"
                      size="small"
                      value={filters.end_date_start || ''}
                      onChange={(e) => handleFilterChange('end_date_start', e.target.value || null)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="End Date To"
                      type="date"
                      size="small"
                      value={filters.end_date_end || ''}
                      onChange={(e) => handleFilterChange('end_date_end', e.target.value || null)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                </Box>

                {/* Estimated Hours Range */}
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="Min Estimated Hours"
                      type="number"
                      size="small"
                      value={filters.estimated_hours_min || ''}
                      onChange={(e) => handleFilterChange('estimated_hours_min', e.target.value ? Number(e.target.value) : null)}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Max Estimated Hours"
                      type="number"
                      size="small"
                      value={filters.estimated_hours_max || ''}
                      onChange={(e) => handleFilterChange('estimated_hours_max', e.target.value ? Number(e.target.value) : null)}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                </Box>

                {/* Actual Hours Range */}
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="Min Actual Hours"
                      type="number"
                      size="small"
                      value={filters.actual_hours_min || ''}
                      onChange={(e) => handleFilterChange('actual_hours_min', e.target.value ? Number(e.target.value) : null)}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Max Actual Hours"
                      type="number"
                      size="small"
                      value={filters.actual_hours_max || ''}
                      onChange={(e) => handleFilterChange('actual_hours_max', e.target.value ? Number(e.target.value) : null)}
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

          {/* Work Orders Data Grid */}
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={workOrders}
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

      {/* Work Order Details Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: { width: 600 }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Work Order Details
            </Typography>
            <IconButton onClick={handleCloseDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>

          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : selectedWorkOrder ? (
            <Box>
              {/* Work Order Information */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  {selectedWorkOrder.work_order.work_order_number} - {selectedWorkOrder.work_order.title}
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Chip 
                      label={selectedWorkOrder.work_order.status.replace('_', ' ')} 
                      color={getStatusColor(selectedWorkOrder.work_order.status) as any}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Priority</Typography>
                    <Chip 
                      label={selectedWorkOrder.work_order.priority} 
                      color={getPriorityColor(selectedWorkOrder.work_order.priority) as any}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Type</Typography>
                    <Typography variant="body1">
                      {selectedWorkOrder.work_order.work_order_type?.name || "N/A"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Asset</Typography>
                    <Typography variant="body1">
                      {selectedWorkOrder.work_order.asset?.name || "N/A"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Assigned To</Typography>
                    <Typography variant="body1">
                      {selectedWorkOrder.work_order.assignee?.username || "Unassigned"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Scheduled Date</Typography>
                    <Typography variant="body1">
                      {selectedWorkOrder.work_order.scheduled_date ? 
                        new Date(selectedWorkOrder.work_order.scheduled_date).toLocaleDateString() : 
                        "Not scheduled"
                      }
                    </Typography>
                  </Box>
                </Box>

                {selectedWorkOrder.work_order.description && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">Description</Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {selectedWorkOrder.work_order.description}
                    </Typography>
                  </Box>
                )}
              </Paper>

              {/* Parts Consumed */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Spare Parts Consumed
                </Typography>
                
                {selectedWorkOrder.parts_consumed.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Part Code</TableCell>
                          <TableCell>Part Name</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Unit Price</TableCell>
                          <TableCell align="right">Total Cost</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedWorkOrder.parts_consumed.map((part) => (
                          <TableRow key={part.id}>
                            <TableCell>{part.inventory_item.part_code}</TableCell>
                            <TableCell>{part.inventory_item.part_name}</TableCell>
                            <TableCell align="right">
                              {part.quantity_used} {part.inventory_item.unit_of_issue}
                            </TableCell>
                            <TableCell align="right">
                              ${part.inventory_item.unit_price.toFixed(2)}
                            </TableCell>
                            <TableCell align="right">
                              ${(part.quantity_used * part.inventory_item.unit_price).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No parts consumed for this work order.
                  </Typography>
                )}
              </Paper>
            </Box>
          ) : null}
        </Box>
      </Drawer>

      {/* Add Work Order Modal */}
      <Dialog 
        open={addModalOpen} 
        onClose={handleCloseAddModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #e0e0e0', 
          pb: 2,
          backgroundColor: '#f4f4f4'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#161616' }}>
              Add New Work Order
            </Typography>
            <IconButton 
              onClick={handleCloseAddModal}
              sx={{ 
                color: '#525252',
                '&:hover': { backgroundColor: '#e0e0e0' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Basic Information Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#161616' }}>
                Basic Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Title */}
                <TextField
                  fullWidth
                  label="Title *"
                  value={addFormData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '4px'
                    }
                  }}
                />

                {/* Description */}
                <TextField
                  fullWidth
                  label="Description"
                  value={addFormData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  multiline
                  rows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '4px'
                    }
                  }}
                />

                {/* Plant and Asset Category */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Plant</InputLabel>
                    <Select
                      value={addFormData.plant}
                      onChange={(e) => handleFormChange('plant', e.target.value)}
                      label="Plant"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '4px'
                        }
                      }}
                    >
                      <MenuItem value="">Select Plant</MenuItem>
                      {plants.map((plant) => (
                        <MenuItem key={plant} value={plant}>
                          {plant}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Asset Category</InputLabel>
                    <Select
                      value={addFormData.asset_category}
                      onChange={(e) => handleFormChange('asset_category', e.target.value)}
                      label="Asset Category"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '4px'
                        }
                      }}
                    >
                      <MenuItem value="">Select Asset Category</MenuItem>
                      {assetCategories.map((category) => (
                        <MenuItem key={category.id} value={category.name}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Asset and Work Order Type */}
                                                <Box sx={{ display: 'flex', gap: 2 }}>
                                  <FormControl fullWidth>
                                    <InputLabel>Asset</InputLabel>
                                    <Select
                                      value={addFormData.asset_id}
                                      onChange={(e) => handleFormChange('asset_id', e.target.value)}
                                      label="Asset"
                                      disabled={!addFormData.plant || !addFormData.asset_category}
                                      sx={{
                                        '& .MuiOutlinedInput-root': {
                                          borderRadius: '4px'
                                        }
                                      }}
                                    >
                                      <MenuItem value="">Select Asset</MenuItem>
                                      {filteredAssets.map((asset) => (
                                        <MenuItem key={asset.id} value={asset.id}>
                                          {asset.name}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Work Order Type</InputLabel>
                    <Select
                      value={addFormData.type_id}
                      onChange={(e) => handleFormChange('type_id', e.target.value)}
                      label="Work Order Type"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '4px'
                        }
                      }}
                    >
                      <MenuItem value="">Select Type</MenuItem>
                      {workOrderTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Priority and Estimated Hours */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={addFormData.priority}
                      onChange={(e) => handleFormChange('priority', e.target.value)}
                      label="Priority"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '4px'
                        }
                      }}
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="critical">Critical</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Estimated Hours"
                    type="number"
                    value={addFormData.estimated_hours}
                    onChange={(e) => handleFormChange('estimated_hours', e.target.value)}
                    inputProps={{ min: 0, step: 0.5 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '4px'
                      }
                    }}
                  />
                </Box>

                {/* Dates */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Scheduled Date"
                    type="date"
                    value={addFormData.scheduled_date}
                    onChange={(e) => handleFormChange('scheduled_date', e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '4px'
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={addFormData.start_date}
                    onChange={(e) => handleFormChange('start_date', e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '4px'
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={addFormData.end_date}
                    onChange={(e) => handleFormChange('end_date', e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '4px'
                      }
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Spare Parts Section */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#161616' }}>
                  Spare Parts Consumption
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleAddSparePart}
                  sx={{
                    borderColor: '#0f62fe',
                    color: '#0f62fe',
                    '&:hover': {
                      borderColor: '#0043ce',
                      backgroundColor: '#f4f4f4'
                    },
                    borderRadius: '4px',
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Add Part
                </Button>
              </Box>

              {spareParts.length > 0 && (
                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f4f4f4' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Part Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Part Code</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {spareParts.map((part, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Autocomplete
                              size="small"
                              options={inventoryItems}
                              getOptionLabel={(option) => option.part_name}
                              value={inventoryItems.find(item => item.id === part.part_id) || null}
                              onChange={(event, newValue) => {
                                if (newValue) {
                                  handlePartSelection(index, newValue.id);
                                } else {
                                  handleSparePartChange(index, 'part_id', 0);
                                  handleSparePartChange(index, 'part_name', '');
                                  handleSparePartChange(index, 'part_code', '');
                                }
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Type to search parts..."
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: '4px'
                                    }
                                  }}
                                />
                              )}
                              sx={{ minWidth: 200 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Autocomplete
                              size="small"
                              options={inventoryItems}
                              getOptionLabel={(option) => option.part_code}
                              value={inventoryItems.find(item => item.id === part.part_id) || null}
                              onChange={(event, newValue) => {
                                if (newValue) {
                                  handlePartSelection(index, newValue.id);
                                } else {
                                  handleSparePartChange(index, 'part_id', 0);
                                  handleSparePartChange(index, 'part_name', '');
                                  handleSparePartChange(index, 'part_code', '');
                                }
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Type to search part codes..."
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: '4px'
                                    }
                                  }}
                                />
                              )}
                              sx={{ minWidth: 150 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              value={part.quantity}
                              onChange={(e) => handleSparePartChange(index, 'quantity', parseInt(e.target.value) || 0)}
                              inputProps={{ min: 1 }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '4px'
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => handleRemoveSparePart(index)}
                              sx={{ color: '#da1e28' }}
                            >
                              <CloseIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {spareParts.length === 0 && (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 4, 
                  border: '2px dashed #e0e0e0',
                  borderRadius: '4px',
                  backgroundColor: '#fafafa'
                }}>
                  <Typography variant="body2" color="text.secondary">
                    No spare parts added. Click "Add Part" to include parts consumption.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0', backgroundColor: '#f4f4f4' }}>
          <Button 
            onClick={handleCloseAddModal} 
            disabled={submitting}
            sx={{
              color: '#525252',
              '&:hover': { backgroundColor: '#e0e0e0' },
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitWorkOrder} 
            variant="contained" 
            disabled={submitting || !addFormData.title.trim()}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
            sx={{
              backgroundColor: '#0f62fe',
              '&:hover': { backgroundColor: '#0043ce' },
              '&:disabled': { backgroundColor: '#c6c6c6' },
              borderRadius: '4px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            {submitting ? 'Creating...' : 'Create Work Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkOrders; 