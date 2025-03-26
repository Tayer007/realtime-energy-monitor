import React from 'react';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';

const Controls = ({ chartType, timeRange, onChartTypeChange, onTimeRangeChange, onRefresh }) => {
  return (
    <Row className="mb-4">
      <Col md={12}>
        <Card>
          <Card.Body>
            <Row className="align-items-center">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Chart Type:</Form.Label>
                  <Form.Select 
                    value={chartType}
                    onChange={(e) => onChartTypeChange(e.target.value)}
                  >
                    <option value="line">Line Chart</option>
                    <option value="bar">Bar Chart</option>
                    <option value="area">Area Chart</option>
                    <option value="realtime">Real-time Data</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Time Range:</Form.Label>
                  <Form.Select 
                    value={timeRange}
                    onChange={(e) => onTimeRangeChange(parseInt(e.target.value))}
                    disabled={chartType === 'realtime'}
                  >
                    <option value="1">Last Hour</option>
                    <option value="6">Last 6 Hours</option>
                    <option value="12">Last 12 Hours</option>
                    <option value="24">Last 24 Hours</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Custom Date:</Form.Label>
                  <div className="d-flex">
                    <Form.Control 
                      type="date" 
                      disabled={chartType === 'realtime'}
                      className="me-2"
                    />
                    <Button variant="primary" onClick={onRefresh}>
                      Refresh Data
                    </Button>
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Controls;
