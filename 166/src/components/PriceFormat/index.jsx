import React from 'react'
import './index.scss'

const PriceFormat = ({ price, originalPrice, size = 'default', className = '' }) => {
  const [integer, decimal] = Number(price).toFixed(1).split('.')
  const sizeClass = size === 'large' ? 'price-large' : size === 'small' ? 'price-small' : ''

  return (
    <span className={`price-format ${sizeClass} ${className}`}>
      <span className="symbol">¥</span>
      <span className="integer">{integer}</span>
      <span className="decimal">.{decimal}</span>
      {originalPrice && (
        <span className="original-price">¥{Number(originalPrice).toFixed(1)}</span>
      )}
    </span>
  )
}

export default React.memo(PriceFormat)
