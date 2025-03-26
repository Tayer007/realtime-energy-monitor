import React from 'react';
import { Row, Col, Card, Table } from 'react-bootstrap';

const RealtimeData = ({ data }) => {
  return (
    <Row>
      <Col md={12}>
        <Card>
          <Card.Header>
            <h5>Real-time Energy Consumption</h5>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>House ID</th>
                    <th>Type</th>
                    <th>Consumption (kWh)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 ? (
                    data.map((item, index) => (
                      <tr key={index}>
                        <td>{new Date(item.timestamp).toLocaleString()}</td>
                        <td>{item.house_id}</td>
                        <td>{item.type}</td>
                        <td>{item.consumption_kwh.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">No data available</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default RealtimeData;