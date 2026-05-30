import { useState } from 'react';
import { Row, Col, Card, Typography, Tag, Button, Carousel } from 'antd';
import { LeftOutlined, RightOutlined, BulbOutlined } from '@ant-design/icons';
import './ProcessDetail.css';

const { Title, Paragraph } = Typography;

const ProcessDetail = ({ steps }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const carouselRef = useState(null);

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepClick = index => {
    setCurrentStep(index);
  };

  if (!steps || steps.length === 0) {
    return null;
  }

  const currentStepData = steps[currentStep];

  return (
    <div className="process-detail">
      <div className="process-steps-nav">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`step-nav-item ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            onClick={() => handleStepClick(index)}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-label">{step.title}</div>
            {index < steps.length - 1 && <div className="step-line" />}
          </div>
        ))}
      </div>

      <Card className="process-content-card">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={10}>
            <div className="process-image-wrapper">
              <Button
                type="text"
                icon={<LeftOutlined />}
                className="carousel-btn prev"
                onClick={handlePrev}
                disabled={currentStep === 0}
              />
              <img
                src={currentStepData.image}
                alt={currentStepData.title}
                className="process-image"
              />
              <Button
                type="text"
                icon={<RightOutlined />}
                className="carousel-btn next"
                onClick={handleNext}
                disabled={currentStep === steps.length - 1}
              />
              <div className="step-indicator">
                {currentStep + 1} / {steps.length}
              </div>
            </div>
          </Col>
          <Col xs={24} md={14}>
            <div className="process-info">
              <div className="process-header">
                <Tag color="gold" className="step-badge">
                  步骤 {currentStep + 1}
                </Tag>
                <Title level={3} className="step-title">
                  {currentStepData.title}
                </Title>
              </div>
              <Paragraph className="step-description">
                {currentStepData.description}
              </Paragraph>
              {currentStepData.tips && (
                <div className="step-tips">
                  <BulbOutlined className="tips-icon" />
                  <div>
                    <span className="tips-label">技巧提示：</span>
                    <span className="tips-content">{currentStepData.tips}</span>
                  </div>
                </div>
              )}
              <div className="process-nav-buttons">
                <Button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                >
                  上一步
                </Button>
                <Button
                  type="primary"
                  onClick={handleNext}
                  disabled={currentStep === steps.length - 1}
                >
                  {currentStep === steps.length - 1 ? '完成' : '下一步'}
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ProcessDetail;
