import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Row,
  Col,
  Card,
  Typography,
  Tabs,
  List,
  Avatar,
  Progress,
  Button,
  Input,
  Form,
  Modal,
  Radio,
  Space,
  Tag,
  Rate,
  message,
  Result,
  Statistic,
  Select,
  Tooltip,
  Popconfirm,
  Alert,
} from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  StarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  SendOutlined,
  BookOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SettingOutlined,
  SaveOutlined,
  SoundOutlined,
  MutedOutlined,
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import EmptyState from '@/components/common/EmptyState'
import PageLoading from '@/components/common/PageLoading'
import {
  updateProgress,
  addNote,
  updateNote,
  deleteNote,
  completeCourse,
  addExamResult,
  generateCertificate,
} from '@/store/slices/learningSlice'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

const speedOptions = [
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1, label: '1.0x (正常)' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2.0x' },
]

const CourseDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const videoRef = useRef(null)
  const progressSaveTimer = useRef(null)
  
  const { courses } = useSelector((state) => state.course)
  const { learningRecords, notes, examResults, certificates } = useSelector((state) => state.learning)
  const { currentUser } = useSelector((state) => state.user)
  
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('chapters')
  const [noteText, setNoteText] = useState('')
  const [examVisible, setExamVisible] = useState(false)
  const [examAnswers, setExamAnswers] = useState({})
  const [examSubmitted, setExamSubmitted] = useState(false)
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [localProgress, setLocalProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [editingNoteContent, setEditingNoteContent] = useState('')
  const [examResultDetail, setExamResultDetail] = useState(null)

  const course = courses.find((c) => c.id === parseInt(id))
  const courseNotes = notes.filter(
    (n) => n.courseId === parseInt(id) && n.userId === currentUser?.id
  ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  
  const learningRecord = learningRecords.find(
    (r) => r.courseId === parseInt(id) && r.userId === currentUser?.id
  )
  const existingExamResult = examResults.find(
    (r) => r.courseId === parseInt(id) && r.userId === currentUser?.id
  )
  const hasCertificate = certificates.some(
    (c) => c.courseId === parseInt(id) && c.userId === currentUser?.id
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      if (learningRecord) {
        setLocalProgress(learningRecord.progress)
        setCurrentChapterIndex(Math.max(0, (learningRecord.currentChapter || 1) - 1))
      }
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [learningRecord])

  useEffect(() => {
    return () => {
      if (progressSaveTimer.current) {
        clearTimeout(progressSaveTimer.current)
      }
    }
  }, [])

  const saveProgressToStore = useCallback((progress, watchedMinutes, chapter) => {
    if (currentUser && course) {
      dispatch(
        updateProgress({
          courseId: course.id,
          userId: currentUser.id,
          progress,
          watchedMinutes,
          currentChapter: chapter + 1,
        })
      )
    }
  }, [currentUser, course, dispatch])

  const debouncedSaveProgress = useCallback((progress, watchedMinutes, chapter) => {
    if (progressSaveTimer.current) {
      clearTimeout(progressSaveTimer.current)
    }
    progressSaveTimer.current = setTimeout(() => {
      saveProgressToStore(progress, watchedMinutes, chapter)
    }, 1000)
  }, [saveProgressToStore])

  if (loading) {
    return <PageLoading text="加载课程信息中..." />
  }

  if (!course) {
    return <EmptyState description="课程不存在" actionText="返回课程列表" onAction={() => navigate('/courses')} />
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`
    }
    return `${mins}分钟`
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
      const currentTimeSec = videoRef.current.currentTime
      const progress = duration > 0 ? Math.min(100, Math.round((currentTimeSec / duration) * 100)) : 0
      const watchedMinutes = Math.round(currentTimeSec / 60)
      if (progress > localProgress) {
        setLocalProgress(progress)
        saveProgressToStore(progress, watchedMinutes, currentChapterIndex)
      }
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTimeSec = videoRef.current.currentTime
      const progress = duration > 0 ? Math.min(100, Math.round((currentTimeSec / duration) * 100)) : 0
      setCurrentTime(currentTimeSec)
      if (progress > localProgress) {
        setLocalProgress(progress)
        const watchedMinutes = Math.round(currentTimeSec / 60)
        debouncedSaveProgress(progress, watchedMinutes, currentChapterIndex)
      }
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      videoRef.current.playbackRate = playbackRate
      videoRef.current.volume = volume
    }
  }

  const handleVideoEnded = () => {
    setIsPlaying(false)
    setLocalProgress(100)
    saveProgressToStore(100, course.duration, currentChapterIndex)
    message.success('视频播放完成！')
  }

  const handleSpeedChange = (speed) => {
    setPlaybackRate(speed)
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
      message.success(`播放速度已调整为 ${speed}x`)
    }
  }

  const handleVolumeChange = (value) => {
    setVolume(value)
    if (videoRef.current) {
      videoRef.current.volume = value
      if (value === 0) {
        setIsMuted(true)
        videoRef.current.muted = true
      } else {
        setIsMuted(false)
        videoRef.current.muted = false
      }
    }
  }

  const toggleMute = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    if (videoRef.current) {
      videoRef.current.muted = newMuted
    }
  }

  const handleSeek = (value) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value
      setCurrentTime(value)
    }
  }

  const handleSubmitNote = () => {
    const trimmedNote = noteText.trim()
    if (!trimmedNote) {
      message.warning('请输入笔记内容')
      return
    }
    if (trimmedNote.length < 5) {
      message.warning('笔记内容至少需要5个字符')
      return
    }
    if (trimmedNote.length > 500) {
      message.warning('笔记内容不能超过500个字符')
      return
    }
    dispatch(
      addNote({
        courseId: course.id,
        userId: currentUser.id,
        chapterId: course.chapters[currentChapterIndex]?.id,
        content: trimmedNote,
      })
    )
    setNoteText('')
    message.success('笔记保存成功！')
  }

  const handleEditNote = (note) => {
    setEditingNoteId(note.id)
    setEditingNoteContent(note.content)
  }

  const handleSaveEditNote = () => {
    const trimmedContent = editingNoteContent.trim()
    if (!trimmedContent) {
      message.warning('笔记内容不能为空')
      return
    }
    if (trimmedContent.length < 5) {
      message.warning('笔记内容至少需要5个字符')
      return
    }
    if (trimmedContent.length > 500) {
      message.warning('笔记内容不能超过500个字符')
      return
    }
    dispatch(updateNote({ noteId: editingNoteId, content: trimmedContent }))
    setEditingNoteId(null)
    setEditingNoteContent('')
    message.success('笔记更新成功！')
  }

  const handleDeleteNote = (noteId) => {
    dispatch(deleteNote(noteId))
    message.success('笔记删除成功！')
  }

  const handleStartExam = () => {
    if (localProgress < 80) {
      message.warning('请先完成至少 80% 的课程学习再参加考核')
      return
    }
    setExamAnswers({})
    setExamSubmitted(false)
    setExamResultDetail(null)
    setExamVisible(true)
  }

  const handleSubmitExam = () => {
    const unanswered = course.exam.questions.filter((_, index) => examAnswers[index] === undefined)
    if (unanswered.length > 0) {
      message.warning(`还有 ${unanswered.length} 道题未作答`)
      return
    }

    const totalQuestions = course.exam.questions.length
    let correctCount = 0
    const details = course.exam.questions.map((q, index) => ({
      question: q.question,
      userAnswer: examAnswers[index],
      correctAnswer: q.answer,
      isCorrect: examAnswers[index] === q.answer,
      options: q.options,
    }))

    details.forEach((d) => {
      if (d.isCorrect) correctCount++
    })

    const score = Math.round((correctCount / totalQuestions) * 100)
    const passed = score >= course.exam.passScore

    dispatch(
      addExamResult({
        courseId: course.id,
        userId: currentUser.id,
        score,
        totalQuestions,
        correctAnswers: correctCount,
        passed,
      })
    )

    if (passed) {
      dispatch(
        completeCourse({
          courseId: course.id,
          userId: currentUser.id,
        })
      )
      dispatch(
        generateCertificate({
          courseId: course.id,
          courseName: course.title,
          userId: currentUser.id,
          userName: currentUser.name,
          score,
        })
      )
    }

    setExamResultDetail({ score, correctCount, totalQuestions, passed, details })
    setExamSubmitted(true)
  }

  const handleRestartExam = () => {
    setExamAnswers({})
    setExamSubmitted(false)
    setExamResultDetail(null)
  }

  const handleChapterClick = (index) => {
    setCurrentChapterIndex(index)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      setCurrentTime(0)
    }
    message.info(`已切换到：${course.chapters[index].title}`)
  }

  const tabItems = [
    {
      key: 'chapters',
      label: (
        <Space>
          <BookOutlined />
          课程章节
        </Space>
      ),
    },
    {
      key: 'notes',
      label: (
        <Space>
          <FileTextOutlined />
          课程笔记 ({courseNotes.length})
        </Space>
      ),
    },
    {
      key: 'exam',
      label: (
        <Space>
          <CheckCircleOutlined />
          知识点考核
        </Space>
      ),
    },
  ]

  const categoryColors = {
    skill: '#52c41a',
    management: '#1890ff',
    compliance: '#fa8c16',
  }

  return (
    <div>
      <Button
        style={{ marginBottom: '16px' }}
        onClick={() => navigate(-1)}
      >
        ← 返回
      </Button>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <div className="video-container" style={{ marginBottom: '16px', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
            <video
              ref={videoRef}
              className="video-player"
              src={course.videoUrl}
              poster={course.cover}
              onPlay={handlePlay}
              onPause={handlePause}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleVideoEnded}
              style={{ width: '100%', maxHeight: '500px', display: 'block' }}
            >
              您的浏览器不支持视频播放
            </video>
            
            <div style={{ background: '#1a1a1a', padding: '12px 16px' }}>
              <Row align="middle" gutter={[16, 8]}>
                <Col flex="auto">
                  <Space size={12} align="center">
                    <Button
                      type="text"
                      icon={isPlaying ? <PauseCircleOutlined style={{ fontSize: '28px', color: '#fff' }} /> : <PlayCircleOutlined style={{ fontSize: '28px', color: '#fff' }} />}
                      onClick={isPlaying ? handlePause : handlePlay}
                      style={{ color: '#fff' }}
                    />
                    <div style={{ color: '#fff', fontSize: '14px', minWidth: '100px' }}>
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </Space>
                </Col>
                <Col flex="auto">
                  <div style={{ padding: '0 16px' }}>
                    <input
                      type="range"
                      min={0}
                      max={duration || 0}
                      value={currentTime}
                      onChange={(e) => handleSeek(Number(e.target.value))}
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </div>
                </Col>
                <Col flex="200px">
                  <Space size={12} align="center">
                    <Tooltip title={isMuted ? '取消静音' : '静音'}>
                      <Button
                        type="text"
                        icon={isMuted ? <MutedOutlined style={{ color: '#fff' }} /> : <SoundOutlined style={{ color: '#fff' }} />}
                        onClick={toggleMute}
                      />
                    </Tooltip>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      style={{ width: '80px' }}
                    />
                    <Select
                      value={playbackRate}
                      onChange={handleSpeedChange}
                      size="small"
                      style={{ width: '100px' }}
                      suffixIcon={<SettingOutlined style={{ color: '#fff' }} />}
                    >
                      {speedOptions.map((opt) => (
                        <Select.Option key={opt.value} value={opt.value}>
                          {opt.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Space>
                </Col>
              </Row>
            </div>
          </div>

          <Card style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <Space>
                <Tag color={categoryColors[course.category]}>{course.categoryName}</Tag>
                <Tag color="geekblue">{course.levelName}</Tag>
                {course.isHot && <Tag color="red">热门</Tag>}
              </Space>
              <Space size={16}>
                <Space size={4}>
                  <StarOutlined style={{ color: '#faad14' }} />
                  <Text>{course.rating}</Text>
                </Space>
                <Space size={4}>
                  <UserOutlined />
                  <Text>{course.students}人学习</Text>
                </Space>
              </Space>
            </div>
            <Title level={3} style={{ marginBottom: '8px' }}>
              {course.title}
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: '16px' }}>
              {course.description}
            </Paragraph>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Avatar size={48} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor}`} />
              <div>
                <Text strong>{course.instructor}</Text>
                <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                  {course.instructorTitle}
                </Text>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Text type="secondary">
                  <ClockCircleOutlined /> 课程时长：{formatDuration(course.duration)}
                </Text>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text type="secondary">学习进度</Text>
                <Text strong style={{ color: '#1677ff' }}>{localProgress}%</Text>
              </div>
              <Progress percent={localProgress} />
            </div>
          </Card>

          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

            {activeTab === 'chapters' && (
              <List
                dataSource={course.chapters}
                renderItem={(chapter, index) => (
                  <List.Item
                    style={{
                      cursor: 'pointer',
                      background: index === currentChapterIndex ? '#e6f7ff' : 'transparent',
                      padding: '12px',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      transition: 'all 0.3s',
                    }}
                    onClick={() => handleChapterClick(index)}
                    hoverable
                  >
                    <List.Item.Meta
                      avatar={
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: index === currentChapterIndex ? '#1677ff' : '#f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: index === currentChapterIndex ? '#fff' : '#666',
                        }}>
                          {index + 1}
                        </div>
                      }
                      title={chapter.title}
                      description={`时长：${chapter.duration}分钟`}
                    />
                    {index === currentChapterIndex ? (
                      <PauseCircleOutlined style={{ fontSize: '20px', color: '#1677ff' }} />
                    ) : (
                      <PlayCircleOutlined style={{ fontSize: '20px', color: '#1677ff' }} />
                    )}
                  </List.Item>
                )}
              />
            )}

            {activeTab === 'notes' && (
              <div>
                <Card style={{ marginBottom: '16px' }} size="small" title={
                  <Space>
                    <EditOutlined />
                    <span>添加笔记</span>
                    <Tag color="blue">当前章节：{course.chapters[currentChapterIndex]?.title}</Tag>
                  </Space>
                }>
                  <TextArea
                    rows={4}
                    placeholder="记录你的学习笔记（5-500字符）..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    style={{ marginBottom: '12px' }}
                    showCount
                    maxLength={500}
                  />
                  <Space>
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleSubmitNote}
                    >
                      保存笔记
                    </Button>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      笔记将与当前章节关联，支持编辑和删除
                    </Text>
                  </Space>
                </Card>
                
                {courseNotes.length > 0 ? (
                  <List
                    dataSource={courseNotes}
                    renderItem={(note) => (
                      <div className="note-item" key={note.id} style={{
                        background: editingNoteId === note.id ? '#e6f7ff' : '#fafafa',
                        padding: '16px',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        border: '1px solid #f0f0f0',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <Space>
                            <Tag color="blue">
                              {course.chapters.find((c) => c.id === note.chapterId)?.title || '未知章节'}
                            </Tag>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              创建：{dayjs(note.createdAt).format('YYYY-MM-DD HH:mm')}
                            </Text>
                            {note.updatedAt !== note.createdAt && (
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                更新：{dayjs(note.updatedAt).format('YYYY-MM-DD HH:mm')}
                              </Text>
                            )}
                          </Space>
                          <Space>
                            {editingNoteId === note.id ? (
                              <>
                                <Button
                                  type="link"
                                  size="small"
                                  icon={<SaveOutlined />}
                                  onClick={handleSaveEditNote}
                                >
                                  保存
                                </Button>
                                <Button
                                  type="link"
                                  size="small"
                                  onClick={() => {
                                    setEditingNoteId(null)
                                    setEditingNoteContent('')
                                  }}
                                >
                                  取消
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  type="link"
                                  size="small"
                                  icon={<EditOutlined />}
                                  onClick={() => handleEditNote(note)}
                                >
                                  编辑
                                </Button>
                                <Popconfirm
                                  title="确定删除这条笔记吗？"
                                  onConfirm={() => handleDeleteNote(note.id)}
                                  okText="删除"
                                  cancelText="取消"
                                >
                                  <Button
                                    type="link"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                  >
                                    删除
                                  </Button>
                                </Popconfirm>
                              </>
                            )}
                          </Space>
                        </div>
                        {editingNoteId === note.id ? (
                          <TextArea
                            rows={3}
                            value={editingNoteContent}
                            onChange={(e) => setEditingNoteContent(e.target.value)}
                            showCount
                            maxLength={500}
                          />
                        ) : (
                          <Text style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.6' }}>
                            {note.content}
                          </Text>
                        )}
                      </div>
                    )}
                  />
                ) : (
                  <EmptyState description="暂无笔记，开始记录你的学习心得吧" />
                )}
              </div>
            )}

            {activeTab === 'exam' && (
              <div>
                {existingExamResult ? (
                  <Result
                    status={existingExamResult.passed ? 'success' : 'error'}
                    title={existingExamResult.passed ? '考核已通过' : '考核未通过'}
                    subTitle={`得分：${existingExamResult.score}分（${existingExamResult.correctAnswers}/${existingExamResult.totalQuestions}题正确）`}
                    extra={[
                      <Button key="retry" type="primary" icon={<ReloadOutlined />} onClick={handleRestartExam}>
                        重新考核
                      </Button>,
                    ]}
                  />
                ) : (
                  <div>
                    <Alert
                      message="考核须知"
                      description="完成80%以上课程学习后可参加考核，考核通过后将获得学习证书。"
                      type="info"
                      showIcon
                      style={{ marginBottom: '16px' }}
                    />
                    <Card style={{ marginBottom: '16px' }}>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Statistic
                            title="题目数量"
                            value={course.exam.questions.length}
                            suffix="题"
                            prefix={<BookOutlined />}
                          />
                        </Col>
                        <Col span={8}>
                          <Statistic
                            title="及格分数"
                            value={course.exam.passScore}
                            suffix="分"
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                          />
                        </Col>
                        <Col span={8}>
                          <Statistic
                            title="当前学习进度"
                            value={localProgress}
                            suffix="%"
                            prefix={<ClockCircleOutlined style={{ color: localProgress >= 80 ? '#52c41a' : '#faad14' }} />}
                          />
                        </Col>
                      </Row>
                    </Card>
                    <div style={{ textAlign: 'center' }}>
                      <Button
                        type="primary"
                        size="large"
                        icon={<CheckCircleOutlined />}
                        onClick={handleStartExam}
                        disabled={localProgress < 80}
                      >
                        {localProgress < 80 ? '请先完成 80% 课程学习' : '开始考核'}
                      </Button>
                      {localProgress < 80 && (
                        <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
                          完成 80% 课程学习后即可参加考核
                        </Text>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <TrophyOutlined style={{ color: '#faad14' }} />
                学习证书
              </Space>
            }
            style={{ marginBottom: '16px' }}
          >
            {hasCertificate ? (
              <div className="certificate-card">
                <TrophyOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <Title level={4} style={{ color: '#fff', marginBottom: '8px' }}>
                  已获得证书
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: '16px' }}>
                  {course.title}
                </Text>
                <Button
                  type="primary"
                  ghost
                  onClick={() => navigate('/learning/certificates')}
                >
                  查看证书
                </Button>
              </div>
            ) : (
              <EmptyState description="完成课程并通过考核后将获得证书" />
            )}
          </Card>

          <Card
            title="讲师介绍"
            style={{ marginBottom: '16px' }}
          >
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <Avatar size={80} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor}`} />
              <Title level={5} style={{ marginTop: '12px', marginBottom: '4px' }}>
                {course.instructor}
              </Title>
              <Text type="secondary">{course.instructorTitle}</Text>
            </div>
          </Card>

          <Card title="课程信息">
            <List
              size="small"
              dataSource={[
                { label: '课程分类', value: course.categoryName },
                { label: '难度等级', value: course.levelName },
                { label: '课程时长', value: formatDuration(course.duration) },
                { label: '章节数', value: `${course.chapters.length}章` },
                { label: '学习人数', value: `${course.students}人` },
                { label: '课程评分', value: `${course.rating}分` },
                { label: '发布时间', value: dayjs(course.createdAt).format('YYYY-MM-DD') },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <span style={{ color: 'rgba(0,0,0,0.45)' }}>{item.label}</span>
                  <span>{item.value}</span>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="课程知识点考核"
        open={examVisible}
        onCancel={() => !examSubmitted && setExamVisible(false)}
        footer={!examSubmitted && [
          <Button key="submit" type="primary" onClick={handleSubmitExam}>
            提交答案
          </Button>,
        ]}
        width={720}
        maskClosable={false}
      >
        {examSubmitted && examResultDetail ? (
          <div>
            <Result
              status={examResultDetail.passed ? 'success' : 'error'}
              title={examResultDetail.passed ? '考核通过！' : '考核未通过'}
              subTitle={`得分：${examResultDetail.score}分（${examResultDetail.correctCount}/${examResultDetail.totalQuestions}题正确）`}
              extra={[
                <Button 
                  key="close" 
                  type="primary" 
                  onClick={() => setExamVisible(false)}
                >
                  关闭
                </Button>,
                !examResultDetail.passed && (
                  <Button 
                    key="retry" 
                    icon={<ReloadOutlined />}
                    onClick={handleRestartExam}
                  >
                    重新考核
                  </Button>
                ),
              ].filter(Boolean)}
            />
            <Card title="答题详情" size="small" style={{ marginTop: '16px' }}>
              {examResultDetail.details.map((d, index) => (
                <div key={index} style={{ marginBottom: '16px', padding: '12px', background: d.isCorrect ? '#f6ffed' : '#fff2f0', borderRadius: '6px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong>{index + 1}. {d.question}</Text>
                    {d.isCorrect ? (
                      <Tag color="success" style={{ marginLeft: '8px' }}>正确</Tag>
                    ) : (
                      <Tag color="error" style={{ marginLeft: '8px' }}>错误</Tag>
                    )}
                  </div>
                  <div style={{ paddingLeft: '16px' }}>
                    <Text type="secondary">你的答案：</Text>
                    <Text style={{ color: d.isCorrect ? '#52c41a' : '#ff4d4f' }}>
                      {String.fromCharCode(65 + d.userAnswer)}. {d.options[d.userAnswer]}
                    </Text>
                    {!d.isCorrect && (
                      <div>
                        <Text type="secondary">正确答案：</Text>
                        <Text style={{ color: '#52c41a' }}>
                          {String.fromCharCode(65 + d.correctAnswer)}. {d.options[d.correctAnswer]}
                        </Text>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </Card>
          </div>
        ) : (
          <Form layout="vertical">
            <Alert
              message="请认真作答"
              description="选择你认为正确的答案，提交后将显示答题结果和详细解析。"
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />
            {course.exam.questions.map((q, index) => (
              <Form.Item
                key={index}
                label={`${index + 1}. ${q.question}`}
                name={`question_${index}`}
                rules={[{ required: true, message: '请选择答案' }]}
                style={{ marginBottom: '24px' }}
              >
                <Radio.Group
                  value={examAnswers[index]}
                  onChange={(e) => setExamAnswers({ ...examAnswers, [index]: e.target.value })}
                >
                  <Space direction="vertical">
                    {q.options.map((opt, optIndex) => (
                      <Radio key={optIndex} value={optIndex}>
                        {String.fromCharCode(65 + optIndex)}. {opt}
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              </Form.Item>
            ))}
            <div style={{ textAlign: 'right', color: 'rgba(0,0,0,0.45)' }}>
              已作答：{Object.keys(examAnswers).length} / {course.exam.questions.length} 题
            </div>
          </Form>
        )}
      </Modal>
    </div>
  )
}

export default CourseDetail
