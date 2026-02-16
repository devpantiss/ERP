import React from 'react'
import HeroSlider from '../components/Homepage/HeroSlider'
import InitiativesSection from '../components/Homepage/InitiativesSection'
import ImpactSection from '../components/Homepage/ImpactSection'
import ImpactInAction from '../components/Homepage/ImpactInAction'
import QuoteHero from '../components/Homepage/QuoteHero'
import NewsSection from '../components/Homepage/NewsSection'
import NewsletterStrip from '../components/Homepage/NewsLetterStrip'

const HomePage = () => {
  return (
    <div>
        <HeroSlider />
        <InitiativesSection />
        <ImpactSection />
        <ImpactInAction />
        <QuoteHero />
        <NewsSection />
        <NewsletterStrip />
    </div>
  )
}

export default HomePage