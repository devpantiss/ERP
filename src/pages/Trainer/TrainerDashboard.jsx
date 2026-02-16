import React from 'react'
import Section1 from '../../components/Trainer/Dashboard/Section1'
import Section2 from '../../components/Trainer/Dashboard/Section2'
import Section3 from '../../components/Trainer/Dashboard/Section3'
import Section4 from '../../components/Trainer/Dashboard/Section4'

const TrainerDashboard = () => {
  return (
    <div className='bg-transparent'>
        <Section1 />
        <Section2 />
        <Section3 />
        <Section4 />
    </div>
  )
}

export default TrainerDashboard