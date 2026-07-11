import Header from '../components/global/Header'
//import Footer from '../components/global/Footer'
import BottomNavBar from '../components/global/BottomNavBar'
import HeroSection from '../components/home/HeroSection'
import FeaturedCategories from '../components/home/FeaturedCategories'
import CategoryCarousel from '../components/home/CategoryCarousel'


export default function HomePage() {
  return (
    <>
      <Header />
      <main className="pt-[var(--header-height)] animate-fade-in">
        <HeroSection />
        <FeaturedCategories />
        <CategoryCarousel />
      </main>
      {/*<Footer />*/}
      <BottomNavBar />
    </>
  )
}
