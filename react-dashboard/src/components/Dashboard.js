import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Navbar, Button, Dropdown } from 'react-bootstrap';
import { BsMoon, BsSun, BsDownload } from 'react-icons/bs';
import StatCards from './StatCards';
import Controls from './Controls';
import EnergyChart from './EnergyChart';
import RealtimeData from './RealtimeData';
import { fetchHourlyData, fetchSummaryStats, fetchRealtimeData } from '../services/api';
import { ThemeContext } from '../contexts/ThemeContext';
import { exportCSV, exportPDF } from '../services/exportService';

const Dashboard = () => {
  const [hourlyData, setHourlyData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({});
  const [realtimeData, setRealtimeData] = useState([]);
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState(24);
  const [lastUpdated, setLastUpdated] = useState('Loading...');
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [timeRange, chartType]);

  const fetchData = async () => {
    try {
      if (chartType === 'realtime') {
        const data = await fetchRealtimeData();
        setRealtimeData(data);
      } else {
        const data = await fetchHourlyData();
        setHourlyData(data);
      }
      
      const stats = await fetchSummaryStats();
      setSummaryStats(stats);
      
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChartTypeChange = (type) => {
    setChartType(type);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const handleExport = async (format) => {
    if (format === 'csv') {
      exportCSV(hourlyData);
    } else if (format === 'pdf') {
      exportPDF(hourlyData, summaryStats);
    }
  };

  return (
    <Container fluid className="py-3">
      <Navbar bg={darkMode ? 'dark' : 'light'} variant={darkMode ? 'dark' : 'light'} className="mb-4 rounded">
        <Container fluid>
          <Navbar.Brand href="#home">Energy Data Pipeline</Navbar.Brand>
          <div className="d-flex align-items-center">
            <div className="theme-toggle me-3" onClick={toggleTheme}>
              {darkMode ? <BsSun /> : <BsMoon />}
            </div>
            <Dropdown className="me-3">
              <Dropdown.Toggle variant="outline-secondary">
                <BsDownload className="me-1" /> Export
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleExport('csv')}>Export as CSV</Dropdown.Item>
                <Dropdown.Item onClick={() => handleExport('pdf')}>Export as PDF</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <span className="navbar-text">
              Last updated: {lastUpdated}
            </span>
          </div>
        </Container>
      </Navbar>

      <Controls 
        chartType={chartType} 
        timeRange={timeRange} 
        onChartTypeChange={handleChartTypeChange} 
        onTimeRangeChange={handleTimeRangeChange}
        onRefresh={fetchData}
      />

      <StatCards stats={summaryStats} />

      {chartType === 'realtime' ? (
        <RealtimeData data={realtimeData} />
      ) : (
        <EnergyChart 
          data={hourlyData} 
          chartType={chartType} 
          timeRange={timeRange}
          darkMode={darkMode}
        />
      )}

      <footer>
        <small>Copyright &copy; 2025 Your Name. Licensed under GPL-3.0.</small>
      </footer>
    </Container>
  );
};

export default Dashboard;