import React from 'react'
import AboutBanner from '../components/AboutPage/AboutBanner'
import AboutIntro from '../components/AboutPage/AboutIntro'
import ApproachSection from '../components/AboutPage/ApproachSection'
import PromoBanner from '../components/AboutPage/PromoBanner'
import OurPrinciples from '../components/AboutPage/OurPrinciples'
import LeadershipSection from '../components/AboutPage/Leadership'
import InfrastructureSection from '../components/AboutPage/InfraSection'

const AboutPage = () => {
  return (
    <div>
        <AboutBanner />
        <AboutIntro />
        <ApproachSection />
        <PromoBanner />
        <OurPrinciples />
        <LeadershipSection />
        <InfrastructureSection />
    </div>
  )
}

export default AboutPage