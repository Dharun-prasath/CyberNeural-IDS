// Layout.tsx - Shared layout with sidebar for all pages
import React, { useState, useCallback, useMemo } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Switch,
  Tooltip,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SecurityIcon from '@mui/icons-material/Security';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';

const drawerWidth = 260;

const MainBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)'
    : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)',
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.mode === 'dark' ? '#1a237e' : '#1976d2',
    color: '#ffffff',
    borderRight: 'none',
    boxShadow: '4px 0 12px rgba(0,0,0,0.15)',
  },
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#0d47a1' : '#1976d2',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
}));

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'dark' ? '#64b5f6' : '#1976d2',
        light: mode === 'dark' ? '#90caf9' : '#42a5f5',
        dark: mode === 'dark' ? '#1976d2' : '#1565c0',
      },
      secondary: {
        main: mode === 'dark' ? '#81c784' : '#388e3c',
      },
      success: {
        main: '#4caf50',
      },
      error: {
        main: '#f44336',
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#fafafa',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h6: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
  }), [mode]);

  const darkMode = mode === 'dark';

  const handleThemeToggle = useCallback(() => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'LAN Security Analyzer Dashboard';
      case '/reports':
        return 'Security Reports & Analytics';
      case '/settings':
        return 'System Settings';
      default:
        return 'CyberNeural-IDS';
    }
  };

  const navigationItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Reports', icon: <BarChartIcon />, path: '/reports' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' }
  ];

  return (
    <ThemeProvider theme={theme}>
      <MainBox>
        <CssBaseline />
        <StyledDrawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar>
            <SecurityIcon sx={{ mr: 1, fontSize: 28 }} />
            <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
              CyberNeural-IDS
            </Typography>
          </Toolbar>
          <Divider />
          <List>
            {navigationItems.map(item => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={location.pathname === item.path}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
            <Divider sx={{ my: 1 }} />
            <ListItem>
              <Tooltip title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}>
                <Switch
                  checked={darkMode}
                  onChange={handleThemeToggle}
                  color="default"
                  inputProps={{ 'aria-label': 'Switch theme' }}
                />
              </Tooltip>
              <Typography variant="body2" sx={{ ml: 1 }}>
                {darkMode ? 'Dark Mode' : 'Light Mode'}
              </Typography>
            </ListItem>
          </List>
        </StyledDrawer>

        <Box
          component="main"
          sx={{ flexGrow: 1, width: `calc(100% - ${drawerWidth}px)` }}
        >
          <StyledAppBar
            position="fixed"
            sx={{ zIndex: 1201, ml: `${drawerWidth}px`, width: `calc(100% - ${drawerWidth}px)` }}
          >
            <Toolbar>
              <SecurityIcon sx={{ mr: 2, fontSize: 28 }} />
              <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
                {getPageTitle()}
              </Typography>
            </Toolbar>
          </StyledAppBar>
          <Toolbar />
          
          {/* Page Content */}
          {children}
        </Box>
      </MainBox>
    </ThemeProvider>
  );
};

export default Layout;
