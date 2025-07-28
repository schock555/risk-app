import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useHazardData(zipCode: string | null) {
  const { data, error, isLoading } = useSWR(
    zipCode ? `/api/hazards/by-zip?zip=${zipCode}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 1800000 // 30 minutes
    }
  )

  return {
    hazardData: data,
    isLoading,
    error
  }
}