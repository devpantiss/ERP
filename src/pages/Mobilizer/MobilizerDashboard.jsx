import React from 'react'
import Section1 from '../../components/Mobilizer/Dashboard/Section1'
import Section2 from '../../components/Mobilizer/Dashboard/Section2'
import Section3 from '../../components/Mobilizer/Dashboard/Section3'
// import Section4 from '../../components/Mobilizer/Dashboard/Section4'
import Section5 from '../../components/Mobilizer/Dashboard/Section5'

const MobilizerDashboard = () => {
  return (
    <div className='bg-transparent'>
        <Section1 
          mobilized={1240}
          drives={86}
          enrolled={420}
          revenuePerCandidate={1500}
        />

        <Section2 />
        <Section3 />
        {/* <Section4 /> */}
        <Section5 />
    </div>
  )
}

export default MobilizerDashboard