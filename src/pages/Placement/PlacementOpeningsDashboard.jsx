import React from 'react'
import { useLocation } from 'react-router-dom'
import Section1 from '../../components/PlacementPage/OpeningDashboard/Section1'
import Section2 from '../../components/PlacementPage/OpeningDashboard/Section2'
import Section3 from '../../components/PlacementPage/OpeningDashboard/Section3'
import Section4 from '../../components/PlacementPage/OpeningDashboard/Section4'

const PlacementOpeningsDashboard = () => {
  const location = useLocation()
  const isTrackingMode = location.pathname.startsWith('/super-admin')

  return (
    <div className={isTrackingMode ? 'super-admin-placement-tracking' : ''}>
      <Section1 trackingMode={isTrackingMode} />
      <Section2 />
      <Section3 />
      <Section4 />
    </div>
  )
}

export default PlacementOpeningsDashboard
