"use client"

import type React from "react"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, AreaChart, Area } from "recharts"

interface DonutChartProps {
  data: Array<{
    name: string
    value: number
    color: string
  }>
  centerValue?: string
  centerLabel?: string
  className?: string
}

export function DonutChart({ data, centerValue, centerLabel, className }: DonutChartProps) {
  const config = data.reduce((acc, item) => {
    acc[item.name.toLowerCase()] = {
      label: item.name,
      color: item.color,
    }
    return acc
  }, {} as any)

  return (
    <div className={className}>
      <ChartContainer config={config} className="h-full w-full">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            dataKey="value"
            startAngle={90}
            endAngle={450}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
        </PieChart>
      </ChartContainer>
      {centerValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{centerValue}</div>
            {centerLabel && <div className="text-sm text-muted-foreground">{centerLabel}</div>}
          </div>
        </div>
      )}
    </div>
  )
}

interface SmoothLineChartProps {
  data: Array<{
    [key: string]: any
  }>
  xKey: string
  yKey: string
  color?: string
  className?: string
}

export function SmoothLineChart({ data, xKey, yKey, color = "#0891b2", className }: SmoothLineChartProps) {
  const config = {
    [yKey]: {
      label: yKey,
      color: color,
    },
  }

  return (
    <div className={className}>
      <ChartContainer config={config} className="h-full w-full">
        <LineChart data={data}>
          <XAxis
            dataKey={xKey}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
          <Line
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={3}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
        </LineChart>
      </ChartContainer>
    </div>
  )
}

interface AreaChartProps {
  data: Array<{
    [key: string]: any
  }>
  xKey: string
  yKey: string
  color?: string
  className?: string
}

export function SmoothAreaChart({ data, xKey, yKey, color = "#0891b2", className }: AreaChartProps) {
  const config = {
    [yKey]: {
      label: yKey,
      color: color,
    },
  }

  return (
    <div className={className}>
      <ChartContainer config={config} className="h-full w-full">
        <AreaChart data={data}>
          <XAxis
            dataKey={xKey}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
          <Area type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} fill={`${color}20`} fillOpacity={0.6} />
          <ChartTooltip content={<ChartTooltipContent />} />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}

interface ProgressRingProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  className?: string
  children?: React.ReactNode
}

export function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = "#0891b2",
  backgroundColor = "#e5e7eb",
  className,
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const percentage = (value / max) * 100
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  )
}
