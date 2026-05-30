import React, { useRef, useState, useEffect } from 'react'
import { Button, Space, Slider, message, Tooltip } from 'antd'
import { 
  PlayCircleOutlined, PauseCircleOutlined, 
  ReloadOutlined, FullscreenOutlined, 
  SoundOutlined, MutedOutlined, LeftOutlined, RightOutlined
} from '@ant-design/icons'
import './style.css'

const VideoPlayer = ({ 
  videoUrl, 
  title = '', 
  onEnded, 
  onPrev, 
  onNext,
  hasPrev = false,
  hasNext = false
}) => {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsPlaying(false)
    setCurrentTime(0)
    setIsLoaded(false)
  }, [videoUrl])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play().catch(err => {
        message.error('视频播放失败，请刷新重试')
      })
    }
    setIsPlaying(!isPlaying)
  }

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      setIsLoaded(true)
    }
  }

  const handleSeek = (value) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value
      setCurrentTime(value)
    }
  }

  const handleVolumeChange = (value) => {
    setVolume(value)
    setIsMuted(value === 0)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen()
      }
    }
  }

  const handleVideoEnded = () => {
    setIsPlaying(false)
    if (onEnded) {
      onEnded()
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="video-player-wrapper">
      {title && <div className="video-player-title">{title}</div>}
      
      <div className="video-container">
        <video
          ref={videoRef}
          className="video-element"
          src={videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleVideoEnded}
          onClick={togglePlay}
          playsInline
        />
        
        {!isLoaded && (
          <div className="video-loading">
            <div className="loading-spinner" />
            <span>视频加载中...</span>
          </div>
        )}

        {!isPlaying && isLoaded && (
          <div className="video-play-overlay" onClick={togglePlay}>
            <PlayCircleOutlined className="play-button-large" />
          </div>
        )}
      </div>

      <div className="video-controls">
        <Space size="small" className="control-left">
          <Tooltip title={isPlaying ? '暂停' : '播放'}>
            <Button 
              type="text" 
              icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />} 
              onClick={togglePlay}
              className="control-btn"
            />
          </Tooltip>
          
          <Tooltip title="重播">
            <Button 
              type="text" 
              icon={<ReloadOutlined />} 
              onClick={handleReplay}
              className="control-btn"
            />
          </Tooltip>

          <Tooltip title="上一步">
            <Button 
              type="text" 
              icon={<LeftOutlined />} 
              onClick={onPrev}
              disabled={!hasPrev}
              className="control-btn"
            />
          </Tooltip>

          <Tooltip title="下一步">
            <Button 
              type="text" 
              icon={<RightOutlined />} 
              onClick={onNext}
              disabled={!hasNext}
              className="control-btn"
            />
          </Tooltip>
        </Space>

        <div className="control-progress">
          <Slider
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            tooltip={{ formatter: formatTime }}
            className="progress-slider"
          />
          <span className="time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <Space size="small" className="control-right">
          <div className="volume-control">
            <Button 
              type="text" 
              icon={isMuted ? <MutedOutlined /> : <SoundOutlined />} 
              onClick={toggleMute}
              className="control-btn"
            />
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
          </div>

          <Tooltip title="全屏">
            <Button 
              type="text" 
              icon={<FullscreenOutlined />} 
              onClick={handleFullscreen}
              className="control-btn"
            />
          </Tooltip>
        </Space>
      </div>
    </div>
  )
}

export default VideoPlayer
