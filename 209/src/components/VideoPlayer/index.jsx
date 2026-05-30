import { useState, useRef, useEffect } from 'react'
import { Slider, Button, Space, Select, Tooltip } from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  SoundOutlined,
  MutedOutlined
} from '@ant-design/icons'

const { Option } = Select

const VideoPlayer = ({ src, thumbnail, title, autoPlay = false }) => {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeoutRef = useRef(null)

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('ended', handleEnded)
    }
  }, [])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (value) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value
      setCurrentTime(value)
    }
  }

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      setCurrentTime(0)
      if (!isPlaying) {
        videoRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement
    if (!container) return

    if (!document.fullscreenElement) {
      container.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2]

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        background: '#000',
        borderRadius: 8,
        overflow: 'hidden'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        style={{ width: '100%', display: 'block', cursor: 'pointer' }}
        onClick={togglePlay}
        poster={thumbnail}
        playsInline
      >
        <source src={src} type="video/mp4" />
        您的浏览器不支持视频播放
      </video>

      {!isPlaying && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.3)',
            cursor: 'pointer'
          }}
          onClick={togglePlay}
        >
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(139, 69, 19, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 40,
            transition: 'transform 0.2s'
          }}>
            ▶
          </div>
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
          padding: '40px 16px 16px',
          transition: 'opacity 0.3s',
          opacity: showControls ? 1 : 0,
          pointerEvents: showControls ? 'auto' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ color: 'white', fontSize: 13, minWidth: 45 }}>
            {formatTime(currentTime)}
          </span>
          <Slider
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            tooltip={{ formatter: (value) => formatTime(value || 0) }}
            style={{ flex: 1 }}
            styles={{
              track: { backgroundColor: '#8B4513' },
              rail: { backgroundColor: 'rgba(255,255,255,0.3)' },
              handle: { borderColor: '#8B4513' }
            }}
          />
          <span style={{ color: 'white', fontSize: 13, minWidth: 45, textAlign: 'right' }}>
            {formatTime(duration)}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space size="middle">
            <Tooltip title={isPlaying ? '暂停' : '播放'}>
              <Button
                type="text"
                icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={togglePlay}
                style={{ color: 'white', fontSize: 24, padding: 0, height: 'auto' }}
              />
            </Tooltip>
            <Tooltip title="重新开始">
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={handleRestart}
                style={{ color: 'white', fontSize: 18, padding: 0, height: 'auto' }}
              />
            </Tooltip>
            <Space size="small">
              <Tooltip title={isMuted ? '取消静音' : '静音'}>
                <Button
                  type="text"
                  icon={isMuted ? <MutedOutlined /> : <SoundOutlined />}
                  onClick={() => setIsMuted(!isMuted)}
                  style={{ color: 'white', fontSize: 18, padding: 0, height: 'auto' }}
                />
              </Tooltip>
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={isMuted ? 0 : volume}
                onChange={(v) => {
                  setVolume(v)
                  setIsMuted(v === 0)
                }}
                style={{ width: 80 }}
                styles={{
                  track: { backgroundColor: '#8B4513' },
                  rail: { backgroundColor: 'rgba(255,255,255,0.3)' }
                }}
              />
            </Space>
          </Space>
          <Space size="middle">
            <Select
              value={playbackRate}
              onChange={setPlaybackRate}
              size="small"
              style={{ width: 70 }}
              variant="borderless"
              listHeight={200}
            >
              {speedOptions.map(speed => (
                <Option key={speed} value={speed}>
                  {speed}x
                </Option>
              ))}
            </Select>
            <Tooltip title="全屏">
              <Button
                type="text"
                icon={<FullscreenOutlined />}
                onClick={toggleFullscreen}
                style={{ color: 'white', fontSize: 18, padding: 0, height: 'auto' }}
              />
            </Tooltip>
          </Space>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
