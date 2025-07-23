import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Menu, 
  MenuItem, 
  Drawer, 
  List, 
  ListItem,
  ListItemButton, 
  ListItemText, 
  ListItemIcon, 
  Divider,
  useMediaQuery,
  useTheme,
  Switch,
  FormControlLabel
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BuildIcon from '@mui/icons-material/Build';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  toggleDarkMode?: () => void;
  isDarkMode?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ toggleDarkMode, isDarkMode }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Main navigation items - moved to left side as requested
  const mainNavItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Assets', icon: <BuildIcon />, path: '/assets' },
    { text: 'Work Orders', icon: <AssignmentIcon />, path: '/work-orders' },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
  ];

  // Management items - moved to drawer only
  const managementItems = [
    { text: 'Users', icon: <PeopleIcon />, path: '/users' },
    { text: 'Settings', icon: <DarkModeIcon />, path: '/settings' },
  ];

  // Combined items for the drawer
  const allMenuItems = [...mainNavItems, ...managementItems];

  const drawerContent = (
    <Box sx={{ width: 280 }} role="presentation">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          backgroundColor: 'primary.main',
          color: 'white',
        }}
      >
        <Typography variant="h6">CMMS System</Typography>
        <IconButton color="inherit" onClick={toggleDrawer} edge="end">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {allMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                toggleDrawer();
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      {toggleDarkMode && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={isDarkMode} 
                  onChange={toggleDarkMode}
                  color="primary"
                />
              }
              label="Dark Mode"
            />
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar sx={{ borderBottom: 1, borderColor: 'divider' }}>
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        {/* CMMS Logo/Title - left aligned */}
        <Typography
          variant="h4"
          color="inherit"
          noWrap
          sx={{ mr: 4, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          CMMS
        </Typography>
        
        {/* Main navigation items - left aligned */}
        {!isMobile && (
          <Box sx={{ display: 'flex', flexGrow: 1 }}>
            {mainNavItems.map((item) => (
              <Button 
                color="inherit" 
                key={item.text}
                onClick={() => navigate(item.path)}
                sx={{ mx: 1 }}
              >
                {item.text}
              </Button>
            ))}
          </Box>
        )}
        
        {/* Profile button - right aligned */}
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
          <Button
            color="inherit"
            onClick={handleProfileMenuOpen}
            startIcon={<AccountCircleIcon />}
          >
            Profile
          </Button>
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: { 
                borderRadius: 0,
                mt: 0.5
              }
            }}
          >
            <MenuItem onClick={() => {
              handleMenuClose();
              navigate('/profile');
            }}>My Account</MenuItem>
            <Divider />
            <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        PaperProps={{
          sx: {
            borderRadius: 0,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </AppBar>
  );
};

export default TopBar;