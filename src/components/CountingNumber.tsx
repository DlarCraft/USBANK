'use client'

import React, { useState, useEffect } from 'react'

interface CountingNumberProps {
  value: number
  duration?: number
  formatAsCurrency?: boolean
}

export default function CountingNumber({ 
  value, 
  duration = 1000, 
  formatAsCurrency = false 
}: CountingNumberProps) {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    // For smooth animation after hydration
    const startValue = 0
    const endValue = value
    const difference = endValue - startValue
    if (Math.abs(difference) < 0.01) {
      setDisplayValue(endValue)
      return
    }
    const startTime = Date.now()
    const updateValue = () => {
      const currentTime = Date.now()
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = startValue + (difference * easeOutQuart)
      setDisplayValue(currentValue)
      if (progress < 1) {
        requestAnimationFrame(updateValue)
      } else {
        setDisplayValue(endValue)
      }
    }
    const animationId = requestAnimationFrame(updateValue)
    return () => cancelAnimationFrame(animationId)
  }, [value, duration])

  const formatNumber = (num: number) => {
    if (formatAsCurrency) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num)
    }
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })
  }

  return <span>{formatNumber(displayValue)}</span>
}
