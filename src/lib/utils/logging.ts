/**
 * Development-only logging utilities
 */

export const log = process.env.NODE_ENV === 'development'
  ? (...args: unknown[]) => console.log('[Debug]:', ...args)
  : () => {}

export const logPerformance = process.env.NODE_ENV === 'development'
  ? (label: string, startTime: number) => {
      const duration = performance.now() - startTime
      console.log(`[Performance]: ${label} took ${duration.toFixed(2)}ms`)
    }
  : () => {} 