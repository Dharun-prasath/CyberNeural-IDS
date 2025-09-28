import React, { useState } from 'react';
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
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import Papa from 'papaparse';

const drawerWidth = 240;

const Dashboard: React.FC = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'error' | 'success' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Handle CSV selection and preview
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'text/csv') {
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
    });
  };

  const clearFile = () => {
    setCsvFile(null);
    setPreviewData([]);
    setAnalysisResults([]);
  };

  // Send CSV to Flask backend
  const analyzeCSV = async () => {
    if (!csvFile) {
      setSnackbar({ open: true, message: 'Please select a CSV file first.', severity: 'error' });
      return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', csvFile);

      const response = await fetch('http://localhost:5000/predict_csv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error analyzing CSV');
      }

      // Convert summary into table-friendly format
      const resultsArray: any[] = [];
      let idCounter = 1;
      for (const [key, value] of Object.entries(data.summary)) {
        if (key === 'total_samples') continue;
        resultsArray.push({ id: idCounter++, deviceId: key, status: key === 'normal' ? 'Safe' : 'Malicious', count: value });
      }

      setAnalysisResults(resultsArray);
      setSnackbar({ open: true, message: 'Analysis complete!', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Server error', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'deviceId', headerName: 'Category', flex: 1 },
    { field: 'count', headerName: 'Count', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      cellClassName: (params) => (params.value === 'Malicious' ? 'malicious' : 'safe'),
    },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', backgroundColor: '#1976d2', color: '#fff' },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap>
            LAN Analyzer
          </Typography>
        </Toolbar>
        <List>
          {['Dashboard', 'Reports', 'Settings'].map((text) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AppBar position="fixed" sx={{ zIndex: 1201, ml: `${drawerWidth}px` }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              LAN Security Analyzer Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar />

        {/* CSV Upload */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 3 }}>
          <Typography variant="h6" gutterBottom>
            Upload CSV
          </Typography>
          <Typography variant="body2" gutterBottom>
            Upload a CSV file containing Device IDs
          </Typography>
          <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} id="csv-upload" />
          <label htmlFor="csv-upload">
            <Button variant="contained" component="span">
              Choose File
            </Button>
          </label>
          {csvFile && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected File: {csvFile.name}
            </Typography>
          )}
          {csvFile && (
            <Button sx={{ mt: 2, ml: 2 }} variant="outlined" color="secondary" onClick={clearFile}>
              Clear File
            </Button>
          )}
        </Paper>

        {/* Preview Table */}
        {previewData.length > 0 && (
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 3 }}>
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
                      <TableCell>{row['Device ID'] || row['ID'] || `Device-${idx + 1}`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button sx={{ mt: 2 }} variant="contained" onClick={analyzeCSV}>
              Analyze CSV
            </Button>
          </Paper>
        )}

        {/* Analysis Results */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          analysisResults.length > 0 && (
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Malicious Detection Results
              </Typography>
              <DataGrid
                rows={analysisResults}
                columns={columns}
                getRowClassName={(params) => (params.row.status === 'Malicious' ? 'malicious-row' : 'safe-row')}
                sx={{
                  '.malicious-row': { bgcolor: '#f8d7da', color: '#721c24' },
                  '.safe-row': { bgcolor: '#d4edda', color: '#155724' },
                }}
                pageSizeOptions={[5, 10]}
                initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
              />
            </Paper>
          )
        )}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Dashboard;
