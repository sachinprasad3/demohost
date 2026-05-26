import React, { useState, useRef, useEffect } from 'react'; // 1. Import useRef
import { GoogleMap, useJsApiLoader, Autocomplete, Marker } from '@react-google-maps/api';
import axiosInstance from "../../utills/axiosInstance"; 

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const libraries = ["places"];

const defaultCenter = { lat: 23.3441, lng: 85.3096 }; 
const schoolLatLong = { lat: 23.38247673060551, lng: 85.30330548235567 };

const mapContainerStyle = {
  width: '100%',
  height: '200px',
  
};

const TransportLocationSelector = ({ onLocationSelect,formData }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries 
  });

  const [map, setMap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(defaultCenter);
  const [currentAddress, setCurrentAddress] = useState(formData?.pickupLocationName || "");
  const [currentLandmark, setCurrentLandmark] = useState("");
  const [autocomplete, setAutocomplete] = useState(null);
const didInit = useRef(false);
  
  // 2. Create a Ref for the input field to update it visually
  const inputRef = useRef(null);

  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onLoadMap = (mapInstance) => setMap(mapInstance);
  const onLoadAutocomplete = (autoC) => setAutocomplete(autoC);

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) return;

      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };

      const fullAddress = place.formatted_address || "Unknown Address";
      const placeName = place.name || ""; 
      const landmark = (placeName !== fullAddress) ? placeName : "";

      // Update State
      setCurrentAddress(fullAddress);
      setCurrentLandmark(landmark);
      setSelectedLocation(location);
      setApiResponse(null);

      // Map Pan
      if(map) {
         map.panTo(location);
         map.setZoom(15);
      }
    }
  };

  // --- 3. REVERSE GEOCODING LOGIC ---
  const onMarkerDragEnd = (e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    
    // Update Map Pin Position
    setSelectedLocation({ lat: newLat, lng: newLng });
    setApiResponse(null); // Reset fare since location changed

    // Check if Geocoder is available
    if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        
        geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results, status) => {
            if (status === "OK" && results[0]) {
                const newAddress = results[0].formatted_address;
                
                // A. Update State variables
                setCurrentAddress(newAddress);
                setCurrentLandmark("Custom Pin Location");

                // B. Update the Search Bar UI
                if (inputRef.current) {
                    inputRef.current.value = newAddress;
                }
            } else {
                console.error("Geocoder failed due to: " + status);
                setCurrentAddress("Custom Pin Location");
            }
        });
    }
  };

useEffect(() => {
  if (!formData?.pickupLatitude || !formData?.pickupLongitude) return;

  const loc = {
    lat: Number(formData.pickupLatitude),
    lng: Number(formData.pickupLongitude)
  };

  setSelectedLocation(loc);
}, [formData?.pickupLatitude, formData?.pickupLongitude]);

useEffect(() => {
  if (!autocomplete) return;
  if (!inputRef.current) return;
  if (!formData?.pickupLocationName) return;

  inputRef.current.value = formData.pickupLocationName;
  setCurrentAddress(formData.pickupLocationName);
}, [autocomplete, formData?.pickupLocationName]);


useEffect(() => {
  if (!map) return;
  if (!selectedLocation) return;

  map.panTo(selectedLocation);
  map.setZoom(15);
}, [map]);




  const handleGetFare = async () => {
    setLoading(true);
    setError(null);
    let fareRes = {
      pickupLocationId: null,
  pickupLocationName: null,
  pickupLatitude: null,
  pickupLongitude: null,
  pickupDistanceInKm: null,
  pickupMonthlyFare: null,
    }

    const payload = {
        locationName: currentAddress || "Custom Location",
        locationLandmark: currentLandmark,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        locationCode: null 
    };

    try {
        const response = await axiosInstance.post('/api/transport/calculate-fare', payload);
      
        const result = response.data.data  || response.data;

        fareRes = {
      pickupLocationId: result?.id,
  pickupLocationName: result?.locationName,
  pickupLatitude: result?.latitude,
  pickupLongitude: result?.longitude,
  pickupDistanceInKm:result?.distanceInKm,
  pickupMonthlyFare: result?.totalFare,
    }
        setApiResponse(result);

        if (result && result.id) {
            onLocationSelect(fareRes); 
        }

    } catch (err) {
        console.error("API Error:", err);
        setError("Failed to calculate fare. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  if (!isLoaded) {
      return <div>Loading Maps...</div>;
  }

  return (
      <>
      <li className="fullsec">
        <div className="form-group">
          <label className="form-label text-muted">Search or Drag Pin to your location</label>
          <Autocomplete onLoad={onLoadAutocomplete} onPlaceChanged={onPlaceChanged} > 
            <input ref={inputRef} type="text" placeholder="Search pickup location..." className="form-control" style={{ borderRadius: '25px' }} />
          </Autocomplete>
          <GoogleMap mapContainerStyle={mapContainerStyle} center={selectedLocation} zoom={13} onLoad={onLoadMap} >
          <Marker position={selectedLocation} draggable={true} onDragEnd={onMarkerDragEnd} />
          <Marker position={schoolLatLong} label="🏫"  title="School Location" />
        </GoogleMap>
        </div>
        <div className="form-group">
            <button type="button" className={`btn ${loading || !currentAddress ? 'btn-secondary' : 'btn-primary'}`}
                onClick={handleGetFare} disabled={loading || !currentAddress || currentAddress.trim() === ""}  >
                {loading ? "Calculating..." : "Get Fare Details"}
            </button>
            {/* Optional UI hint for the user */}
            {(!currentAddress || currentAddress.trim() === "") && (
              <small className="text-center text-danger mt-1">
                Please search for an address or drag the pin to enable fare calculation.
              </small>
            )}
            {error && <div className="alert alert-danger mt-2">{error}</div>}
        </div> 
      </li> 
        

        {formData?.pickupLocationId && (
          <li className="fullsec">
            <div className="farebox"> 
                 <h5 className="text-success mb-3">Location Confirmed</h5>
                 <div className="form-group">
                      <label className="text-muted">Distance</label>
                      <div className="fw-bold fs-5">{formData?.pickupDistanceInKm} km</div>
                  </div>
                   
                  <div className="mt-2 form-group">
                      <label className="text-muted">Monthly Fare</label>
                      <div className="fw-bold fs-5 text-success">₹ {formData?.pickupMonthlyFare}</div>
                  </div>
                 
                 <div className="mt-2 text-start">
                    <small className="text-muted d-block">Location: {formData?.pickupLocationName}</small>
                 </div> 
            </div>
            </li>
        )}
      </>
  );
};

export default TransportLocationSelector;