import React from 'react'
import MainBanner from '../component/MainBanner'
import Categories from '../component/Categories'
import BestSeller from '../component/BestSeller'
import BottomBanner from '../component/BottomBanner'
import NewLetter from '../component/NewLetter'
const Home = () => {
  return (
    <div className="mt-10"> 
      <MainBanner />
      <Categories />
      <BestSeller />
      <BottomBanner />
      <NewLetter />
    </div>
  )
}

export default Home
