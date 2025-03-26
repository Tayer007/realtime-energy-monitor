import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';

const StatCards = ({ stats }) => {
  // Extract values with fallbacks
  const totalHouseholds = stats.total_households || 0;
  const totalConsumption = stats.total_consumption || 0;
  const avgConsumption = stats.avg_consumption || 0;
  
  // Calculate commercial ratio
  const commercial = stats.type_breakdown?.commercial?.consumption || 0;
  const total = stats.total_consumption || 1; // Avoid division by zero
  const ratio = Math.round((commercial / total) * 100);

  return (
    <Row className="mb-4">
      <Col md={3}>
        <Card className="stats-card">
          <Card.Body>
            <div className="stats-value">{totalHouseholds}</div>
            <div className="stats-label">Households</div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="stats-card">
          <Card.Body>
            <div className="stats-value">{totalConsumption.toFixed(2)}</div>
            <div className="stats-label">Total kWh (24h)</div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="stats-card">
          <Card.Body>
            <div className="stats-value">{avgConsumption.toFixed(2)}</div>
            <div className="stats-label">Avg kWh per Household</div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="stats-card">
          <Card.Body>
            <div className="stats-value">{ratio}%</div>
            <div className="stats-label">Commercial Ratio</div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default StatCards;