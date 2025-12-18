"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Navigation, Search } from "lucide-react"

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void
  initialLocation?: { lat: number; lng: number }
}

export function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
  const [location, setLocation] = useState(initialLocation || { lat: 28.6139, lng: 77.209 })
  const [address, setAddress] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [locationTimeout, setLocationTimeout] = useState<NodeJS.Timeout | null>(null)

  // Update parent component when location changes
  useEffect(() => {
    onLocationSelect({ lat: location.lat, lng: location.lng, address })
  }, [location, address, onLocationSelect])

  // Initialize with a default address if none provided
  useEffect(() => {
    if (!address && location.lat === 28.6139 && location.lng === 77.209) {
      setAddress("Delhi, India (Default Location)")
    }
  }, [address, location])

  const handleCoordinateChange = (lat: number, lng: number) => {
    setLocation({ lat, lng })
    // Simple address generation
    setAddress(`Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
  }

  const searchLocation = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      // Use Nominatim for forward geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        {
          headers: {
            'User-Agent': 'NagarAlertHub/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }

      const data = await response.json()
      if (data && data.length > 0) {
        const result = data[0]
        const lat = parseFloat(result.lat)
        const lng = parseFloat(result.lon)
        setLocation({ lat, lng })
        setAddress(result.display_name || searchQuery)
      } else {
        alert("Location not found. Please try a different search term.")
      }
    } catch (error) {
      console.error("Search error:", error)
      alert("Failed to search location. Please enter coordinates manually.")
    } finally {
      setIsSearching(false)
    }
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. Please enter coordinates manually.")
      return
    }

    // Check if running on HTTPS or localhost (required for geolocation)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      alert("Location access requires a secure connection (HTTPS). Please access the site over HTTPS or run locally on localhost. You can still enter coordinates manually.")
      return
    }

    setIsLoading(true)

    // Set a manual timeout to cancel the request after 10 seconds
    const timeoutId = setTimeout(() => {
      setIsLoading(false)
      alert("Location request is taking too long. This might happen if GPS signal is weak or unavailable. Please try again outdoors or enter coordinates manually.")
    }, 10000)
    setLocationTimeout(timeoutId)

    // First, check if we have permission
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'denied') {
        if (locationTimeout) {
          clearTimeout(locationTimeout)
          setLocationTimeout(null)
        }
        alert("Location access is blocked. Please enable location permissions in your browser settings and try again, or enter coordinates manually.")
        setIsLoading(false)
        return
      }

      // Try to get location with extended timeout
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (locationTimeout) {
            clearTimeout(locationTimeout)
            setLocationTimeout(null)
          }

          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setLocation({ lat, lng })

          // Get address from coordinates using reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'NagarAlertHub/1.0'
                }
              }
            )

            if (response.ok) {
              const data = await response.json()
              console.log('Reverse geocoding response:', data) // Debug log

              if (data && data.display_name) {
                // Extract area information for better accuracy display
                const address = data.address || {}
                const areaParts = [
                  address.neighbourhood,
                  address.suburb,
                  address.city_district,
                  address.city,
                  address.town,
                  address.village,
                  address.county,
                  address.state,
                  address.country
                ].filter(Boolean)

                console.log('Area parts:', areaParts) // Debug log

                const areaName = areaParts.length > 0 ? areaParts.slice(0, 2).join(', ') : data.display_name.split(',')[0] || 'Unknown Area'
                const fullAddress = `${areaName} (${lat.toFixed(6)}, ${lng.toFixed(6)})`

                setAddress(fullAddress)
              } else {
                setAddress(`Current Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
              }
            } else {
              console.warn('Reverse geocoding failed with status:', response.status)
              setAddress(`Current Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
            }
          } catch (error) {
            console.warn('Reverse geocoding failed:', error)
            setAddress(`Current Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
          }

          setIsLoading(false)
        },
        (error) => {
          if (locationTimeout) {
            clearTimeout(locationTimeout)
            setLocationTimeout(null)
          }

          console.warn("Geolocation error:", error.code, error.message)
          setIsLoading(false)

          let errorMessage = "Unable to get your location. "
          let suggestions = "Please try again or enter coordinates manually."

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "Location access was denied. "
              suggestions = "Please enable location permissions in your browser settings and try again."
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable. "
              suggestions = "Please check your GPS settings, ensure you're outdoors, or enter coordinates manually."
              break
            case error.TIMEOUT:
              errorMessage += "Location request timed out. "
              suggestions = "This can happen in poor GPS conditions. Please try again in a moment, or enter coordinates manually."
              break
          }

          // Show a more detailed alert with suggestions
          alert(`${errorMessage}\n\n${suggestions}`)
        },
        {
          enableHighAccuracy: false, // Changed to false for faster response
          timeout: 30000, // Increased timeout to 30 seconds
          maximumAge: 300000, // 5 minutes
        }
      )
    }).catch(() => {
      // Fallback for browsers that don't support permissions API
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setLocation({ lat, lng })

          // Get address from coordinates using reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'NagarAlertHub/1.0'
                }
              }
            )

            if (response.ok) {
              const data = await response.json()
              console.log('Reverse geocoding response (fallback):', data) // Debug log

              if (data && data.display_name) {
                // Extract area information for better accuracy display
                const address = data.address || {}
                const areaParts = [
                  address.neighbourhood,
                  address.suburb,
                  address.city_district,
                  address.city,
                  address.town,
                  address.village,
                  address.county,
                  address.state,
                  address.country
                ].filter(Boolean)

                console.log('Area parts (fallback):', areaParts) // Debug log

                const areaName = areaParts.length > 0 ? areaParts.slice(0, 2).join(', ') : data.display_name.split(',')[0] || 'Unknown Area'
                const fullAddress = `${areaName} (${lat.toFixed(6)}, ${lng.toFixed(6)})`

                setAddress(fullAddress)
              } else {
                setAddress(`Current Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
              }
            } else {
              console.warn('Reverse geocoding failed with status (fallback):', response.status)
              setAddress(`Current Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
            }
          } catch (error) {
            console.warn('Reverse geocoding failed:', error)
            setAddress(`Current Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
          }

          setIsLoading(false)
        },
        (error) => {
          console.warn("Geolocation error:", error.code, error.message)
          setIsLoading(false)

          let errorMessage = "Unable to get your location. "
          let suggestions = "Please try again or enter coordinates manually."

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "Location access was denied. "
              suggestions = "Please enable location permissions in your browser settings and try again."
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable. "
              suggestions = "Please check your GPS settings, ensure you're outdoors, or enter coordinates manually."
              break
            case error.TIMEOUT:
              errorMessage += "Location request timed out. "
              suggestions = "This can happen in poor GPS conditions. Please try again in a moment, or enter coordinates manually."
              break
          }

          alert(`${errorMessage}\n\n${suggestions}`)
        },
        {
          enableHighAccuracy: false, // Changed to false for faster response
          timeout: 30000, // Increased timeout to 30 seconds
          maximumAge: 300000, // 5 minutes
        }
      )
    })
  }

  return (
    <div className="space-y-4">
      {/* Location Search */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
          />
        </div>
        <Button
          type="button"
          onClick={searchLocation}
          disabled={isSearching || !searchQuery.trim()}
          variant="outline"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Current Location Button */}
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={useCurrentLocation}
          disabled={isLoading}
          className="w-full"
          variant="outline"
        >
          <Navigation className="h-4 w-4 mr-2" />
          {isLoading ? "Getting location..." : "Use My Current Location"}
        </Button>
      </div>

      {/* Manual Entry Notice */}
      <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-2 rounded border">
        💡 <strong>Tip:</strong> If GPS doesn't work, you can manually enter coordinates or search for a location above.
      </div>

      {/* Coordinate Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="0.0001"
            value={location.lat}
            onChange={(e) => handleCoordinateChange(parseFloat(e.target.value) || 0, location.lng)}
            placeholder="28.6139"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="0.0001"
            value={location.lng}
            onChange={(e) => handleCoordinateChange(location.lat, parseFloat(e.target.value) || 0)}
            placeholder="77.2090"
          />
        </div>
      </div>

      {/* Address Display */}
      {address && (
        <div className="space-y-2">
          <Label>Selected Location</Label>
          <Input value={address} readOnly className="bg-muted" />
        </div>
      )}

      {/* Map Preview */}
      <div className="relative rounded-lg border overflow-hidden bg-muted">
        <div className="aspect-video w-full">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.01},${location.lat - 0.01},${location.lng + 0.01},${location.lat + 0.01}&layer=mapnik&marker=${location.lat},${location.lng}`}
            className="border-0"
            title="Location Preview"
          />
        </div>
        <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs">
          <MapPin className="h-3 w-3 inline mr-1" />
          Preview
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Search by location name, use GPS, or enter coordinates manually
      </p>
    </div>
  )
}
