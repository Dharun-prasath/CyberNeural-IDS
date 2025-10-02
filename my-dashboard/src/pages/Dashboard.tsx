// Dashboard.tsx - Professional LAN Security Analyzer
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  CssBaseline,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Switch,
  Slide,
  Fade,
  TextField,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Badge,
  IconButton,
  Divider,
  Tab,
  Tabs,
  Avatar,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Stack,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRowParams } from '@mui/x-data-grid';
import Papa from 'papaparse';
import {
  Dashboard as DashboardIcon,
  Security,
  NetworkCheck,
  Warning,
  Assessment,
  Settings,
  Download as DownloadIcon,
  DeleteOutline as DeleteOutlineIcon,
  FileUpload as FileUploadIcon,
  Refresh,
  Shield,
  Computer,
  NotificationsActive,
  Speed,
  DeviceHub,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { PieChart, BarChart } from '@mui/x-charts';

// Types and Interfaces
interface NetworkDevice {
  id: string;
  name: string;
  ip: string;
  type: 'router' | 'switch' | 'computer' | 'server' | 'mobile';
  status: 'online' | 'offline' | 'suspicious';
  lastSeen: string;
  threats: number;
  bandwidth: number;
}

interface Threat {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target: string;
  timestamp: string;
  status: 'active' | 'mitigated' | 'investigating';
  description: string;
}

interface AlertItem {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  category: string;
  status: 'new' | 'acknowledged' | 'resolved';
  description: string;
}

interface NetworkStats {
  totalDevices: number;
  activeConnections: number;
  threats: number;
  bandwidth: number;
  uptime: string;
}

// Custom styled components
const drawerWidth = 280;

const MainBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(180deg, #1e293b 0%, #334155 100%)'
      : 'linear-gradient(180deg, #1e40af 0%, #3b82f6 100%)',
    color: '#ffffff',
    borderRight: 'none',
    boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
  },
}));

const StatusCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  border: '1px solid',
  borderColor: theme.palette.mode === 'dark' ? '#334155' : '#e2e8f0',
  borderRadius: '16px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  },
}));

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  border: '1px solid',
  borderColor: theme.palette.mode === 'dark' ? '#334155' : '#e2e8f0',
  borderRadius: '16px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  },
}));

const ThreatChip = styled(Chip)<{ severity: string }>(({ theme, severity }) => {
  const colors = {
    critical: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    high: { bg: '#fef3c7', color: '#d97706', border: '#fed7aa' },
    medium: { bg: '#fef9e5', color: '#ca8a04', border: '#fde68a' },
    low: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  };
  
  const colorScheme = colors[severity as keyof typeof colors] || colors.low;
  
  return {
    backgroundColor: theme.palette.mode === 'dark' ? `${colorScheme.color}20` : colorScheme.bg,
    color: colorScheme.color,
    border: `1px solid ${colorScheme.border}`,
    fontWeight: 600,
    fontSize: '0.75rem',
  };
});

const AnimatedPaper: React.FC<{ children: React.ReactNode; sx?: any }> = ({ children, sx, ...props }) => (
  <Fade in timeout={350}>
    <Paper elevation={4} sx={sx} {...props}>{children}</Paper>
  </Fade>
);

// Helper functions
const toCsvString = (rows: Array<{ category: string; count: number; status: string }>) =>
  [
    ['Category', 'Count', 'Status'],
    ...rows.map(row => [row.category, row.count, row.status]),
  ]
    .map(r => r.join(',')).join('\n');

const generateMockData = () => {
  const devices: NetworkDevice[] = [
    { id: '1', name: 'Main Router', ip: '192.168.1.1', type: 'router', status: 'online', lastSeen: '2 mins ago', threats: 0, bandwidth: 85.2 },
    { id: '2', name: 'Office Switch', ip: '192.168.1.2', type: 'switch', status: 'online', lastSeen: '1 min ago', threats: 1, bandwidth: 45.7 },
    { id: '3', name: 'Workstation-01', ip: '192.168.1.10', type: 'computer', status: 'suspicious', lastSeen: '5 mins ago', threats: 3, bandwidth: 23.4 },
    { id: '4', name: 'Server-DB', ip: '192.168.1.100', type: 'server', status: 'online', lastSeen: '30 secs ago', threats: 0, bandwidth: 78.9 },
    { id: '5', name: 'Mobile-Device', ip: '192.168.1.150', type: 'mobile', status: 'offline', lastSeen: '2 hours ago', threats: 0, bandwidth: 0 },
  ];

  const threats: Threat[] = [
    { id: '1', type: 'DDoS Attack', severity: 'critical', source: '192.168.1.50', target: '192.168.1.100', timestamp: '2 mins ago', status: 'active', description: 'Distributed denial of service attack detected' },
    { id: '2', type: 'Malware Detection', severity: 'high', source: '192.168.1.10', target: 'External', timestamp: '15 mins ago', status: 'investigating', description: 'Suspicious outbound traffic detected' },
    { id: '3', type: 'Port Scan', severity: 'medium', source: '192.168.1.25', target: '192.168.1.1', timestamp: '1 hour ago', status: 'mitigated', description: 'Port scanning activity detected and blocked' },
  ];

  const alerts: AlertItem[] = [
    { id: '1', title: 'Critical Security Breach', severity: 'critical', timestamp: '2 mins ago', category: 'Security', status: 'new', description: 'Unauthorized access attempt detected' },
    { id: '2', title: 'High Bandwidth Usage', severity: 'high', timestamp: '15 mins ago', category: 'Performance', status: 'acknowledged', description: 'Unusual bandwidth consumption detected' },
    { id: '3', title: 'Device Disconnection', severity: 'medium', timestamp: '1 hour ago', category: 'Network', status: 'resolved', description: 'Critical device went offline unexpectedly' },
  ];

  return { devices, threats, alerts };
};

// Main Component
const Dashboard: React.FC = () => {
  // Theme and UI state
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: mode === 'dark' ? '#3b82f6' : '#1e40af' },
      secondary: { main: mode === 'dark' ? '#10b981' : '#059669' },
      error: { main: '#ef4444' },
      warning: { main: '#f59e0b' },
      success: { main: '#10b981' },
      background: {
        default: mode === 'dark' ? '#0f172a' : '#f8fafc',
        paper: mode === 'dark' ? '#1e293b' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
  }), [mode]);

  // Core application state
  const [currentTab, setCurrentTab] = useState(0);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'error' | 'success' | 'info' | 'warning'}>({ 
    open: false, message: '', severity: 'success' 
  });
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Network monitoring state
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    totalDevices: 0,
    activeConnections: 0,
    threats: 0,
    bandwidth: 0,
    uptime: '0d 0h 0m',
  });
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [threatFilter, setThreatFilter] = useState<string>('all');
  const [alertFilter, setAlertFilter] = useState<string>('all');

  // Real-time data simulation
  useEffect(() => {
    const mockData = generateMockData();
    setDevices(mockData.devices);
    setThreats(mockData.threats);
    setAlerts(mockData.alerts);
    
    setNetworkStats({
      totalDevices: mockData.devices.length,
      activeConnections: mockData.devices.filter(d => d.status === 'online').length,
      threats: mockData.threats.filter(t => t.status === 'active').length,
      bandwidth: mockData.devices.reduce((sum, d) => sum + d.bandwidth, 0) / mockData.devices.length,
      uptime: '15d 8h 32m',
    });

    // Simulate real-time updates
    const interval = setInterval(() => {
      setNetworkStats(prev => ({
        ...prev,
        bandwidth: Math.max(10, Math.min(100, prev.bandwidth + (Math.random() - 0.5) * 10)),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Event handlers
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setCurrentTab(newValue);
  const handleThemeToggle = () => setMode(mode === 'light' ? 'dark' : 'light');

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['text/csv', 'application/vnd.ms-excel'].includes(file.type)) {
      setSnackbar({ open: true, message: 'Only CSV files are allowed!', severity: 'error' });
      return;
    }
    setCsvFile(file);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPreviewData(results.data.slice(0, 10));
      },
      error: (err) => {
        setSnackbar({open: true, message: err.message, severity: 'error'});
      }
    });
  }, []);

  const clearFile = () => {
    setCsvFile(null);
    setPreviewData([]);
    setAnalysisResults([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const analyzeCSV = async () => {
    if (!csvFile) {
      setSnackbar({open: true, message: 'Please select a CSV file first.', severity: 'error'});
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      const response = await fetch('http://localhost:5000/predict_csv', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error analyzing CSV');
      const rows = Object.entries(data.summary)
        .filter(([key]) => key !== 'total_samples')
        .map(([key, value], idx) => ({
          id: idx + 1,
          category: key,
          count: value as number,
          status: key === 'normal' ? 'Safe' : 'Malicious'
        }));
      setAnalysisResults(rows);
      setSnackbar({open: true, message: 'Analysis complete!', severity: 'success'});
    } catch (err: any) {
      setSnackbar({open: true, message: err.message || 'Server error', severity: 'error'});
    } finally {
      setLoading(false);
    }
  };

  const downloadResults = () => {
    const csvString = toCsvString(analysisResults);
    const blob = new Blob([csvString], { type: 'text/csv' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = 'analysis_results.csv';
    a.href = href;
    a.click();
    URL.revokeObjectURL(href);
  };

  const handleDeviceClick = (device: NetworkDevice) => {
    console.log('Device clicked:', device);
    // Future: Open device details dialog
  };

  const handleThreatFilterChange = (event: SelectChangeEvent) => {
    setThreatFilter(event.target.value);
  };

  const handleAlertAction = (alertId: string, action: 'acknowledge' | 'resolve') => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: action === 'acknowledge' ? 'acknowledged' : 'resolved' }
        : alert
    ));
    setSnackbar({
      open: true, 
      message: `Alert ${action === 'acknowledge' ? 'acknowledged' : 'resolved'} successfully`, 
      severity: 'success'
    });
  };

  // Filtered data
  const filteredThreats = threats.filter(threat => 
    threatFilter === 'all' || threat.severity === threatFilter
  );

  const filteredAlerts = alerts.filter(alert => 
    alertFilter === 'all' || alert.severity === alertFilter
  );

  const filteredResults = analysisResults.filter(row =>
    row.category.toLowerCase().includes(search.toLowerCase()) ||
    row.status.toLowerCase().includes(search.toLowerCase())
  );

  // Chart data
  const pieData = useMemo(() => {
    let safe = 0;
    let malicious = 0;
    analysisResults.forEach((row: { status: string; count: number }) => {
      if (row.status === 'Safe') {
        safe += row.count;
      } else {
        malicious += row.count;
      }
    });
    return [
      { id: 0, value: safe, label: 'Safe', color: '#10b981' },
      { id: 1, value: malicious, label: 'Malicious', color: '#ef4444' },
    ];
  }, [analysisResults]);

  const bandwidthData = useMemo(() => {
    return devices.map((device, index) => ({
      x: index,
      y: device.bandwidth,
      label: device.name,
    }));
  }, [devices]);

  // DataGrid columns
  const deviceColumns: GridColDef[] = [
    { field: 'name', headerName: 'Device Name', flex: 1 },
    { field: 'ip', headerName: 'IP Address', width: 150 },
    { field: 'type', headerName: 'Type', width: 120 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'online' ? 'success' : params.value === 'offline' ? 'default' : 'error'} 
          size="small" 
        />
      )
    },
    { field: 'threats', headerName: 'Threats', width: 100 },
    { field: 'bandwidth', headerName: 'Bandwidth %', width: 120 },
  ];

  const threatColumns: GridColDef[] = [
    { field: 'type', headerName: 'Threat Type', flex: 1 },
    { 
      field: 'severity', 
      headerName: 'Severity', 
      width: 120,
      renderCell: (params) => (
        <ThreatChip severity={params.value} label={params.value} size="small" />
      )
    },
    { field: 'source', headerName: 'Source', width: 150 },
    { field: 'target', headerName: 'Target', width: 150 },
    { field: 'timestamp', headerName: 'Time', width: 120 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'active' ? 'error' : params.value === 'mitigated' ? 'success' : 'warning'} 
          size="small" 
        />
      )
    },
  ];

  const analysisColumns: GridColDef[] = [
    { field: 'category', headerName: 'Category', flex: 1 },
    { field: 'count', headerName: 'Count', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'Safe' ? 'success' : 'error'} 
          size="small" 
        />
      )
    }
  ];

  const renderOverviewTab = () => (
    <Box>
      {/* Key Metrics */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <MetricCard>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {networkStats.totalDevices}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Devices
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <DeviceHub />
              </Avatar>
            </Box>
          </MetricCard>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <MetricCard>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {networkStats.activeConnections}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Connections
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <NetworkCheck />
              </Avatar>
            </Box>
          </MetricCard>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <MetricCard>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" color="error.main" fontWeight="bold">
                  {networkStats.threats}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Threats
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'error.main' }}>
                <Warning />
              </Avatar>
            </Box>
          </MetricCard>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <MetricCard>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {networkStats.bandwidth.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Bandwidth
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <Speed />
              </Avatar>
            </Box>
          </MetricCard>
        </Box>
      </Box>

      {/* Charts and Analysis */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 400px', minWidth: 400 }}>
          <StatusCard>
            <CardHeader title="Network Bandwidth Usage" />
            <CardContent>
              <BarChart
                dataset={bandwidthData}
                xAxis={[{ dataKey: 'x' }]}
                series={[{ dataKey: 'y', label: 'Bandwidth %', color: '#3b82f6' }]}
                width={400}
                height={300}
              />
            </CardContent>
          </StatusCard>
        </Box>
        <Box sx={{ flex: '1 1 400px', minWidth: 400 }}>
          <StatusCard>
            <CardHeader title="Threat Analysis Results" />
            <CardContent>
              {pieData.some(d => d.value > 0) ? (
                <PieChart
                  series={[{ data: pieData }]}
                  width={400}
                  height={300}
                />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                  <Typography variant="body1" color="text.secondary">
                    No analysis data available. Upload a CSV file to see results.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </StatusCard>
        </Box>
      </Box>

      {/* Recent Alerts */}
      <StatusCard sx={{ mb: 3 }}>
        <CardHeader 
          title="Recent Alerts" 
          action={
            <IconButton>
              <Refresh />
            </IconButton>
          }
        />
        <CardContent>
          <List>
            {alerts.slice(0, 3).map((alert) => (
              <ListItem key={alert.id} divider>
                <ListItemIcon>
                  <Badge 
                    color={alert.severity === 'critical' ? 'error' : alert.severity === 'high' ? 'warning' : 'info'} 
                    variant="dot"
                  >
                    <NotificationsActive />
                  </Badge>
                </ListItemIcon>
                <ListItemText
                  primary={alert.title}
                  secondary={`${alert.category} • ${alert.timestamp}`}
                />
                <ThreatChip severity={alert.severity} label={alert.severity} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </StatusCard>
    </Box>
  );

  const renderDevicesTab = () => (
    <Box>
      <StatusCard>
        <CardHeader title="Network Devices" />
        <CardContent>
          <DataGrid
            rows={devices}
            columns={deviceColumns}
            autoHeight
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[5, 10, 25]}
            onRowClick={(params: GridRowParams<NetworkDevice>) => handleDeviceClick(params.row)}
            sx={{
              '& .MuiDataGrid-row:hover': {
                cursor: 'pointer',
              },
            }}
          />
        </CardContent>
      </StatusCard>
    </Box>
  );

  const renderThreatsTab = () => (
    <Box>
      <StatusCard>
        <CardHeader 
          title="Threat Analysis" 
          action={
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Filter</InputLabel>
              <Select
                value={threatFilter}
                label="Filter"
                onChange={handleThreatFilterChange}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          }
        />
        <CardContent>
          <DataGrid
            rows={filteredThreats}
            columns={threatColumns}
            autoHeight
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[5, 10, 25]}
          />
        </CardContent>
      </StatusCard>
    </Box>
  );

  const renderAlertsTab = () => (
    <Box>
      <StatusCard>
        <CardHeader 
          title="Security Alerts" 
          action={
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Filter</InputLabel>
              <Select
                value={alertFilter}
                label="Filter"
                onChange={(e) => setAlertFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="acknowledged">Acknowledged</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </FormControl>
          }
        />
        <CardContent>
          <List>
            {filteredAlerts.map((alert) => (
              <ListItem 
                key={alert.id}
                divider
                secondaryAction={
                  <Stack direction="row" spacing={1}>
                    {alert.status === 'new' && (
                      <Button 
                        size="small" 
                        onClick={() => handleAlertAction(alert.id, 'acknowledge')}
                      >
                        Acknowledge
                      </Button>
                    )}
                    {alert.status !== 'resolved' && (
                      <Button 
                        size="small" 
                        color="success"
                        onClick={() => handleAlertAction(alert.id, 'resolve')}
                      >
                        Resolve
                      </Button>
                    )}
                  </Stack>
                }
              >
                <ListItemIcon>
                  <Badge 
                    color={alert.severity === 'critical' ? 'error' : alert.severity === 'high' ? 'warning' : 'info'} 
                    variant="dot"
                  >
                    <Security />
                  </Badge>
                </ListItemIcon>
                <ListItemText
                  primary={alert.title}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {alert.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <ThreatChip severity={alert.severity} label={alert.severity} />
                        <Chip 
                          label={alert.status} 
                          size="small" 
                          color={alert.status === 'resolved' ? 'success' : alert.status === 'acknowledged' ? 'warning' : 'error'}
                        />
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </StatusCard>
    </Box>
  );

  const renderAnalysisTab = () => (
    <Box>
      {/* CSV Upload Section */}
      <AnimatedPaper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>
          CSV File Analysis
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Upload network traffic data in CSV format for malicious activity detection
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            ref={fileInputRef}
            style={{ display: 'none' }}
            id="csv-upload"
          />
          <label htmlFor="csv-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<FileUploadIcon />}
            >
              Choose CSV File
            </Button>
          </label>
          
          {csvFile && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<DeleteOutlineIcon />}
              onClick={clearFile}
            >
              Clear
            </Button>
          )}
          
          {analysisResults.length > 0 && (
            <Button
              variant="outlined"
              color="success"
              startIcon={<DownloadIcon />}
              onClick={downloadResults}
            >
              Download Results
            </Button>
          )}
        </Box>
        
        {csvFile && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            Selected File: {csvFile.name}
          </Typography>
        )}
      </AnimatedPaper>

      {/* Data Preview */}
      {previewData.length > 0 && (
        <AnimatedPaper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Data Preview (First 10 Rows)
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Device ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {previewData.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      {row['Device ID'] || row['ID'] || `Device-${idx + 1}`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ textAlign: 'right', mt: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={analyzeCSV}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Assessment />}
            >
              {loading ? 'Analyzing...' : 'Analyze CSV'}
            </Button>
          </Box>
        </AnimatedPaper>
      )}

      {/* Analysis Results */}
      {analysisResults.length > 0 && (
        <Slide direction="up" in>
          <StatusCard>
            <CardHeader title="Analysis Results" />
            <CardContent>
              <TextField
                label="Search Results"
                size="small"
                sx={{ mb: 2 }}
                variant="outlined"
                value={search}
                onChange={e => setSearch(e.target.value)}
                fullWidth
              />
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: '2 1 600px', minWidth: '60%' }}>
                  <DataGrid
                    rows={filteredResults}
                    columns={analysisColumns}
                    autoHeight
                    initialState={{
                      pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    sx={{
                      '& .MuiDataGrid-row': {
                        '&:nth-of-type(odd)': {
                          bgcolor: 'action.hover',
                        },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: 300, display: 'flex', justifyContent: 'center' }}>
                  <PieChart
                    series={[{ data: pieData }]}
                    width={300}
                    height={200}
                  />
                </Box>
              </Box>
            </CardContent>
          </StatusCard>
        </Slide>
      )}
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <MainBox>
        <CssBaseline />
        
        {/* Sidebar */}
        <StyledDrawer variant="permanent">
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <Shield />
              </Avatar>
              <Typography variant="h6" noWrap fontWeight="bold">
                CyberNeural IDS
              </Typography>
            </Box>
          </Toolbar>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
          <List>
            {[
              { text: 'Overview', icon: <DashboardIcon />, index: 0 },
              { text: 'Devices', icon: <Computer />, index: 1 },
              { text: 'Threats', icon: <Security />, index: 2 },
              { text: 'Alerts', icon: <Warning />, index: 3 },
              { text: 'Analysis', icon: <Assessment />, index: 4 },
              { text: 'Settings', icon: <Settings />, index: 5 },
            ].map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={currentTab === item.index}
                  onClick={() => setCurrentTab(item.index)}
                  sx={{
                    '&.Mui-selected': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.15)',
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
          </List>
          <Box sx={{ flexGrow: 1 }} />
          <List>
            <ListItem>
              <ListItemIcon sx={{ color: 'inherit' }}>
                <Settings />
              </ListItemIcon>
              <Switch
                checked={mode === 'dark'}
                onChange={handleThemeToggle}
                color="default"
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {mode === 'dark' ? 'Dark' : 'Light'}
              </Typography>
            </ListItem>
          </List>
        </StyledDrawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{ 
            flexGrow: 1, 
            p: 3, 
            width: `calc(100% - ${drawerWidth}px)`,
            overflow: 'auto'
          }}
        >
          <Container maxWidth="xl">
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" gutterBottom fontWeight="bold">
                Network Security Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Real-time monitoring and threat analysis for your LAN infrastructure
              </Typography>
            </Box>

            {/* Tab Navigation */}
            <Paper sx={{ mb: 3 }}>
              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Overview" icon={<DashboardIcon />} iconPosition="start" />
                <Tab label="Devices" icon={<Computer />} iconPosition="start" />
                <Tab label="Threats" icon={<Security />} iconPosition="start" />
                <Tab label="Alerts" icon={<Warning />} iconPosition="start" />
                <Tab label="Analysis" icon={<Assessment />} iconPosition="start" />
              </Tabs>
            </Paper>

            {/* Tab Content */}
            {currentTab === 0 && renderOverviewTab()}
            {currentTab === 1 && renderDevicesTab()}
            {currentTab === 2 && renderThreatsTab()}
            {currentTab === 3 && renderAlertsTab()}
            {currentTab === 4 && renderAnalysisTab()}
          </Container>
        </Box>

        {/* Loading Overlay */}
        {loading && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
          >
            <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={60} />
              <Typography variant="h6">Analyzing CSV data...</Typography>
            </Paper>
          </Box>
        )}

        {/* Snackbar Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </MainBox>
    </ThemeProvider>
  );
};

export default Dashboard;