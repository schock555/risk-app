import { useState, useCallback } from 'react'
import { useDebounce } from './useDebounce'
import useSWR from 'swr'

export interface LocationResult {
  type: 'zip' | 'city' | 'address'
  code: string
  city: string
  state: string
  county?: string | null
  latitude: number
  longitude: number
  display: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useLocationSearch(query: string) {
  const debouncedQuery = useDebounce(query, 300)
  
  const { data, error, isLoading } = useSWR(
    debouncedQuery && debouncedQuery.length >= 2
      ? `/api/geocode?q=${encodeURIComponent(debouncedQuery)}`
      : null,
    fetcher
  )

  return {
    results: data?.results || [],
    isLoading,
    error
  }
}