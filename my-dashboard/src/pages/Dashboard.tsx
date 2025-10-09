// Dashboard.tsx - Professional LAN Security Analyzer
import React, { useState, useRef, useCallback, useMemo } from 'react';
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
  Chip,
  Tooltip,
  IconButton,
  Divider,
  LinearProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import Papa from 'papaparse';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import SecurityIcon from '@mui/icons-material/Security';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { styled } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { PieChart } from '@mui/x-charts/PieChart';

// Custom styled components with professional design
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

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 8px 24px rgba(0,0,0,0.4)'
      : '0 8px 24px rgba(0,0,0,0.15)',
  },
}));

import type { ReactNode } from 'react';

// Enhanced Props Interface
interface AnimatedPaperProps extends React.ComponentProps<typeof Paper> {
  children: ReactNode;
}

// Professional Animated Paper Component
const AnimatedPaper: React.FC<AnimatedPaperProps> = ({ children, sx, ...props }) => (
  <Fade in timeout={350}>
    <StyledPaper elevation={6} sx={sx} {...props}>
      {children}
    </StyledPaper>
  </Fade>
);

// Statistical Summary Interface
interface AnalysisStats {
  totalSamples: number;
  normalCount: number;
  threatCount: number;
  threatPercentage: number;
}

// Helper function to format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// Helper function to convert analysis results to CSV
const toCsvString = (rows: Array<{ category: string; count: number; status: string }>) =>
  [
    ['Category', 'Count', 'Status', 'Percentage'],
    ...rows.map(row => {
      const total = rows.reduce((sum, r) => sum + r.count, 0);
      const percentage = ((row.count / total) * 100).toFixed(2);
      return [row.category, row.count, row.status, `${percentage}%`];
    }),
  ]
    .map(r => r.join(',')).join('\n');

// Calculate statistics from analysis results
const calculateStats = (results: Array<{ status: string; count: number }>): AnalysisStats => {
  const totalSamples = results.reduce((sum, row) => sum + row.count, 0);
  const normalCount = results.find(row => row.status === 'Safe')?.count || 0;
  const threatCount = totalSamples - normalCount;
  const threatPercentage = totalSamples > 0 ? (threatCount / totalSamples) * 100 : 0;
  
  return {
    totalSamples,
    normalCount,
    threatCount,
    threatPercentage,
  };
};

// Main Component with Enhanced Features
const Dashboard: React.FC = () => {
  // Theme state with improved palette
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

  // Core application state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'error' | 'success' | 'info' | 'warning';
  }>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate statistics
  const stats = useMemo(() => calculateStats(analysisResults), [analysisResults]);

  // Enhanced CSV upload handler with validation
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!['text/csv', 'application/vnd.ms-excel'].includes(file.type) && !file.name.endsWith('.csv')) {
      setSnackbar({ 
        open: true, 
        message: 'Invalid file type. Please upload a CSV file.', 
        severity: 'error' 
      });
      return;
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setSnackbar({ 
        open: true, 
        message: 'File size exceeds 10MB limit. Please upload a smaller file.', 
        severity: 'error' 
      });
      return;
    }
    
    setCsvFile(file);
    setSnackbar({ 
      open: true, 
      message: 'File uploaded successfully. Processing preview...', 
      severity: 'info' 
    });
    
    // Parse CSV with improved error handling
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          setSnackbar({
            open: true, 
            message: 'CSV file is empty. Please upload a file with data.', 
            severity: 'warning'
          });
          return;
        }
        setPreviewData(results.data.slice(0, 10));
        setSnackbar({ 
          open: true, 
          message: `Preview loaded: ${results.data.length} rows found`, 
          severity: 'success' 
        });
      },
      error: (err) => {
        setSnackbar({
          open: true, 
          message: `Error parsing CSV: ${err.message}`, 
          severity: 'error'
        });
        setCsvFile(null);
      }
    });
  }, []);

  // Clear file with user confirmation
  const clearFile = useCallback(() => {
    setCsvFile(null);
    setPreviewData([]);
    setAnalysisResults([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSnackbar({ 
      open: true, 
      message: 'File cleared successfully', 
      severity: 'info' 
    });
  }, []);

  // Enhanced CSV analysis with better error handling
  const analyzeCSV = async () => {
    if (!csvFile) {
      setSnackbar({
        open: true, 
        message: 'Please select a CSV file first.', 
        severity: 'warning'
      });
      return;
    }
    
    setLoading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      
      setUploadProgress(30);
      
      const response = await fetch('http://localhost:5000/predict_csv', { 
        method: 'POST', 
        body: formData 
      });
      
      setUploadProgress(70);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }
      
      setUploadProgress(90);
      
      // Transform summary into table rows with enhanced data
      const rows = Object.entries(data.summary)
        .filter(([key]) => key !== 'total_samples')
        .map(([key, value], idx) => ({
          id: idx + 1,
          category: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          count: value as number,
          status: key === 'normal' ? 'Safe' : 'Malicious'
        }));
      
      setAnalysisResults(rows);
      setUploadProgress(100);
      
      const threatCount = rows.filter(r => r.status === 'Malicious').length;
      setSnackbar({
        open: true, 
        message: `Analysis complete! Found ${threatCount} threat categories.`, 
        severity: 'success'
      });
    } catch (err: any) {
      console.error('Analysis error:', err);
      setSnackbar({
        open: true, 
        message: err.message || 'Server error. Please ensure the Flask backend is running.', 
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // Download results with enhanced metadata
  const downloadResults = useCallback(() => {
    const csvString = toCsvString(analysisResults);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    a.download = `lan_security_analysis_${timestamp}.csv`;
    a.href = href;
    a.click();
    URL.revokeObjectURL(href);
    
    setSnackbar({ 
      open: true, 
      message: 'Results exported successfully', 
      severity: 'success' 
    });
  }, [analysisResults]);

  // Enhanced DataGrid columns with custom rendering
  const columns: GridColDef[] = useMemo(() => [
    { 
      field: 'category', 
      headerName: 'Threat Category', 
      flex: 1,
      minWidth: 150,
    },
    { 
      field: 'count', 
      headerName: 'Count', 
      flex: 0.5,
      minWidth: 100,
      type: 'number',
      renderCell: (params) => (
        <Chip 
          label={formatNumber(params.value as number)}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.7,
      minWidth: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value}
          size="small"
          color={params.value === 'Safe' ? 'success' : 'error'}
          icon={params.value === 'Safe' ? <SecurityIcon /> : <InfoIcon />}
        />
      ),
    }
  ], []);

  // Search and filter logic
  const filteredResults = analysisResults.filter(row =>
    row.category.toLowerCase().includes(search.toLowerCase())
    || row.status.toLowerCase().includes(search.toLowerCase())
  );

  // Enhanced pie chart data with professional colors
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
      { 
        id: 0, 
        value: safe, 
        label: `Safe (${safe})`, 
        color: '#4caf50' 
      },
      { 
        id: 1, 
        value: malicious, 
        label: `Malicious (${malicious})`, 
        color: '#f44336' 
      },
    ];
  }, [analysisResults]);

  // Theme toggle handler
  const handleThemeToggle = useCallback(() => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  }, []);

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
              width: drawerWidth, boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar>
            <SecurityIcon sx={{ mr: 1 }} />
            <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>CyberNeural-IDS</Typography>
          </Toolbar>
          <Divider />
          <List>
            {[
              { text: 'Dashboard', icon: <DashboardIcon /> },
              { text: 'Reports', icon: <BarChartIcon /> },
              { text: 'Settings', icon: <SettingsIcon /> }
            ].map(item => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton>
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
              <Typography variant="body2" sx={{ ml: 1 }}>{darkMode ? 'Dark Mode' : 'Light Mode'}</Typography>
            </ListItem>
          </List>
        </StyledDrawer>
        <Box
          component="main"
          sx={{ flexGrow: 1, p: { xs: 1, sm: 3 }, width: `calc(100% - ${drawerWidth}px)` }}
        >
          <StyledAppBar position="fixed" sx={{ zIndex: 1201, ml: `${drawerWidth}px`, width: `calc(100% - ${drawerWidth}px)` }}>
            <Toolbar>
              
              <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
                LAN SECURITY ANALYZER DASHBAORD
              </Typography>
            </Toolbar>
          </StyledAppBar>
          <Toolbar />

          {/* CSV Upload Section with Enhanced UI */}
          <AnimatedPaper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CloudUploadIcon color="primary" />
                  Upload CSV File
                </Typography>
                <Typography variant="body2" gutterBottom color="text.secondary">
                  Upload a CSV file containing Device IDs for security analysis. Maximum file size: 10MB.
                </Typography>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  id="csv-upload"
                  aria-label="Upload CSV"
                />
                <label htmlFor="csv-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<FileUploadIcon />}
                    disabled={loading}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    Choose File
                  </Button>
                </label>
                {csvFile &&
                  <Button
                    sx={{ ml: 1 }}
                    variant="outlined"
                    color="secondary"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={clearFile}
                    aria-label="Clear File"
                    disabled={loading}
                  >
                    Clear
                  </Button>
                }
                {csvFile && (
                  <Chip 
                    label={csvFile.name}
                    icon={<InsertDriveFileIcon />}
                    color="primary"
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                )}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Processing: {uploadProgress}%
                    </Typography>
                  </Box>
                )}
              </Box>
              <Box sx={{ flex: '0 0 auto', textAlign: 'right' }}>
                {analysisResults.length > 0 && (
                  <Tooltip title="Download analysis results as CSV">
                    <Button
                      variant="outlined"
                      color="success"
                      startIcon={<DownloadIcon />}
                      onClick={downloadResults}
                      aria-label="Download Results"
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Download Results
                    </Button>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </AnimatedPaper>

          {/* Preview Table */}
          {previewData.length > 0 && (
            <AnimatedPaper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Preview (First 10 Rows)
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
                <Button variant="contained" color="primary" onClick={analyzeCSV}>
                  Analyze CSV
                </Button>
              </Box>
            </AnimatedPaper>
          )}

          {/* Statistics Summary */}
          {analysisResults.length > 0 && (
            <Fade in>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <StyledPaper 
                  elevation={3}
                  sx={{ 
                    flex: '1 1 200px', 
                    p: 2, 
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formatNumber(stats.totalSamples)}
                  </Typography>
                  <Typography variant="body2">Total Samples</Typography>
                </StyledPaper>
                
                <StyledPaper 
                  elevation={3}
                  sx={{ 
                    flex: '1 1 200px', 
                    p: 2, 
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white'
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formatNumber(stats.threatCount)}
                  </Typography>
                  <Typography variant="body2">Threats Detected</Typography>
                </StyledPaper>
                
                <StyledPaper 
                  elevation={3}
                  sx={{ 
                    flex: '1 1 200px', 
                    p: 2, 
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white'
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.threatPercentage.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2">Threat Rate</Typography>
                </StyledPaper>
                
                <StyledPaper 
                  elevation={3}
                  sx={{ 
                    flex: '1 1 200px', 
                    p: 2, 
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    color: 'white'
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formatNumber(stats.normalCount)}
                  </Typography>
                  <Typography variant="body2">Safe Connections</Typography>
                </StyledPaper>
              </Box>
            </Fade>
          )}

          {/* Search Results */}
          {analysisResults.length > 0 && (
            <Slide direction="up" in>
              <AnimatedPaper sx={{ p: 2, borderRadius: 3, minHeight: 390 }}>
                <Typography variant="h6" gutterBottom>
                  Malicious Detection Results
                </Typography>
                <TextField
                  label="Search Category"
                  size="small"
                  sx={{ mb: 2 }}
                  variant="outlined"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  fullWidth
                />
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 500px', minWidth: 0 }}>
                    <DataGrid
                      rows={filteredResults}
                      columns={columns}
                      getRowClassName={(params) => params.row.status === 'Malicious' ? 'malicious-row' : 'safe-row'}
                      sx={{
                        height: 320,
                        '.malicious-row': { bgcolor: '#f8d7da', color: '#721c24' },
                        '.safe-row': { bgcolor: '#d4edda', color: '#155724' },
                      }}
                      initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                      pageSizeOptions={[5, 10, 25]}
                      autoHeight
                      disableColumnMenu
                    />
                  </Box>
                  <Box sx={{ flex: '0 0 300px' }}>
                    <PieChart
                      series={[{ data: pieData }]}
                      width={300}
                      height={200}
                    />
                  </Box>
                </Box>
              </AnimatedPaper>
            </Slide>
          )}

          {/* Enhanced Loading Indicator */}
          {loading && (
            <Fade in>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
                <CircularProgress size={48} thickness={4} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Analyzing network traffic...
                </Typography>
              </Box>
            </Fade>
          )}

          {/* Enhanced Snackbar Notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert 
              severity={snackbar.severity} 
              sx={{ width: '100%' }}
              icon={snackbar.severity === 'success' ? <SecurityIcon /> : undefined}
              variant="filled"
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </MainBox>
    </ThemeProvider>
  );
};

export default Dashboard;