'use client'

import React from 'react'
import styles from './colors.module.css'

function page() {
  const colors = [
    'background',
    'foreground',
    'card',
    'card-foreground',
    'popover',
    'popover-foreground',
    'primary',
    'primary-foreground',
    'secondary',
    'secondary-foreground',
    'muted',
    'muted-foreground',
    'accent',
    'accent-foreground',
    'destructive',
    'destructive-foreground',
    'border',
    'input',
    'ring',
    'chart-1',
    'chart-2',
    'chart-3',
    'chart-4',
    'chart-5',
  ]

  return (
    <div className={styles.grid}>
      {colors.map((color) => {
        const baseColor = color.replace('-foreground', '')
        const style = {
          '--block-color': `var(--${color})`,
          '--text-color': `var(--${
            color.includes('foreground') ? baseColor : color + '-foreground'
          })`,
        } as React.CSSProperties

        return (
          <div key={color} className={styles.colorBlock} style={style}>
            {color}
          </div>
        )
      })}
    </div>
  )
}

export default page
