import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Tabs, Row, Col, Card, Typography, Steps, Collapse, List, Button, Avatar, 
  Form, Input, Modal, Tag, message, Divider, Image
} from 'antd';
import { 
  ScissorOutlined, BulbOutlined, QuestionCircleOutlined, 
  SendOutlined, CheckCircleOutlined, ToolOutlined, PlayCircleOutlined,
  HeartOutlined, EyeOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { mockTools, mockTechniques, mockTutorials } from '../../mock';
import { addQuestion, addAnswer } from '../../store/slices/communitySlice';
import Empty from '../../components/Status/Empty';
import './Skill.css';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

const Skill = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector(state => state.auth);
  const { questions } = useSelector(state => state.community);
  const [activeTab, setActiveTab] = useState('tools');
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedTechnique, setSelectedTechnique] = useState(null);
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [questionModal, setQuestionModal] = useState(false);
  const [answerModal, setAnswerModal] = useState(null);
  const [questionForm] = Form.useForm();
  const [answerForm] = Form.useForm();

  const tabItems = [
    { key: 'tools', label: '工具介绍', icon: <ToolOutlined /> },
    { key: 'techniques', label: '基础技法', icon: <ScissorOutlined /> },
    { key: 'tutorials', label: '创作思路', icon: <BulbOutlined /> },
    { key: 'qa', label: '技艺答疑', icon: <QuestionCircleOutlined /> },
  ];

  const handleSubmitQuestion = async (values) => {
    if (!currentUser) {
      message.warning('请先登录');
      return;
    }
    await dispatch(addQuestion({
      ...values,
      author: currentUser.nickname,
      avatar: currentUser.avatar,
      authorId: currentUser.id,
    }));
    message.success('提问成功');
    questionForm.resetFields();
    setQuestionModal(false);
  };

  const handleSubmitAnswer = async (values) => {
    if (!currentUser) {
      message.warning('请先登录');
      return;
    }
    await dispatch(addAnswer({
      questionId: answerModal,
      answerData: {
        ...values,
        author: currentUser.nickname,
        avatar: currentUser.avatar,
      },
    }));
    message.success('回答成功');
    answerForm.resetFields();
    setAnswerModal(null);
  };

  const renderTools = () => (
    <div>
      <div className="section-intro">
        <Title level={3}>剪纸工具介绍</Title>
        <Paragraph type="secondary">
          工欲善其事，必先利其器。了解和掌握专业的剪纸工具，是学习剪纸技艺的第一步。
        </Paragraph>
      </div>
      <Row gutter={[24, 24]}>
        {mockTools.map(tool => (
          <Col xs={24} sm={12} md={8} lg={6} key={tool.id}>
            <Card 
              className="tool-card" 
              hoverable
              onClick={() => setSelectedTool(tool)}
              cover={
                <div className="tool-card-cover">
                  <img src={tool.image} alt={tool.name} />
                </div>
              }
            >
              <Card.Meta
                title={<Text strong style={{ fontSize: '16px' }}>{tool.name}</Text>}
                description={
                  <Text type="secondary" ellipsis={{ rows: 2 }}>
                    {tool.usage}
                  </Text>
                }
              />
              <Button type="link" className="tool-detail-btn">
                查看使用方法 →
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={selectedTool?.name}
        open={!!selectedTool}
        onCancel={() => setSelectedTool(null)}
        footer={null}
        width={900}
        destroyOnClose
      >
        {selectedTool && (
          <div className="tool-detail">
            <Row gutter={24}>
              <Col md={10}>
                <Image 
                  src={selectedTool.image} 
                  alt={selectedTool.name}
                  className="tool-detail-image"
                />
              </Col>
              <Col md={14}>
                <Title level={4} style={{ marginTop: 0 }}>{selectedTool.name}</Title>
                <Paragraph>{selectedTool.description}</Paragraph>
                
                <div className="tool-info">
                  <Tag color="blue">{selectedTool.usage}</Tag>
                </div>

                <Divider orientation="left">使用方法</Divider>
                <List
                  size="small"
                  dataSource={selectedTool.usageMethod}
                  renderItem={(item, index) => (
                    <List.Item className="usage-item">
                      <span className="usage-number">{index + 1}</span>
                      <span>{item}</span>
                    </List.Item>
                  )}
                />

                <Divider orientation="left">小贴士</Divider>
                <Paragraph type="secondary" className="tip-paragraph">
                  💡 {selectedTool.tips}
                </Paragraph>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );

  const renderTechniques = () => (
    <div>
      <div className="section-intro">
        <Title level={3}>基础技法演示</Title>
        <Paragraph type="secondary">
          掌握剪刻、镂空、折叠三大基础技法，是剪纸创作的核心。点击卡片查看详细的图文步骤演示。
        </Paragraph>
      </div>
      <Row gutter={[24, 24]}>
        {mockTechniques.map(technique => (
          <Col xs={24} md={8} key={technique.id}>
            <Card
              className="technique-card"
              hoverable
              onClick={() => setSelectedTechnique(technique)}
              cover={
                <div className="technique-cover">
                  <img src={technique.coverImage} alt={technique.name} />
                  <div className="technique-cover-overlay">
                    <PlayCircleOutlined style={{ fontSize: '48px', color: '#fff' }} />
                  </div>
                </div>
              }
            >
              <div className="technique-card-meta">
                <div className="technique-tags">
                  <Tag color="green">{technique.difficulty}</Tag>
                  <Tag color="orange">
                    <ClockCircleOutlined /> {technique.duration}
                  </Tag>
                </div>
                <Title level={4}>{technique.name}</Title>
                <Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                  {technique.description}
                </Paragraph>
                <Button type="primary" block>
                  查看分步演示
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={
          <div className="modal-title">
            <Text strong>{selectedTechnique?.name}</Text>
            <Tag color="green" style={{ marginLeft: 8 }}>{selectedTechnique?.difficulty}</Tag>
          </div>
        }
        open={!!selectedTechnique}
        onCancel={() => setSelectedTechnique(null)}
        footer={null}
        width={1000}
        destroyOnClose
      >
        {selectedTechnique && (
          <div className="technique-detail">
            <div className="technique-cover-large">
              <img src={selectedTechnique.coverImage} alt={selectedTechnique.name} />
            </div>
            
            <Paragraph style={{ marginTop: 16 }}>{selectedTechnique.description}</Paragraph>
            
            <div className="technique-tips-box">
              <Tag color="red">💡 技巧提示</Tag>
              <Paragraph>{selectedTechnique.tips}</Paragraph>
            </div>

            <Divider orientation="left">
              <span className="divider-title">
                <PlayCircleOutlined /> 分步演示
              </span>
            </Divider>

            <div className="technique-steps">
              {selectedTechnique.steps.map((step, index) => (
                <div key={step.step} className="step-item">
                  <Row gutter={24} align="top">
                    <Col md={10}>
                      <div className="step-image-wrapper">
                        <div className="step-number">{step.step}</div>
                        <Image 
                          src={step.image} 
                          alt={step.title}
                          className="step-image"
                        />
                      </div>
                    </Col>
                    <Col md={14}>
                      <div className="step-content">
                        <Title level={4} style={{ marginTop: 0 }}>
                          第{step.step}步：{step.title}
                        </Title>
                        <Paragraph>{step.description}</Paragraph>
                        <div className="step-tip">
                          <Text type="secondary">
                            <span style={{ color: '#fa8c16' }}>小贴士：</span>
                            {step.tip}
                          </Text>
                        </div>
                      </div>
                    </Col>
                  </Row>
                  {index < selectedTechnique.steps.length - 1 && (
                    <Divider className="step-divider" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );

  const renderTutorials = () => (
    <div>
      <div className="section-intro">
        <Title level={3}>创作思路解析</Title>
        <Paragraph type="secondary">
          学习大师的创作思路，理解每一件剪纸作品背后的设计理念和艺术表达。
        </Paragraph>
      </div>
      <Row gutter={[24, 24]}>
        {mockTutorials.map(tutorial => (
          <Col xs={24} md={8} key={tutorial.id}>
            <Card
              className="tutorial-card"
              hoverable
              onClick={() => setSelectedTutorial(tutorial)}
              cover={
                <div className="tutorial-cover-wrapper">
                  <img alt={tutorial.title} src={tutorial.cover} className="tutorial-cover" />
                  <div className="tutorial-cover-info">
                    <Avatar src={tutorial.avatar} size="small" />
                    <Text style={{ color: '#fff', marginLeft: 8 }}>{tutorial.author}</Text>
                  </div>
                </div>
              }
            >
              <div className="tutorial-meta">
                <Tag color="blue">{tutorial.difficulty}</Tag>
                <Tag color="green">
                  <ClockCircleOutlined /> {tutorial.duration}
                </Tag>
                <Tag color="purple">
                  <EyeOutlined /> {tutorial.views}
                </Tag>
              </div>
              <Title level={4} className="tutorial-title">{tutorial.title}</Title>
              <Paragraph type="secondary" ellipsis={{ rows: 3 }}>
                {tutorial.content}
              </Paragraph>
              <Button type="link" className="tutorial-detail-btn">
                查看创作解析 →
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={selectedTutorial?.title}
        open={!!selectedTutorial}
        onCancel={() => setSelectedTutorial(null)}
        footer={null}
        width={1000}
        destroyOnClose
      >
        {selectedTutorial && (
          <div className="tutorial-detail">
            <div className="tutorial-detail-header">
              <Image 
                src={selectedTutorial.cover} 
                alt={selectedTutorial.title}
                className="tutorial-detail-cover"
              />
              <div className="tutorial-detail-info">
                <div className="tutorial-author">
                  <Avatar src={selectedTutorial.avatar} size={64} />
                  <div style={{ marginLeft: 16 }}>
                    <Text strong style={{ fontSize: '18px' }}>{selectedTutorial.author}</Text>
                    <Paragraph type="secondary" style={{ margin: 0 }}>剪纸艺术大师</Paragraph>
                  </div>
                </div>
                <div className="tutorial-stats">
                  <Tag color="blue">{selectedTutorial.difficulty}</Tag>
                  <Tag color="green">
                    <ClockCircleOutlined /> {selectedTutorial.duration}
                  </Tag>
                  <Tag color="purple">
                    <EyeOutlined /> {selectedTutorial.views} 浏览
                  </Tag>
                </div>
              </div>
            </div>

            <Divider />

            <div className="tutorial-content">
              <Paragraph style={{ fontSize: '15px', lineHeight: 1.8 }}>
                {selectedTutorial.content}
              </Paragraph>

              <Divider orientation="left">
                <span className="section-subtitle">
                  <BulbOutlined style={{ color: '#faad14' }} /> 创作思路
                </span>
              </Divider>
              <List
                dataSource={selectedTutorial.designConcept}
                renderItem={(item) => (
                  <List.Item className="concept-item">
                    <span className="concept-icon">🎨</span>
                    <span>{item}</span>
                  </List.Item>
                )}
              />

              <Divider orientation="left">
                <span className="section-subtitle">
                  <ScissorOutlined style={{ color: '#52c41a' }} /> 技艺亮点
                </span>
              </Divider>
              <List
                dataSource={selectedTutorial.technicalHighlights}
                renderItem={(item) => (
                  <List.Item className="highlight-item">
                    <span className="highlight-icon">✨</span>
                    <span>{item}</span>
                  </List.Item>
                )}
              />

              <Divider orientation="left">
                <span className="section-subtitle">
                  <ToolOutlined style={{ color: '#1890ff' }} /> 所需工具
                </span>
              </Divider>
              <div className="tools-list">
                {selectedTutorial.tools.map((tool, index) => (
                  <Tag key={index} color="blue" style={{ marginBottom: 8 }}>{tool}</Tag>
                ))}
              </div>

              <Divider orientation="left">
                <span className="section-subtitle">
                  <HeartOutlined style={{ color: '#eb2f96' }} /> 所需材料
                </span>
              </Divider>
              <div className="materials-list">
                {selectedTutorial.materials.map((material, index) => (
                  <Tag key={index} color="pink" style={{ marginBottom: 8 }}>{material}</Tag>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );

  const renderQA = () => (
    <div>
      <div className="section-intro">
        <div className="qa-header">
          <div>
            <Title level={3}>技艺难点答疑</Title>
            <Paragraph type="secondary">
              在学习剪纸过程中遇到问题？在这里提问，让大师和爱好者们为你解答。
            </Paragraph>
          </div>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => setQuestionModal(true)}
            size="large"
          >
            我要提问
          </Button>
        </div>
      </div>

      {questions.length === 0 ? (
        <Empty description="暂无问题，快来提问吧" />
      ) : (
        <List
          className="qa-list"
          itemLayout="vertical"
          dataSource={questions}
          renderItem={item => (
            <List.Item key={item.id} className="qa-item">
              <div className="qa-item-header">
                <Avatar src={item.avatar} size={48} />
                <div className="qa-item-info">
                  <Text strong style={{ fontSize: '15px' }}>{item.author}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>{item.createdAt}</Text>
                </div>
              </div>
              <Title level={4} className="qa-item-title">{item.title}</Title>
              <Paragraph className="qa-item-content">{item.content}</Paragraph>
              
              {item.answers && item.answers.length > 0 && (
                <div className="qa-answers">
                  <Collapse ghost>
                    <Panel
                      header={`${item.answers.length} 个回答`}
                      key={item.id}
                    >
                      {item.answers.map(answer => (
                        <div key={answer.id} className="qa-answer">
                          <div className="qa-answer-header">
                            <Avatar size="small" src={answer.avatar} />
                            <div className="qa-answer-info">
                              <Text strong>{answer.author}</Text>
                              {answer.isBest && <Tag color="gold">最佳回答</Tag>}
                              <Text type="secondary">{answer.createdAt}</Text>
                            </div>
                          </div>
                          <Paragraph className="qa-answer-content">
                            {answer.content}
                          </Paragraph>
                        </div>
                      ))}
                    </Panel>
                  </Collapse>
                </div>
              )}

              <div className="qa-item-actions">
                <Button type="text" onClick={() => setAnswerModal(item.id)}>
                  <CheckCircleOutlined /> 我来回答
                </Button>
                <Text type="secondary">👁 {item.views} 浏览</Text>
              </div>
            </List.Item>
          )}
        />
      )}

      <Modal
        title="提交问题"
        open={questionModal}
        onCancel={() => setQuestionModal(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={questionForm} onFinish={handleSubmitQuestion}>
          <Form.Item
            name="title"
            label="问题标题"
            rules={[
              { required: true, message: '请输入问题标题' },
              { min: 5, max: 50, message: '标题长度为5-50个字符' },
              { 
                pattern: /^[\u4e00-\u9fa5a-zA-Z0-9，。！？、；：""''（）\s]+$/,
                message: '标题只能包含中文、英文、数字和常用标点符号'
              }
            ]}
          >
            <Input placeholder="请简洁描述你的问题（5-50字）" maxLength={50} showCount />
          </Form.Item>
          <Form.Item
            name="content"
            label="问题详情"
            rules={[
              { required: true, message: '请输入问题详情' },
              { min: 10, max: 500, message: '详情长度为10-500个字符' },
              { 
                pattern: /^[\u4e00-\u9fa5a-zA-Z0-9，。！？、；：""''（）《》【】\s\n]+$/,
                message: '内容只能包含中文、英文、数字和常用标点符号'
              }
            ]}
          >
            <TextArea 
              rows={4} 
              placeholder="详细描述你的问题，包括你遇到的困难、已经尝试过的方法等..." 
              showCount 
              maxLength={500}
            />
          </Form.Item>
          <Form.Item
            name="contact"
            label="联系方式（选填）"
            rules={[
              { 
                pattern: /^$|^1[3-9]\d{9}$/,
                message: '请输入正确的手机号码'
              }
            ]}
          >
            <Input placeholder="方便我们更好地为你解答（选填）" maxLength={11} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large">
              提交问题
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="提交回答"
        open={!!answerModal}
        onCancel={() => setAnswerModal(null)}
        footer={null}
        destroyOnClose
      >
        <Form form={answerForm} onFinish={handleSubmitAnswer}>
          <Form.Item
            name="content"
            label="你的回答"
            rules={[
              { required: true, message: '请输入回答内容' },
              { min: 5, max: 500, message: '回答长度为5-500个字符' },
              { 
                pattern: /^[\u4e00-\u9fa5a-zA-Z0-9，。！？、；：""''（）《》【】\s\n]+$/,
                message: '内容只能包含中文、英文、数字和常用标点符号'
              }
            ]}
          >
            <TextArea 
              rows={4} 
              placeholder="分享你的经验和见解，帮助其他剪纸爱好者..." 
              showCount 
              maxLength={500}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large">
              提交回答
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );

  return (
    <div className="skill-page">
      <div className="container">
        <div className="page-header">
          <Title level={2}>技艺解析</Title>
          <Paragraph type="secondary">
            系统学习剪纸技艺，从工具到技法，从入门到精通
          </Paragraph>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="skill-tabs"
          size="large"
        />

        <div className="tab-content">
          {activeTab === 'tools' && renderTools()}
          {activeTab === 'techniques' && renderTechniques()}
          {activeTab === 'tutorials' && renderTutorials()}
          {activeTab === 'qa' && renderQA()}
        </div>
      </div>
    </div>
  );
};

export default Skill;
