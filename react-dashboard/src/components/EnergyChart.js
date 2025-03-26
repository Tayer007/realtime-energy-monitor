import React, { useEffect, useRef } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const EnergyChart = ({ data, chartType, timeRange, darkMode }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    if (chartRef.current && data.length > 0) {
      createChart();
    }
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, chartType, timeRange, darkMode]);

  const formatHour = (hourStr) => {
    const date = new Date(hourStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const createChart = () => {
    const ctx = chartRef.current.getContext('2d');
    
    // Filter data based on timeRange
    const currentTime = new Date();
    const filteredData = data.filter(item => {
      const itemTime = new Date(item.hour);
      return (currentTime - itemTime) <= timeRange * 60 * 60 * 1000;
    });

    const hours = filteredData.map(item => formatHour(item.hour));
    const totalValues = filteredData.map(item => item.total);
    const residentialValues = filteredData.map(item => item.residential);
    const commercialValues = filteredData.map(item => item.commercial);

    // Configure chart
    const chartConfig = {
      type: chartType === 'area' ? 'line' : chartType,
      data: {
        labels: hours,
        datasets: [
          {
            label: 'Total',
            data: totalValues,
            borderColor: '#0d6efd',
            backgroundColor: 'rgba(13, 110, 253, 0.1)',
            tension: 0.4
          },
          {
            label: 'Residential',
            data: residentialValues,
            borderColor: '#20c997',
            backgroundColor: 'rgba(32, 201, 151, 0.1)',
            tension: 0.4
          },
          {
            label: 'Commercial',
            data: commercialValues,
            borderColor: '#fd7e14',
            backgroundColor: 'rgba(253, 126, 20, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Energy Consumption (kWh)'
            },
            grid: {
              color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              color: darkMode ? '#eee' : '#666'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Hour'
            },
            grid: {
              color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              color: darkMode ? '#eee' : '#666'
            }
          }
        },
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false
          },
          legend: {
            position: 'top',
            labels: {
              color: darkMode ? '#eee' : '#666'
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false
      }
    };

    // Adjust dataset appearance based on chart type
    if (chartType === 'bar') {
      chartConfig.data.datasets.forEach(dataset => {
        dataset.backgroundColor = dataset.borderColor;
        dataset.borderWidth = 1;
      });
    } else if (chartType === 'area') {
      chartConfig.data.datasets.forEach(dataset => {
        dataset.fill = true;
        dataset.backgroundColor = dataset.backgroundColor.replace('0.1', '0.5');
      });
    }

    chartInstance.current = new Chart(ctx, chartConfig);
  };

  return (
    <Row>
      <Col md={12}>
        <Card>
          <Card.Header>
            <h5>Hourly Energy Consumption</h5>
          </Card.Header>
          <Card.Body>
            <div style={{ height: '400px', position: 'relative' }}>
              <canvas ref={chartRef}></canvas>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default EnergyChart;