// Reports.tsx - Comprehensive Analysis & Reporting Dashboard
import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Divider,
  Alert,
  LinearProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';
import PieChartIcon from '@mui/icons-material/PieChart';
import SecurityIcon from '@mui/icons-material/Security';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0,0,0,0.5)'
    : '0 4px 20px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 30px rgba(0,0,0,0.6)'
      : '0 8px 30px rgba(0,0,0,0.15)',
  },
}));

const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)'
    : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  color: 'white',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

// Mock data - In production, this would come from your backend/database
const mockAnalysisHistory = [
  { date: '2025-10-07', total: 1234, threats: 156, normal: 1078, dos: 89, probe: 45, r2l: 15, u2r: 7 },
  { date: '2025-10-08', total: 1456, threats: 189, normal: 1267, dos: 102, probe: 54, r2l: 21, u2r: 12 },
  { date: '2025-10-09', total: 1789, threats: 234, normal: 1555, dos: 134, probe: 67, r2l: 23, u2r: 10 },
  { date: '2025-10-10', total: 1567, threats: 198, normal: 1369, dos: 112, probe: 56, r2l: 19, u2r: 11 },
  { date: '2025-10-11', total: 1890, threats: 267, normal: 1623, dos: 145, probe: 78, r2l: 29, u2r: 15 },
];

const mockThreatDistribution = [
  { name: 'DOS', value: 582, color: '#ef4444' },
  { name: 'Probe', value: 300, color: '#f59e0b' },
  { name: 'R2L', value: 107, color: '#f97316' },
  { name: 'U2R', value: 55, color: '#dc2626' },
  { name: 'Normal', value: 6892, color: '#10b981' },
];

const mockProtocolStats = [
  { protocol: 'TCP', count: 5234, threats: 432, safe: 4802 },
  { protocol: 'UDP', count: 2156, threats: 234, safe: 1922 },
  { protocol: 'ICMP', count: 546, threats: 45, safe: 501 },
];

const mockServiceStats = [
  { service: 'HTTP', requests: 3456, threats: 289, percentage: 8.4 },
  { service: 'HTTPS', requests: 4567, threats: 123, percentage: 2.7 },
  { service: 'DNS', requests: 1234, threats: 67, percentage: 5.4 },
  { service: 'FTP', requests: 567, threats: 89, percentage: 15.7 },
  { service: 'SSH', requests: 890, threats: 12, percentage: 1.3 },
  { service: 'SMTP', requests: 234, threats: 45, percentage: 19.2 },
];

const mockThreatSeverity = [
  { severity: 'Critical', count: 45, color: '#dc2626' },
  { severity: 'High', count: 156, color: '#ef4444' },
  { severity: 'Medium', count: 289, color: '#f59e0b' },
  { severity: 'Low', count: 554, color: '#fbbf24' },
];

const mockPerformanceMetrics = [
  { metric: 'Detection Accuracy', value: 94.5, target: 95 },
  { metric: 'False Positive Rate', value: 2.3, target: 3 },
  { metric: 'Processing Speed', value: 88.7, target: 85 },
  { metric: 'System Uptime', value: 99.2, target: 99 },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} role="tabpanel">
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const Reports: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  const handleExportReport = () => {
    // Export logic here
    alert('Exporting detailed report...');
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const latestData = mockAnalysisHistory[mockAnalysisHistory.length - 1];
    const previousData = mockAnalysisHistory[mockAnalysisHistory.length - 2];
    
    return {
      totalAnalyzed: mockAnalysisHistory.reduce((sum, d) => sum + d.total, 0),
      totalThreats: mockAnalysisHistory.reduce((sum, d) => sum + d.threats, 0),
      averageThreatRate: (mockAnalysisHistory.reduce((sum, d) => sum + (d.threats / d.total * 100), 0) / mockAnalysisHistory.length).toFixed(1),
      threatTrend: latestData.threats > previousData.threats ? 'up' : 'down',
      threatChange: Math.abs(((latestData.threats - previousData.threats) / previousData.threats * 100)).toFixed(1),
    };
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon fontSize="large" color="primary" />
            Comprehensive Security Reports
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Detailed analysis and insights from network security monitoring
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportReport}
            sx={{ textTransform: 'none' }}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Summary Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard>
            <CardContent>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                Total Analyzed
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {summaryStats.totalAnalyzed.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Network connections
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
            <CardContent>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                Threats Detected
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {summaryStats.totalThreats.toLocaleString()}
                </Typography>
                {summaryStats.threatTrend === 'up' ? (
                  <TrendingUpIcon color="inherit" />
                ) : (
                  <TrendingDownIcon color="inherit" />
                )}
              </Box>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {summaryStats.threatTrend === 'up' ? '+' : '-'}{summaryStats.threatChange}% from yesterday
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' }}>
            <CardContent>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                Average Threat Rate
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {summaryStats.averageThreatRate}%
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Last 5 days average
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <CardContent>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                Detection Accuracy
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                94.5%
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                ML model performance
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
      </Grid>

      {/* Tabs for Different Report Sections */}
      <StyledPaper>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<TimelineIcon />} label="Trends & History" iconPosition="start" />
          <Tab icon={<PieChartIcon />} label="Threat Analysis" iconPosition="start" />
          <Tab icon={<SecurityIcon />} label="Protocol & Services" iconPosition="start" />
          <Tab icon={<AssessmentIcon />} label="Performance Metrics" iconPosition="start" />
        </Tabs>

        {/* Tab 1: Trends & History */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimelineIcon color="primary" />
                Network Activity Trends (Last 5 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockAnalysisHistory}>
                  <defs>
                    <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="threats" stroke="#ef4444" fillOpacity={1} fill="url(#colorThreats)" name="Threats" />
                  <Area type="monotone" dataKey="normal" stroke="#10b981" fillOpacity={1} fill="url(#colorNormal)" name="Normal" />
                </AreaChart>
              </ResponsiveContainer>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Attack Type Distribution Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockAnalysisHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="dos" stroke="#ef4444" name="DOS" strokeWidth={2} />
                  <Line type="monotone" dataKey="probe" stroke="#f59e0b" name="Probe" strokeWidth={2} />
                  <Line type="monotone" dataKey="r2l" stroke="#f97316" name="R2L" strokeWidth={2} />
                  <Line type="monotone" dataKey="u2r" stroke="#dc2626" name="U2R" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Daily Analysis Summary
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell align="right"><strong>Total</strong></TableCell>
                      <TableCell align="right"><strong>Threats</strong></TableCell>
                      <TableCell align="right"><strong>Rate</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockAnalysisHistory.map((row) => {
                      const rate = ((row.threats / row.total) * 100).toFixed(1);
                      return (
                        <TableRow key={row.date}>
                          <TableCell>{row.date}</TableCell>
                          <TableCell align="right">{row.total.toLocaleString()}</TableCell>
                          <TableCell align="right">{row.threats.toLocaleString()}</TableCell>
                          <TableCell align="right">{rate}%</TableCell>
                          <TableCell>
                            <Chip 
                              label={parseFloat(rate) > 15 ? 'High Risk' : parseFloat(rate) > 10 ? 'Medium' : 'Normal'}
                              size="small"
                              color={parseFloat(rate) > 15 ? 'error' : parseFloat(rate) > 10 ? 'warning' : 'success'}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Threat Analysis */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PieChartIcon color="primary" />
                Threat Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={mockThreatDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(1)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mockThreatDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom>
                Threat Severity Levels
              </Typography>
              <Box sx={{ mt: 2 }}>
                {mockThreatSeverity.map((item) => (
                  <Box key={item.severity} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.severity}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.count} incidents
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(item.count / 1044) * 100}
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: item.color,
                        }
                      }}
                    />
                  </Box>
                ))}
              </Box>

              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Recommendation:</strong> Focus on addressing {mockThreatSeverity[0].count} critical threats immediately.
                </Typography>
              </Alert>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Detailed Threat Breakdown
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Threat Type</strong></TableCell>
                      <TableCell align="right"><strong>Count</strong></TableCell>
                      <TableCell align="right"><strong>Percentage</strong></TableCell>
                      <TableCell><strong>Severity</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockThreatDistribution.filter(t => t.name !== 'Normal').map((threat) => {
                      const totalThreats = mockThreatDistribution.filter(t => t.name !== 'Normal').reduce((sum, t) => sum + t.value, 0);
                      const percentage = ((threat.value / totalThreats) * 100).toFixed(1);
                      return (
                        <TableRow key={threat.name}>
                          <TableCell>
                            <Chip 
                              label={threat.name} 
                              size="small" 
                              sx={{ backgroundColor: threat.color, color: 'white' }}
                            />
                          </TableCell>
                          <TableCell align="right">{threat.value.toLocaleString()}</TableCell>
                          <TableCell align="right">{percentage}%</TableCell>
                          <TableCell>
                            <Chip 
                              label={threat.name === 'DOS' || threat.name === 'U2R' ? 'Critical' : 'High'}
                              size="small"
                              color={threat.name === 'DOS' || threat.name === 'U2R' ? 'error' : 'warning'}
                              icon={<WarningIcon />}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip label="Active" size="small" color="error" />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 3: Protocol & Services */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon color="primary" />
                Protocol Statistics
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockProtocolStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="protocol" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="safe" fill="#10b981" name="Safe" stackId="a" />
                  <Bar dataKey="threats" fill="#ef4444" name="Threats" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom>
                Protocol Summary
              </Typography>
              <TableContainer sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Protocol</strong></TableCell>
                      <TableCell align="right"><strong>Total</strong></TableCell>
                      <TableCell align="right"><strong>Threats</strong></TableCell>
                      <TableCell align="right"><strong>Threat %</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockProtocolStats.map((row) => {
                      const threatPercent = ((row.threats / row.count) * 100).toFixed(1);
                      return (
                        <TableRow key={row.protocol}>
                          <TableCell>
                            <Chip label={row.protocol} size="small" color="primary" variant="outlined" />
                          </TableCell>
                          <TableCell align="right">{row.count.toLocaleString()}</TableCell>
                          <TableCell align="right">{row.threats.toLocaleString()}</TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={`${threatPercent}%`}
                              size="small"
                              color={parseFloat(threatPercent) > 10 ? 'error' : parseFloat(threatPercent) > 5 ? 'warning' : 'success'}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Service-Level Analysis
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Service</strong></TableCell>
                      <TableCell align="right"><strong>Requests</strong></TableCell>
                      <TableCell align="right"><strong>Threats</strong></TableCell>
                      <TableCell align="right"><strong>Threat Rate</strong></TableCell>
                      <TableCell><strong>Risk Level</strong></TableCell>
                      <TableCell><strong>Recommendation</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockServiceStats.map((service) => {
                      const riskLevel = service.percentage > 15 ? 'High' : service.percentage > 10 ? 'Medium' : 'Low';
                      const recommendation = service.percentage > 15 ? 'Immediate action required' : service.percentage > 10 ? 'Monitor closely' : 'Normal operation';
                      return (
                        <TableRow key={service.service}>
                          <TableCell>
                            <Chip label={service.service} size="small" color="info" variant="outlined" />
                          </TableCell>
                          <TableCell align="right">{service.requests.toLocaleString()}</TableCell>
                          <TableCell align="right">{service.threats}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600, color: service.percentage > 15 ? '#ef4444' : service.percentage > 10 ? '#f59e0b' : '#10b981' }}>
                              {service.percentage.toFixed(1)}%
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={riskLevel}
                              size="small"
                              color={riskLevel === 'High' ? 'error' : riskLevel === 'Medium' ? 'warning' : 'success'}
                              icon={riskLevel === 'High' ? <WarningIcon /> : <CheckCircleIcon />}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {recommendation}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 4: Performance Metrics */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssessmentIcon color="primary" />
                System Performance Metrics
              </Typography>
              <Box sx={{ mt: 2 }}>
                {mockPerformanceMetrics.map((metric) => {
                  const isOnTarget = metric.metric === 'False Positive Rate' 
                    ? metric.value <= metric.target 
                    : metric.value >= metric.target;
                  return (
                    <Box key={metric.metric} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {metric.metric}
                        </Typography>
                        <Typography variant="body1" color={isOnTarget ? 'success.main' : 'warning.main'}>
                          {metric.value}% {isOnTarget ? <CheckCircleIcon fontSize="small" /> : <InfoIcon fontSize="small" />}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={metric.value}
                        sx={{ 
                          height: 12, 
                          borderRadius: 6,
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: isOnTarget ? '#10b981' : '#f59e0b',
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Target: {metric.target}% | Current: {metric.value}%
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom>
                Model Performance Radar
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={mockPerformanceMetrics}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Current" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Radar name="Target" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>System Status: Optimal</strong> - All performance metrics are within acceptable ranges. Continue monitoring for any degradation.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </TabPanel>
      </StyledPaper>

      {/* Additional Insights Section */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon color="primary" />
              Key Findings
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity="error">
                <Typography variant="body2">
                  <strong>Critical:</strong> DOS attacks increased by 23% compared to last week
                </Typography>
              </Alert>
              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Warning:</strong> FTP service showing 19.2% threat rate - consider additional security measures
                </Typography>
              </Alert>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Info:</strong> Detection accuracy improved to 94.5%, exceeding target by 2.3%
                </Typography>
              </Alert>
              <Alert severity="success">
                <Typography variant="body2">
                  <strong>Success:</strong> System uptime maintained at 99.2% this week
                </Typography>
              </Alert>
            </Box>
          </StyledPaper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon color="primary" />
              Recommendations
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box component="ol" sx={{ pl: 2 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  Implement rate limiting on FTP and SMTP services to reduce attack surface
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  Update firewall rules to block known DOS attack patterns
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  Enable additional logging for HTTP/HTTPS traffic analysis
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  Schedule regular security audits for high-risk services
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2">
                  Consider implementing machine learning model retraining with latest threat patterns
                </Typography>
              </Box>
            </Box>
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;

