'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  onAddressChange: (address: string) => void
}

export default function AddressInput({ onAddressChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')

  useEffect(() => {
    if (!window.google || !inputRef.current) return

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode'],
      componentRestrictions: { country: 'th' },
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      const address = place.formatted_address || place.name
      if (address) {
        setValue(address)
        onAddressChange(address)
      }
    })

    return () => {
      google.maps.event.clearInstanceListeners(autocomplete)
    }
  }, [onAddressChange])

  // In case Google autocomplete fails or is disabled
  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const manualAddress = e.target.value
    setValue(manualAddress)
    onAddressChange(manualAddress)
  }

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={handleManualChange}
      placeholder="Enter delivery address"
      className="w-full p-2 border rounded"
    />
  )
}