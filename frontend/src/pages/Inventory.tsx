import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import API_ENDPOINTS from "../config/api";
import {
  DataGridPro,
  GridActionsCellItem,
  GridColDef,
  GridColumnApi,
  GridRenderCellParams,
} from "@mui/x-data-grid-pro";
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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Snackbar
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

interface InventoryItem {
  id: number;
  part_code: string;
  part_name: string;
  description: string;
  unit_of_issue: string;
  unit_price: number;
  minimum_quantity: number;
  category?: string;
  criticality?: string;
  created_at: string;
  updated_at: string;
  balances?: InventoryBalance[];
}

interface InventoryBalance {
  id: number;
  spare_part_id: number;
  location_id: number;
  in_stock: number;
  total_received: number;
  total_consumption: number;
  location_name: string;
}

interface WorkOrderConsumption {
  id: number;
  work_order_number: string;
  work_order_title: string;
  work_order_status: string;
  quantity_used: number;
  location_name: string;
  consumption_date: string;
  work_order_scheduled_date: string;
}

interface InventoryInflow {
  id: number;
  quantity: number;
  location_name: string;
  received_by: string;
  received_date: string;
  supplier: string;
  reference_number: string;
  unit_cost: number;
  total_cost: number;
}

interface InventoryDetails {
  inventory_item: InventoryItem;
  balances: InventoryBalance[];
  work_orders: WorkOrderConsumption[];
  inflows: InventoryInflow[];
}

interface Location {
  id: number;
  name: string;
}

interface TransferItem {
  spare_part_id: number;
  part_code: string;
  part_name: string;
  quantity: number;
}

interface ReceiveItem {
  spare_part_id: number;
  part_code: string;
  part_name: string;
  quantity: number;
}

interface TransferHistory {
  id: number;
  transfer_date: string;
  from_location_name: string;
  to_location_name: string;
  transferred_by: string;
  status: string;
  notes: string;
  items: TransferHistoryItem[];
}

interface TransferHistoryItem {
  part_code: string;
  part_name: string;
  quantity: number;
}

interface ReceiptHistory {
  id: number;
  received_date: string;
  received_from: string;
  received_to_name: string;
  received_by: string;
  supplier: string;
  reference_number: string;
  items: ReceiptHistoryItem[];
}

interface ReceiptHistoryItem {
  part_code: string;
  part_name: string;
  quantity: number;
  unit_cost: number;
}

interface InventoryTableProps {
  inventoryItems: InventoryItem[];
  loading: boolean;
  onViewItem: (item: InventoryItem) => void;
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (id: number) => void;
  transferDialogOpen?: boolean;
  receiveDialogOpen?: boolean;
  onTransferDialogClose?: () => void;
  onReceiveDialogClose?: () => void;
}

// Custom Timeline Component
const CustomTimeline: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{ position: 'relative' }}>
    <Box sx={{ 
      position: 'absolute', 
      left: 20, 
      top: 0, 
      bottom: 0, 
      width: 2, 
      backgroundColor: 'divider' 
    }} />
    {children}
  </Box>
);

const CustomTimelineItem: React.FC<{ 
  children: React.ReactNode; 
  isLast?: boolean;
  dotColor?: string;
}> = ({ children, isLast = false, dotColor = "primary.main" }) => (
  <Box sx={{ 
    position: 'relative', 
    pl: 6, 
    pb: isLast ? 0 : 3,
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 18,
      top: 24,
      width: 2,
      height: isLast ? 0 : 'calc(100% - 24px)',
      backgroundColor: 'divider'
    }
  }}>
    <Avatar sx={{ 
      position: 'absolute', 
      left: 12, 
      top: 8, 
      width: 16, 
      height: 16, 
      backgroundColor: dotColor 
    }}>
      <FiberManualRecordIcon sx={{ fontSize: 8 }} />
    </Avatar>
    {children}
  </Box>
);

const InventoryTable: React.FC<InventoryTableProps> = ({
  inventoryItems,
  loading,
  onViewItem,
  onEditItem,
  onDeleteItem,
  transferDialogOpen,
  receiveDialogOpen,
  onTransferDialogClose,
  onReceiveDialogClose,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Transfer Wizard state
  const [transferLoading, setTransferLoading] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [transferForm, setTransferForm] = useState({
    from_location_id: '',
    to_location_id: '',
    transferred_by: 1, // Default user ID
    transfer_date: new Date().toISOString().slice(0, 16),
    notes: '',
    items: [] as TransferItem[]
  });
  
  // Part search state
  const [partSearchQuery, setPartSearchQuery] = useState("");
  const [filteredParts, setFilteredParts] = useState<InventoryItem[]>([]);
  const [showPartDropdown, setShowPartDropdown] = useState(false);
  const [activePartIndex, setActivePartIndex] = useState(-1);

  // Receive Parts state
  const [receiveLoading, setReceiveLoading] = useState(false);
  const [receiveForm, setReceiveForm] = useState({
    received_date: new Date().toISOString().slice(0, 16),
    received_from: '',
    received_to: '',
    received_by: 1, // Default user ID
    supplier: '',
    reference_number: '',
    unit_cost: '',
    items: [] as ReceiveItem[]
  });
  
  // Notification state
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const getStockStatusColor = (inStock: number, minimumQuantity: number) => {
    if (inStock === 0) return "error";
    if (inStock <= minimumQuantity) return "warning";
    return "success";
  };

  const getStockStatusText = (inStock: number, minimumQuantity: number) => {
    if (inStock === 0) return "Out of Stock";
    if (inStock <= minimumQuantity) return "Low Stock";
    return "In Stock";
  };

  const calculateTotalStock = (item: InventoryItem) => {
    if (!item.balances) return 0;
    return item.balances.reduce((total, balance) => total + balance.in_stock, 0);
  };

  // Get stock for a specific part at a specific location
  const getStockAtLocation = (partId: number, locationId: number) => {
    const part = inventoryItems.find(item => item.id === partId);
    if (!part || !part.balances) return 0;
    const balance = part.balances.find(b => b.location_id === locationId);
    return balance ? balance.in_stock : 0;
  };

  // Filter parts based on search query
  const filterParts = (query: string) => {
    if (!query.trim()) {
      setFilteredParts([]);
      return;
    }
    
    const filtered = inventoryItems.filter(item => 
      item.part_code.toLowerCase().includes(query.toLowerCase()) ||
      item.part_name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredParts(filtered);
  };

  // Handle part search input
  const handlePartSearch = (index: number, field: 'part_code' | 'part_name', value: string) => {
    setPartSearchQuery(value);
    setActivePartIndex(index);
    setShowPartDropdown(true);
    filterParts(value);
  };

  // Handle part selection from dropdown
  const handlePartSelect = (index: number, selectedPart: InventoryItem) => {
    setTransferForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? {
          ...item,
          spare_part_id: selectedPart.id,
          part_code: selectedPart.part_code,
          part_name: selectedPart.part_name
        } : item
      )
    }));
    setShowPartDropdown(false);
    setPartSearchQuery("");
  };

  const handleItemClick = async (item: InventoryItem) => {
    setDetailsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.INVENTORY_DETAILS(item.id));
      if (response.ok) {
        const details = await response.json();
        setSelectedItem(details);
        setDrawerOpen(true);
        setActiveTab(0); // Reset to first tab
      }
    } catch (error) {
      console.error('Error fetching inventory details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedItem(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Load locations for dropdowns
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.INVENTORY_LOCATIONS);
        if (response.ok) {
          const data = await response.json();
          setLocations(data);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    fetchLocations();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowPartDropdown(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Transfer Wizard handlers
  const handleTransferDialogClose = () => {
    onTransferDialogClose?.();
    setTransferForm({
      from_location_id: '',
      to_location_id: '',
      transferred_by: 1,
      transfer_date: new Date().toISOString().slice(0, 16),
      notes: '',
      items: []
    });
    setShowPartDropdown(false);
    setPartSearchQuery("");
  };

  const handleAddTransferItem = () => {
    setTransferForm(prev => ({
      ...prev,
      items: [...prev.items, {
        spare_part_id: 0,
        part_code: '',
        part_name: '',
        quantity: 0
      }]
    }));
  };

  const handleRemoveTransferItem = (index: number) => {
    setTransferForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleTransferItemChange = (index: number, field: keyof TransferItem, value: any) => {
    setTransferForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleTransferSubmit = async () => {
    // Validate quantities
    const invalidItems = transferForm.items.filter(item => {
      if (!transferForm.from_location_id) return true;
      const availableStock = getStockAtLocation(item.spare_part_id, parseInt(transferForm.from_location_id));
      return item.quantity > availableStock;
    });

    if (invalidItems.length > 0) {
      setNotification({
        open: true,
        message: 'Some items exceed available stock at the source location',
        severity: 'error'
      });
      return;
    }

    setTransferLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.INVENTORY_TRANSFER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...transferForm,
          from_location_id: parseInt(transferForm.from_location_id),
          to_location_id: parseInt(transferForm.to_location_id),
          transfer_date: new Date(transferForm.transfer_date).toISOString(),
          items: transferForm.items.map(item => ({
            spare_part_id: item.spare_part_id,
            quantity: item.quantity
          }))
        })
      });

      if (response.ok) {
        setNotification({
          open: true,
          message: 'Transfer created successfully!',
          severity: 'success'
        });
        handleTransferDialogClose();
      } else {
        const error = await response.json();
        setNotification({
          open: true,
          message: error.detail || 'Failed to create transfer',
          severity: 'error'
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: 'Error creating transfer',
        severity: 'error'
      });
    } finally {
      setTransferLoading(false);
    }
  };

  // Receive Parts handlers
  const handleReceiveDialogClose = () => {
    onReceiveDialogClose?.();
    setReceiveForm({
      received_date: new Date().toISOString().slice(0, 16),
      received_from: '',
      received_to: '',
      received_by: 1,
      supplier: '',
      reference_number: '',
      unit_cost: '',
      items: []
    });
  };

  // Receive Parts handlers
  const handleAddReceiveItem = () => {
    setReceiveForm(prev => ({
      ...prev,
      items: [...prev.items, {
        spare_part_id: 0,
        part_code: '',
        part_name: '',
        quantity: 0
      }]
    }));
  };

  const handleRemoveReceiveItem = (index: number) => {
    setReceiveForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleReceiveItemChange = (index: number, field: keyof ReceiveItem, value: any) => {
    setReceiveForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleReceivePartSelect = (index: number, selectedPart: InventoryItem) => {
    setReceiveForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? {
          ...item,
          spare_part_id: selectedPart.id,
          part_code: selectedPart.part_code,
          part_name: selectedPart.part_name
        } : item
      )
    }));
    setShowPartDropdown(false);
    setPartSearchQuery("");
  };

  const handleReceiveSubmit = async () => {
    setReceiveLoading(true);
    try {
      // Process each item in the receive form
      for (const item of receiveForm.items) {
        const response = await fetch(API_ENDPOINTS.INVENTORY_RECEIVE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            spare_part_id: item.spare_part_id,
            location_id: parseInt(receiveForm.received_to),
            quantity: item.quantity,
            received_by: receiveForm.received_by,
            received_date: new Date(receiveForm.received_date).toISOString(),
            supplier: receiveForm.supplier,
            reference_number: receiveForm.reference_number,
            unit_cost: receiveForm.unit_cost ? parseFloat(receiveForm.unit_cost) : null
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || 'Failed to receive parts');
        }
      }

      setNotification({
        open: true,
        message: 'Parts received successfully!',
        severity: 'success'
      });
      handleReceiveDialogClose();
    } catch (error) {
      setNotification({
        open: true,
        message: error instanceof Error ? error.message : 'Error receiving parts',
        severity: 'error'
      });
    } finally {
      setReceiveLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Generate PDF Transmittal
  const generateTransmittalPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text("Transfer Transmittal", 105, 20, { align: "center" });
    
    // Add transfer details
    doc.setFontSize(12);
    doc.text("Transfer Details:", 20, 40);
    
    const fromLocation = locations.find(loc => loc.id === parseInt(transferForm.from_location_id))?.name || 'N/A';
    const toLocation = locations.find(loc => loc.id === parseInt(transferForm.to_location_id))?.name || 'N/A';
    
    doc.setFontSize(10);
    doc.text(`From Location: ${fromLocation}`, 20, 50);
    doc.text(`To Location: ${toLocation}`, 20, 60);
    doc.text(`Transfer Date: ${new Date(transferForm.transfer_date).toLocaleString()}`, 20, 70);
    doc.text(`Notes: ${transferForm.notes || 'N/A'}`, 20, 80);
    
    // Add items table
    if (transferForm.items.length > 0) {
      doc.text("Transfer Items:", 20, 100);
      
      const tableData = transferForm.items.map((item, index) => [
        index + 1,
        item.part_code,
        item.part_name,
        item.quantity.toString(),
        getStockAtLocation(item.spare_part_id, parseInt(transferForm.from_location_id)).toString()
      ]);
      
      autoTable(doc, {
        startY: 110,
        head: [['#', 'Part Code', 'Part Name', 'Quantity', 'Available Stock']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] },
        styles: { fontSize: 8 }
      });
    }
    
    // Add footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, pageHeight - 20);
    doc.text("CMMS Transfer Transmittal", 105, pageHeight - 10, { align: "center" });
    
    // Save the PDF
    doc.save(`transfer-transmittal-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Generate PDF Receipt Note
  const generateReceiptNotePDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text("Receipt Note", 105, 20, { align: "center" });
    
    // Add receipt details
    doc.setFontSize(12);
    doc.text("Receipt Details:", 20, 40);
    
    const receivedFrom = receiveForm.received_from || 'N/A';
    const receivedTo = locations.find(loc => loc.id === parseInt(receiveForm.received_to))?.name || 'N/A';
    
    doc.setFontSize(10);
    doc.text(`Received From: ${receivedFrom}`, 20, 50);
    doc.text(`Received To: ${receivedTo}`, 20, 60);
    doc.text(`Received Date: ${new Date(receiveForm.received_date).toLocaleString()}`, 20, 70);
    doc.text(`Supplier: ${receiveForm.supplier || 'N/A'}`, 20, 80);
    doc.text(`Reference Number: ${receiveForm.reference_number || 'N/A'}`, 20, 90);
    
    // Add items table
    if (receiveForm.items.length > 0) {
      doc.text("Received Items:", 20, 110);
      
      const tableData = receiveForm.items.map((item, index) => [
        index + 1,
        item.part_code,
        item.part_name,
        item.quantity.toString()
      ]);
      
      autoTable(doc, {
        startY: 120,
        head: [['#', 'Part Code', 'Part Name', 'Quantity']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] },
        styles: { fontSize: 8 }
      });
    }
    
    // Add footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, pageHeight - 20);
    doc.text("CMMS Receipt Note", 105, pageHeight - 10, { align: "center" });
    
    // Save the PDF
    doc.save(`receipt-note-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const columns: GridColDef[] = [
    { 
      field: "part_code", 
      headerName: "Part Code", 
      width: 150,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<InventoryItem>) => (
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
      field: "part_name", 
      headerName: "Part Name", 
      width: 250,
      align: "left",
      headerAlign: "left",
      renderCell: (params: GridRenderCellParams<InventoryItem>) => (
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
            onClick={() => handleItemClick(params.row)}
          >
            {params.value}
          </Typography>
        </Box>
      )
    },
    { 
      field: "description", 
      headerName: "Description", 
      width: 300,
      align: "left",
      headerAlign: "left",
      renderCell: (params: GridRenderCellParams<InventoryItem>) => (
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
      field: "unit_of_issue",
      headerName: "Unit",
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<InventoryItem>) => (
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
      ),
    },
    {
      field: "unit_price",
      headerName: "Unit Price",
      width: 140,
      align: "right",
      headerAlign: "right",
      renderCell: (params: GridRenderCellParams<InventoryItem>) => (
        <Box sx={{ 
          width: "100%", 
          height: "100%", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "flex-end",
          pr: 1
        }}>
          <Typography sx={{ fontWeight: "medium", fontSize: "0.875rem" }}>
            ${params.value?.toFixed(2) || "0.00"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "total_stock",
      headerName: "Total Stock",
      width: 150,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<InventoryItem>) => {
        const totalStock = calculateTotalStock(params.row);
        const stockStatus = getStockStatusColor(totalStock, params.row.minimum_quantity);
        const statusText = getStockStatusText(totalStock, params.row.minimum_quantity);
        
        return (
          <Box sx={{ 
            width: "100%", 
            height: "100%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            gap: 1
          }}>
            <Typography sx={{ fontWeight: "medium", fontSize: "0.875rem" }}>
              {totalStock}
            </Typography>
            <Chip 
              label={statusText} 
              color={stockStatus as any}
              size="small"
              sx={{ fontWeight: "medium", fontSize: "0.75rem" }}
            />
          </Box>
        );
      },
    },
    {
      field: "minimum_quantity",
      headerName: "Min Qty",
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<InventoryItem>) => (
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
      ),
    },
    {
      field: "total_value",
      headerName: "Total Value",
      width: 150,
      align: "right",
      headerAlign: "right",
      renderCell: (params: GridRenderCellParams<InventoryItem>) => {
        const totalStock = calculateTotalStock(params.row);
        const totalValue = totalStock * (params.row.unit_price || 0);
        
        return (
          <Box sx={{ 
            width: "100%", 
            height: "100%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "flex-end",
            pr: 1
          }}>
            <Typography sx={{ fontWeight: "medium", fontSize: "0.875rem" }}>
              ${totalValue.toFixed(2)}
            </Typography>
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ backgroundColor: "#fff", p: 3 }}>
      {/* DataGrid Table */}

      {/* DataGrid Table */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "400px",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ height: 600, width: "100%" }}>
          <DataGridPro
            rows={inventoryItems}
            columns={columns}
            disableRowSelectionOnClick
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            getRowId={(row) => row.id}
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
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid #e0e0e0',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f5f5f5',
                borderBottom: '2px solid #e0e0e0',
              },
            }}
          />
        </Box>
      )}

      {/* Inventory Details Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: { width: 700 }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Inventory Details
            </Typography>
            <IconButton onClick={handleCloseDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>

          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : selectedItem ? (
            <Box>
              {/* Header with Part Info */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  {selectedItem.inventory_item.part_code} - {selectedItem.inventory_item.part_name}
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Unit Price</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      ${selectedItem.inventory_item.unit_price?.toFixed(2) || "0.00"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Unit of Issue</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {selectedItem.inventory_item.unit_of_issue}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Minimum Quantity</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {selectedItem.inventory_item.minimum_quantity}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Stock</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {selectedItem.balances.reduce((total, balance) => total + balance.in_stock, 0)}
                    </Typography>
                  </Box>
                </Box>

                {selectedItem.inventory_item.description && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">Description</Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {selectedItem.inventory_item.description}
                    </Typography>
                  </Box>
                )}
              </Paper>

              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                  <Tab 
                    icon={<InfoIcon />} 
                    label="Part Info" 
                    iconPosition="start"
                  />
                  <Tab 
                    icon={<BuildIcon />} 
                    label="Work Orders" 
                    iconPosition="start"
                  />
                  <Tab 
                    icon={<ReceiptIcon />} 
                    label="Inflow" 
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

              {/* Tab Content */}
              {activeTab === 0 && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Stock by Location
                  </Typography>
                  
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Location</TableCell>
                          <TableCell align="right">In Stock</TableCell>
                          <TableCell align="right">Total Received</TableCell>
                          <TableCell align="right">Total Consumed</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedItem.balances.map((balance) => (
                          <TableRow key={balance.id}>
                            <TableCell>{balance.location_name}</TableCell>
                            <TableCell align="right">{balance.in_stock}</TableCell>
                            <TableCell align="right">{balance.total_received}</TableCell>
                            <TableCell align="right">{balance.total_consumption}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}

              {activeTab === 1 && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Work Order Consumption Timeline
                  </Typography>
                  
                  {selectedItem.work_orders.length > 0 ? (
                    <CustomTimeline>
                      {selectedItem.work_orders.map((workOrder, index) => (
                        <CustomTimelineItem 
                          key={workOrder.id} 
                          isLast={index === selectedItem.work_orders.length - 1}
                          dotColor="primary.main"
                        >
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {new Date(workOrder.consumption_date).toLocaleDateString()}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                              {workOrder.work_order_number}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {workOrder.work_order_title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                              <Chip 
                                label={workOrder.work_order_status.replace('_', ' ')} 
                                size="small"
                                color={workOrder.work_order_status === 'completed' ? 'success' : 
                                       workOrder.work_order_status === 'in_progress' ? 'info' : 'warning'}
                              />
                              <Typography variant="body2">
                                Qty: {workOrder.quantity_used} | Location: {workOrder.location_name}
                              </Typography>
                            </Box>
                          </Box>
                        </CustomTimelineItem>
                      ))}
                    </CustomTimeline>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No work orders have consumed this part.
                    </Typography>
                  )}
                </Paper>
              )}

              {activeTab === 2 && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Material Receipts Timeline
                  </Typography>
                  
                  {selectedItem.inflows.length > 0 ? (
                    <CustomTimeline>
                      {selectedItem.inflows.map((inflow, index) => (
                        <CustomTimelineItem 
                          key={inflow.id} 
                          isLast={index === selectedItem.inflows.length - 1}
                          dotColor="success.main"
                        >
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {new Date(inflow.received_date).toLocaleDateString()}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                              {inflow.supplier}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Ref: {inflow.reference_number}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                              <Typography variant="body2">
                                Qty: {inflow.quantity} | Location: {inflow.location_name}
                              </Typography>
                              <Typography variant="body2">
                                Cost: ${inflow.total_cost.toFixed(2)}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Received by: {inflow.received_by}
                            </Typography>
                          </Box>
                        </CustomTimelineItem>
                      ))}
                    </CustomTimeline>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No material receipts found for this part.
                    </Typography>
                  )}
                </Paper>
              )}
            </Box>
          ) : null}
        </Box>
      </Drawer>

            {/* Transfer Wizard Dialog */}
      <Dialog
        open={transferDialogOpen || false}
        onClose={handleTransferDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SwapHorizIcon />
            <Typography variant="h6">Transfer Wizard</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>From Location</InputLabel>
                <Select
                  value={transferForm.from_location_id}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, from_location_id: e.target.value }))}
                  label="From Location"
                >
                  {locations.map((location) => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>To Location</InputLabel>
                <Select
                  value={transferForm.to_location_id}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, to_location_id: e.target.value }))}
                  label="To Location"
                >
                  {locations.map((location) => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                sx={{ flex: 1 }}
                label="Transfer Date"
                type="datetime-local"
                value={transferForm.transfer_date}
                onChange={(e) => setTransferForm(prev => ({ ...prev, transfer_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                sx={{ flex: 1 }}
                label="Notes"
                value={transferForm.notes}
                onChange={(e) => setTransferForm(prev => ({ ...prev, notes: e.target.value }))}
                multiline
                rows={1}
              />
            </Box>
            
            {/* Transfer Items */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Transfer Items</Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />}
                  onClick={handleAddTransferItem}
                >
                  Add Item
                </Button>
              </Box>
              
              {transferForm.items.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  {/* Part Code */}
                  <Box sx={{ position: 'relative', minWidth: 150 }}>
                    <TextField
                      label="Part Code"
                      value={item.part_code}
                      onChange={(e) => {
                        handleTransferItemChange(index, 'part_code', e.target.value);
                        handlePartSearch(index, 'part_code', e.target.value);
                      }}
                      size="small"
                    />
                    {showPartDropdown && activePartIndex === index && filteredParts.length > 0 && (
                      <Box 
                        sx={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          zIndex: 1000,
                          backgroundColor: 'white',
                          border: '1px solid #ccc',
                          borderRadius: 1,
                          maxHeight: 200,
                          overflow: 'auto',
                          boxShadow: 2
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {filteredParts.map((part) => (
                          <Box
                            key={part.id}
                            sx={{
                              p: 1,
                              cursor: 'pointer',
                              '&:hover': { backgroundColor: '#f5f5f5' }
                            }}
                            onClick={() => handlePartSelect(index, part)}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {part.part_code}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {part.part_name}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>

                  {/* Part Name */}
                  <Box sx={{ position: 'relative', minWidth: 200 }}>
                    <TextField
                      label="Part Name"
                      value={item.part_name}
                      onChange={(e) => {
                        handleTransferItemChange(index, 'part_name', e.target.value);
                        handlePartSearch(index, 'part_name', e.target.value);
                      }}
                      size="small"
                    />
                    {showPartDropdown && activePartIndex === index && filteredParts.length > 0 && (
                      <Box 
                        sx={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          zIndex: 1000,
                          backgroundColor: 'white',
                          border: '1px solid #ccc',
                          borderRadius: 1,
                          maxHeight: 200,
                          overflow: 'auto',
                          boxShadow: 2
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {filteredParts.map((part) => (
                          <Box
                            key={part.id}
                            sx={{
                              p: 1,
                              cursor: 'pointer',
                              '&:hover': { backgroundColor: '#f5f5f5' }
                            }}
                            onClick={() => handlePartSelect(index, part)}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {part.part_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {part.part_code}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>

                  {/* In Stock */}
                  <TextField
                    label="In Stock"
                    value={transferForm.from_location_id ? getStockAtLocation(item.spare_part_id, parseInt(transferForm.from_location_id)) : 'Select From Location'}
                    size="small"
                    sx={{ width: 120 }}
                    InputProps={{ readOnly: true }}
                  />

                  {/* Quantity */}
                  <TextField
                    label="Quantity"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleTransferItemChange(index, 'quantity', parseInt(e.target.value))}
                    size="small"
                    sx={{ width: 100 }}
                  />

                  <IconButton 
                    onClick={() => handleRemoveTransferItem(index)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={generateTransmittalPDF}
            startIcon={<PictureAsPdfIcon />}
            variant="outlined"
            disabled={transferForm.items.length === 0}
          >
            Generate Transmittal
          </Button>
          <Button onClick={handleTransferDialogClose}>Cancel</Button>
          <Button 
            onClick={handleTransferSubmit} 
            variant="contained"
            disabled={transferLoading || transferForm.items.length === 0}
          >
            {transferLoading ? <CircularProgress size={20} /> : 'Create Transfer'}
          </Button>
        </DialogActions>
      </Dialog>

            {/* Receive Parts Dialog */}
      <Dialog
        open={receiveDialogOpen || false}
        onClose={handleReceiveDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon />
            <Typography variant="h6">Receive Parts</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            {/* Header Information */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                sx={{ flex: 1 }}
                label="Received Date"
                type="datetime-local"
                value={receiveForm.received_date}
                onChange={(e) => setReceiveForm(prev => ({ ...prev, received_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                sx={{ flex: 1 }}
                label="Received From"
                value={receiveForm.received_from}
                onChange={(e) => setReceiveForm(prev => ({ ...prev, received_from: e.target.value }))}
              />
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Received To (Location)</InputLabel>
                <Select
                  value={receiveForm.received_to}
                  onChange={(e) => setReceiveForm(prev => ({ ...prev, received_to: e.target.value }))}
                  label="Received To (Location)"
                >
                  {locations.map((location) => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                sx={{ flex: 1 }}
                label="Supplier"
                value={receiveForm.supplier}
                onChange={(e) => setReceiveForm(prev => ({ ...prev, supplier: e.target.value }))}
              />
              <TextField
                sx={{ flex: 1 }}
                label="Reference Number"
                value={receiveForm.reference_number}
                onChange={(e) => setReceiveForm(prev => ({ ...prev, reference_number: e.target.value }))}
              />
              <TextField
                sx={{ flex: 1 }}
                label="Unit Cost"
                type="number"
                value={receiveForm.unit_cost}
                onChange={(e) => setReceiveForm(prev => ({ ...prev, unit_cost: e.target.value }))}
              />
            </Box>
            
            {/* Receive Items */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Receive Items</Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />}
                  onClick={handleAddReceiveItem}
                >
                  Add Item
                </Button>
              </Box>
              
              {receiveForm.items.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  {/* Part Code */}
                  <Box sx={{ position: 'relative', minWidth: 150 }}>
                    <TextField
                      label="Part Code"
                      value={item.part_code}
                      onChange={(e) => {
                        handleReceiveItemChange(index, 'part_code', e.target.value);
                        handlePartSearch(index, 'part_code', e.target.value);
                      }}
                      size="small"
                    />
                    {showPartDropdown && activePartIndex === index && filteredParts.length > 0 && (
                      <Box 
                        sx={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          zIndex: 1000,
                          backgroundColor: 'white',
                          border: '1px solid #ccc',
                          borderRadius: 1,
                          maxHeight: 200,
                          overflow: 'auto',
                          boxShadow: 2
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {filteredParts.map((part) => (
                          <Box
                            key={part.id}
                            sx={{
                              p: 1,
                              cursor: 'pointer',
                              '&:hover': { backgroundColor: '#f5f5f5' }
                            }}
                            onClick={() => handleReceivePartSelect(index, part)}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {part.part_code}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {part.part_name}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>

                  {/* Part Name */}
                  <Box sx={{ position: 'relative', minWidth: 200 }}>
                    <TextField
                      label="Part Name"
                      value={item.part_name}
                      onChange={(e) => {
                        handleReceiveItemChange(index, 'part_name', e.target.value);
                        handlePartSearch(index, 'part_name', e.target.value);
                      }}
                      size="small"
                    />
                    {showPartDropdown && activePartIndex === index && filteredParts.length > 0 && (
                      <Box 
                        sx={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          zIndex: 1000,
                          backgroundColor: 'white',
                          border: '1px solid #ccc',
                          borderRadius: 1,
                          maxHeight: 200,
                          overflow: 'auto',
                          boxShadow: 2
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {filteredParts.map((part) => (
                          <Box
                            key={part.id}
                            sx={{
                              p: 1,
                              cursor: 'pointer',
                              '&:hover': { backgroundColor: '#f5f5f5' }
                            }}
                            onClick={() => handleReceivePartSelect(index, part)}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {part.part_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {part.part_code}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>

                  {/* Quantity */}
                  <TextField
                    label="Quantity"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleReceiveItemChange(index, 'quantity', parseInt(e.target.value))}
                    size="small"
                    sx={{ width: 100 }}
                  />

                  <IconButton 
                    onClick={() => handleRemoveReceiveItem(index)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={generateReceiptNotePDF}
            startIcon={<PictureAsPdfIcon />}
            variant="outlined"
            disabled={receiveForm.items.length === 0}
          >
            Generate Receipt Note
          </Button>
          <Button onClick={handleReceiveDialogClose}>Cancel</Button>
          <Button 
            onClick={handleReceiveSubmit} 
            variant="contained"
            disabled={receiveLoading || receiveForm.items.length === 0}
          >
            {receiveLoading ? <CircularProgress size={20} /> : 'Receive Parts'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Transfer History Component
const TransferHistoryComponent: React.FC<{ transfers: TransferHistory[]; loading: boolean }> = ({ transfers, loading }) => {
  const [selectedTransfer, setSelectedTransfer] = useState<TransferHistory | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleTransferClick = (transfer: TransferHistory) => {
    setSelectedTransfer(transfer);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedTransfer(null);
  };

  const generateTransmittalPDF = (transfer: TransferHistory) => {
    const { jsPDF } = require("jspdf");
    const autoTable = require("jspdf-autotable").default;
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text("TRANSMITTAL", 105, 20, { align: "center" });
    
    // Transfer details
    doc.setFontSize(12);
    doc.text(`Transfer #: ${transfer.id}`, 20, 40);
    doc.text(`Date: ${new Date(transfer.transfer_date).toLocaleDateString()}`, 20, 50);
    doc.text(`From: ${transfer.from_location_name}`, 20, 60);
    doc.text(`To: ${transfer.to_location_name}`, 20, 70);
    doc.text(`Status: ${transfer.status}`, 20, 80);
    doc.text(`Transferred By: ${transfer.transferred_by}`, 20, 90);
    
    if (transfer.notes) {
      doc.text(`Notes: ${transfer.notes}`, 20, 100);
    }
    
    // Items table
    const tableData = transfer.items.map(item => [
      item.part_code,
      item.part_name,
      item.quantity.toString()
    ]);
    
    autoTable(doc, {
      head: [['Part Code', 'Part Name', 'Quantity']],
      body: tableData,
      startY: transfer.notes ? 110 : 100,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    doc.save(`transmittal_${transfer.id}.pdf`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>Transfer History</Typography>
      
      {transfers.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No transfers found</Typography>
          <Typography variant="body2" color="text.secondary">Transfer history will appear here</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {transfers.map((transfer) => (
            <Paper 
              key={transfer.id} 
              sx={{ 
                p: 2, 
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
              onClick={() => handleTransferClick(transfer)}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">
                  Transfer #{transfer.id}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label={transfer.status} 
                    color={transfer.status === 'completed' ? 'success' : 'warning'}
                    size="small"
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      generateTransmittalPDF(transfer);
                    }}
                    sx={{ color: 'primary.main' }}
                  >
                    <PictureAsPdfIcon />
                  </IconButton>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 4, mb: 1 }}>
                <Typography variant="body2">
                  <strong>Date:</strong> {new Date(transfer.transfer_date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  <strong>From:</strong> {transfer.from_location_name}
                </Typography>
                <Typography variant="body2">
                  <strong>To:</strong> {transfer.to_location_name}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                <strong>Items:</strong> {transfer.items.length} items • <strong>By:</strong> {transfer.transferred_by}
              </Typography>
              
              {transfer.notes && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Notes:</strong> {transfer.notes}
                </Typography>
              )}
            </Paper>
          ))}
        </Box>
      )}

      {/* Transfer Details Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        sx={{ '& .MuiDrawer-paper': { width: 400 } }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Transfer Details</Typography>
            <IconButton onClick={handleCloseDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          {selectedTransfer && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Transfer #{selectedTransfer.id}</Typography>
                <Button
                  variant="outlined"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={() => generateTransmittalPDF(selectedTransfer)}
                  size="small"
                >
                  Download Transmittal
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Date:</strong> {new Date(selectedTransfer.transfer_date).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>From:</strong> {selectedTransfer.from_location_name}
                </Typography>
                <Typography variant="body2">
                  <strong>To:</strong> {selectedTransfer.to_location_name}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {selectedTransfer.status}
                </Typography>
                <Typography variant="body2">
                  <strong>Transferred By:</strong> {selectedTransfer.transferred_by}
                </Typography>
                {selectedTransfer.notes && (
                  <Typography variant="body2">
                    <strong>Notes:</strong> {selectedTransfer.notes}
                  </Typography>
                )}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6">Transfer Items</Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Part Code</TableCell>
                      <TableCell>Part Name</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedTransfer.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.part_code}</TableCell>
                        <TableCell>{item.part_name}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

// Receipt History Component
const ReceiptHistoryComponent: React.FC<{ receipts: ReceiptHistory[]; loading: boolean }> = ({ receipts, loading }) => {
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptHistory | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleReceiptClick = (receipt: ReceiptHistory) => {
    setSelectedReceipt(receipt);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedReceipt(null);
  };

  const generateReceiptNotePDF = (receipt: ReceiptHistory) => {
    const { jsPDF } = require("jspdf");
    const autoTable = require("jspdf-autotable").default;
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text("RECEIPT NOTE", 105, 20, { align: "center" });
    
    // Receipt details
    doc.setFontSize(12);
    doc.text(`Receipt #: ${receipt.id}`, 20, 40);
    doc.text(`Date: ${new Date(receipt.received_date).toLocaleDateString()}`, 20, 50);
    doc.text(`From: ${receipt.received_from}`, 20, 60);
    doc.text(`To: ${receipt.received_to_name}`, 20, 70);
    doc.text(`Received By: ${receipt.received_by}`, 20, 80);
    doc.text(`Supplier: ${receipt.supplier}`, 20, 90);
    doc.text(`Reference: ${receipt.reference_number}`, 20, 100);
    
    // Items table
    const tableData = receipt.items.map(item => [
      item.part_code,
      item.part_name,
      item.quantity.toString(),
      `$${item.unit_cost.toFixed(2)}`,
      `$${(item.quantity * item.unit_cost).toFixed(2)}`
    ]);
    
    autoTable(doc, {
      head: [['Part Code', 'Part Name', 'Quantity', 'Unit Cost', 'Total Cost']],
      body: tableData,
      startY: 110,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    // Calculate total
    const totalCost = receipt.items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
    doc.text(`Total Cost: $${totalCost.toFixed(2)}`, 20, doc.lastAutoTable.finalY + 10);
    
    doc.save(`receipt_note_${receipt.id}.pdf`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>Receipt History</Typography>
      
      {receipts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No receipts found</Typography>
          <Typography variant="body2" color="text.secondary">Receipt history will appear here</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {receipts.map((receipt) => (
            <Paper 
              key={receipt.id} 
              sx={{ 
                p: 2, 
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
              onClick={() => handleReceiptClick(receipt)}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">
                  Receipt #{receipt.id}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label="Received" 
                    color="success"
                    size="small"
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      generateReceiptNotePDF(receipt);
                    }}
                    sx={{ color: 'primary.main' }}
                  >
                    <PictureAsPdfIcon />
                  </IconButton>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 4, mb: 1 }}>
                <Typography variant="body2">
                  <strong>Date:</strong> {new Date(receipt.received_date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  <strong>From:</strong> {receipt.received_from}
                </Typography>
                <Typography variant="body2">
                  <strong>To:</strong> {receipt.received_to_name}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                <strong>Items:</strong> {receipt.items.length} items • <strong>By:</strong> {receipt.received_by}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                <strong>Supplier:</strong> {receipt.supplier} • <strong>Ref:</strong> {receipt.reference_number}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}

      {/* Receipt Details Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        sx={{ '& .MuiDrawer-paper': { width: 400 } }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Receipt Details</Typography>
            <IconButton onClick={handleCloseDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          {selectedReceipt && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Receipt #{selectedReceipt.id}</Typography>
                <Button
                  variant="outlined"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={() => generateReceiptNotePDF(selectedReceipt)}
                  size="small"
                >
                  Download Receipt Note
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Date:</strong> {new Date(selectedReceipt.received_date).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>From:</strong> {selectedReceipt.received_from}
                </Typography>
                <Typography variant="body2">
                  <strong>To:</strong> {selectedReceipt.received_to_name}
                </Typography>
                <Typography variant="body2">
                  <strong>Received By:</strong> {selectedReceipt.received_by}
                </Typography>
                <Typography variant="body2">
                  <strong>Supplier:</strong> {selectedReceipt.supplier}
                </Typography>
                <Typography variant="body2">
                  <strong>Reference:</strong> {selectedReceipt.reference_number}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6">Receipt Items</Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Part Code</TableCell>
                      <TableCell>Part Name</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Cost</TableCell>
                      <TableCell align="right">Total Cost</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedReceipt.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.part_code}</TableCell>
                        <TableCell>{item.part_name}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">${item.unit_cost.toFixed(2)}</TableCell>
                        <TableCell align="right">${(item.quantity * item.unit_cost).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ textAlign: 'right', mt: 2 }}>
                <Typography variant="h6">
                  Total: ${selectedReceipt.items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

// Main Inventory component that fetches data
const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferHistory, setTransferHistory] = useState<TransferHistory[]>([]);
  const [receiptHistory, setReceiptHistory] = useState<ReceiptHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    location: '',
    asset_category: '',
    category: '',
    criticality: '',
    minimum_quantity_min: '',
    minimum_quantity_max: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    locations: [],
    asset_categories: [],
    categories: [],
    criticalities: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);

  // Fetch inventory from database
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.INVENTORY);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Fetch balances for each inventory item
        const itemsWithBalances = await Promise.all(
          data.map(async (item: InventoryItem) => {
            try {
              const detailsResponse = await fetch(API_ENDPOINTS.INVENTORY_DETAILS(item.id));
              if (detailsResponse.ok) {
                const details = await detailsResponse.json();
                return {
                  ...item,
                  balances: details.balances
                };
              }
            } catch (error) {
              console.error(`Error fetching details for item ${item.id}:`, error);
            }
            return item;
          })
        );
        
        setInventoryItems(itemsWithBalances);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.INVENTORY_FILTERS);
        if (response.ok) {
          const data = await response.json();
          setFilterOptions(data);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch transfer and receipt history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setHistoryLoading(true);
        
        // Fetch transfer history
        try {
          const transferResponse = await fetch(API_ENDPOINTS.INVENTORY_TRANSFERS);
          if (transferResponse.ok) {
            const transferData = await transferResponse.json();
            setTransferHistory(transferData);
          } else {
            console.error('Transfer response not ok:', transferResponse.status);
            const errorText = await transferResponse.text();
            console.error('Transfer error text:', errorText);
          }
        } catch (error) {
          console.error('Error fetching transfers:', error);
        }
        
        // Fetch receipt history
        try {
          const receiptResponse = await fetch(API_ENDPOINTS.INVENTORY_RECEIPTS);
          if (receiptResponse.ok) {
            const receiptData = await receiptResponse.json();
            setReceiptHistory(receiptData);
          } else {
            console.error('Receipt response not ok:', receiptResponse.status);
            const errorText = await receiptResponse.text();
            console.error('Receipt error text:', errorText);
          }
        } catch (error) {
          console.error('Error fetching receipts:', error);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleViewItem = (item: InventoryItem) => {
    // View inventory item functionality
  };

  const handleEditItem = (item: InventoryItem) => {
    // Edit inventory item functionality
  };

  const handleDeleteItem = async (id: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.INVENTORY_DELETE(id), {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove item from local state
        setInventoryItems(inventoryItems.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error deleting inventory item:', error);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Filter inventory items based on search query and filters
  const filteredInventoryItems = inventoryItems.filter(item => {
    // Search query filtering
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      item.part_code.toLowerCase().includes(searchLower) ||
      item.part_name.toLowerCase().includes(searchLower) ||
      (item.description && item.description.toLowerCase().includes(searchLower));

    // Filter by location
    const matchesLocation = filters.location === '' || 
      (item.balances && item.balances.some(balance => 
        balance.location_name === filters.location
      ));

    // Filter by asset category
    const matchesAssetCategory = filters.asset_category === '' || 
      item.category === filters.asset_category;

    // Filter by category
    const matchesCategory = filters.category === '' || 
      item.category === filters.category;

    // Filter by criticality
    const matchesCriticality = filters.criticality === '' || 
      item.criticality === filters.criticality;

    // Filter by minimum quantity range
    const minQty = item.minimum_quantity;
    const minFilter = filters.minimum_quantity_min === '' ? 0 : parseInt(filters.minimum_quantity_min);
    const maxFilter = filters.minimum_quantity_max === '' ? Infinity : parseInt(filters.minimum_quantity_max);
    const matchesMinQuantity = minQty >= minFilter && minQty <= maxFilter;

    return matchesSearch && matchesLocation && matchesAssetCategory && 
           matchesCategory && matchesCriticality && matchesMinQuantity;
  });

  const handleTransferDialogOpen = () => {
    setTransferDialogOpen(true);
  };

  const handleReceiveDialogOpen = () => {
    setReceiveDialogOpen(true);
  };

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh", p: 3 }}>
      {/* White Container */}
      <Box sx={{ backgroundColor: "#fff", borderRadius: 2, p: 3, boxShadow: 1 }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="inventory tabs">
            <Tab 
              icon={<InventoryIcon />} 
              label="Inventory" 
              iconPosition="start"
            />
            <Tab 
              icon={<SwapHorizIcon />} 
              label="Transfers" 
              iconPosition="start"
            />
            <Tab 
              icon={<ReceiptIcon />} 
              label="Receipts" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box>
            {/* Title and Layout Container */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3 }}>
              {/* Title */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Typography variant="h4">Inventory</Typography>
                <Typography variant="body2" color="text.secondary">
                  {filteredInventoryItems.length} of {inventoryItems.length} items
                </Typography>
              </Box>
              
              {/* Search, Transfer, Receive Buttons Row */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 3 }}>
                {/* Left Side - Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<SwapHorizIcon />}
                    onClick={() => setTransferDialogOpen(true)}
                  >
                    Transfer Wizard
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<ReceiptIcon />}
                    onClick={() => setReceiveDialogOpen(true)}
                  >
                    Receive Parts
                  </Button>
                </Box>

                {/* Right Side - Search Bar */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', minWidth: '300px' }}>
                  <TextField
                    placeholder="Search inventory..."
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

              {/* Filters Row */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {/* Location Filter */}
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Location</InputLabel>
                    <Select
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      label="Location"
                    >
                      <MenuItem value="">All Locations</MenuItem>
                      {filterOptions.locations.map((location) => (
                        <MenuItem key={location} value={location}>{location}</MenuItem>
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

                  {/* Category Filter */}
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      label="Category"
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {filterOptions.categories.map((category) => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Criticality Filter */}
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Criticality</InputLabel>
                    <Select
                      value={filters.criticality}
                      onChange={(e) => handleFilterChange('criticality', e.target.value)}
                      label="Criticality"
                    >
                      <MenuItem value="">All Criticalities</MenuItem>
                      {filterOptions.criticalities.map((criticality) => (
                        <MenuItem key={criticality} value={criticality}>{criticality}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Minimum Quantity Filter - Min */}
                  <TextField
                    label="Min Qty (Min)"
                    type="number"
                    size="small"
                    value={filters.minimum_quantity_min}
                    onChange={(e) => handleFilterChange('minimum_quantity_min', e.target.value)}
                    sx={{ minWidth: 120 }}
                  />
                  
                  {/* Minimum Quantity Filter - Max */}
                  <TextField
                    label="Min Qty (Max)"
                    type="number"
                    size="small"
                    value={filters.minimum_quantity_max}
                    onChange={(e) => handleFilterChange('minimum_quantity_max', e.target.value)}
                    sx={{ minWidth: 120 }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Inventory Table */}
            <Box data-testid="inventory-table">
              <InventoryTable
                inventoryItems={filteredInventoryItems}
                loading={loading}
                onViewItem={handleViewItem}
                onEditItem={handleEditItem}
                onDeleteItem={handleDeleteItem}
                transferDialogOpen={transferDialogOpen}
                receiveDialogOpen={receiveDialogOpen}
                onTransferDialogClose={() => setTransferDialogOpen(false)}
                onReceiveDialogClose={() => setReceiveDialogOpen(false)}
              />
            </Box>
          </Box>
        )}
        
        {activeTab === 1 && (
          <Box>
            <TransferHistoryComponent 
              transfers={transferHistory} 
              loading={historyLoading} 
            />
          </Box>
        )}
        
        {activeTab === 2 && (
          <Box>
            <ReceiptHistoryComponent 
              receipts={receiptHistory} 
              loading={historyLoading} 
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Inventory; 