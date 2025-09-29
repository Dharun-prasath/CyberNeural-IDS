// Dashboard.tsx
import React, { useState, useRef, useCallback, Suspense } from 'react';
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
  useTheme,
  Slide,
  Fade,
  TextField,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import Papa from 'papaparse';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { styled } from '@mui/material/styles';

// Custom styled-components
const drawerWidth = 260;
const MainBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(120deg, #212121 70%, #1976d2 100%)'
    : 'linear-gradient(120deg, #e3f2fd 60%, #fffde7 100%)',
}));

import type { ReactNode } from 'react';

interface AnimatedPaperProps extends React.ComponentProps<typeof Paper> {
  children: ReactNode;
}

const AnimatedPaper: React.FC<AnimatedPaperProps> = ({ children, ...props }) => (
  <Fade in timeout={350}>
    <Paper elevation={4} {...props}>{children}</Paper>
  </Fade>
);

// Helper functions
const toCsvString = (rows: Array<{ deviceId: string; category?: string; count: number; status: string }>) =>
  [
    ['Device ID', 'Category', 'Count', 'Status'],
    ...rows.map(row => [row.deviceId, row.category || '-', row.count, row.status]),
  ]
    .map(r => r.join(',')).join('\n');

// Main Component
const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'error' | 'success' }>({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(theme.palette.mode === 'dark');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CSV upload handler
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
      // Transform summary => table rows
      const rows = Object.entries(data.summary)
        .filter(([key]) => key !== 'total_samples')
        .map(([key, value], idx) => ({
          id: idx + 1,
          deviceId: key,
          category: key === 'normal' ? 'Safe' : 'Malicious',
          count: value,
          status: key === 'normal' ? 'Safe' : 'Malicious'
        }));
      setAnalysisResults(rows);
      setSnackbar({open: true, message: 'Analysis complete!', severity: 'success'});
    } catch (err) {
      const errorMessage = typeof err === 'object' && err !== null && 'message' in err
        ? (err as { message?: string }).message || 'Server error'
        : 'Server error';
      setSnackbar({open: true, message: errorMessage, severity: 'error'});
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

  // Columns for DataGrid
  const columns: GridColDef[] = [
    { field: 'deviceId', headerName: 'Device ID', flex: 1 },
    { field: 'count', headerName: 'Count', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      cellClassName: (params) => params.value === 'Malicious' ? 'malicious' : 'safe',
    }
  ];

  // Search and filter logic
  const filteredResults = analysisResults.filter(row =>
    row.deviceId.toLowerCase().includes(search.toLowerCase())
    || row.status.toLowerCase().includes(search.toLowerCase())
  );

  // Handle theme toggling
  const handleThemeToggle = () => setDarkMode((dm) => !dm);

  return (
    <MainBox>
      <CssBaseline />
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth, boxSizing: 'border-box',
            backgroundColor: darkMode ? '#111' : '#1976d2',
            color: '#fff'
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap>L.A.N. Analyzer</Typography>
        </Toolbar>
        <List>
          {['Dashboard', 'Reports', 'Settings'].map(text => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
          <ListItem>
            <Switch
              checked={darkMode}
              onChange={handleThemeToggle}
              color="default"
              inputProps={{ 'aria-label': 'Switch theme' }}
            />
            <Typography variant="body2" sx={{ ml: 1 }}>{darkMode ? 'Dark Mode' : 'Light Mode'}</Typography>
          </ListItem>
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: { xs: 1, sm: 3 }, width: `calc(100% - ${drawerWidth}px)` }}
      >
        <AppBar position="fixed" sx={{ zIndex: 1201, ml: `${drawerWidth}px` }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              LAN Security Analyzer Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar />

        {/* CSV Upload */}
        <AnimatedPaper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Upload CSV</Typography>
              <Typography variant="body2" gutterBottom>
                Upload a CSV file containing Device IDs for analysis.
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
                >
                  Clear
                </Button>
              }
              {csvFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected File: {csvFile.name}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
              {analysisResults.length > 0 && (
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<DownloadIcon />}
                  onClick={downloadResults}
                  aria-label="Download Results"
                >
                  Download Results
                </Button>
              )}
            </Grid>
          </Grid>
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

        {/* Search Results */}
        {analysisResults.length > 0 && (
          <Slide direction="up" in>
            <AnimatedPaper sx={{ p: 2, borderRadius: 3, minHeight: 390 }}>
              <Typography variant="h6" gutterBottom>
                Malicious Detection Results
              </Typography>
              <TextField
                label="Search Device"
                size="small"
                sx={{ mb: 2 }}
                variant="outlined"
                value={search}
                onChange={e => setSearch(e.target.value)}
                fullWidth
              />
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
            </AnimatedPaper>
          </Slide>
        )}

        {/* Loading indicator */}
        {loading && (
          <Fade in>
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress size={44} />
            </Box>
          </Fade>
        )}

        {/* Snackbar notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3500}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainBox>
  );
};

export default Dashboard;
