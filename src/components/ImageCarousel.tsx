'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'

const Slider = dynamic(() => import('react-slick'), {
  ssr: false,
})

const universityLogos = [
  { src: '/university-logos/harvard.png', alt: 'Harvard University' },
  { src: '/university-logos/yale.png', alt: 'Yale University' },
  { src: '/university-logos/mit.png', alt: 'MIT' },
  { src: '/university-logos/stanford.png', alt: 'Stanford University' },
  { src: '/university-logos/princeton.png', alt: 'Princeton University' },
  { src: '/university-logos/columbia.png', alt: 'Columbia University' },
  { src: '/university-logos/berkeley.png', alt: 'UC Berkeley' },
  { src: '/university-logos/cornell.png', alt: 'Cornell University' },
  { src: '/university-logos/ucla.png', alt: 'UCLA' },
  { src: '/university-logos/chicago.png', alt: 'University of Chicago' },
  { src: '/university-logos/penn.png', alt: 'University of Pennsylvania' },
  { src: '/university-logos/northwestern.png', alt: 'Northwestern University' },
  {
    src: '/university-logos/johns-hopkins.png',
    alt: 'Johns Hopkins University',
  },
  { src: '/university-logos/duke.png', alt: 'Duke University' },
]

const ImageCarousel: React.FC = () => {
  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: true,
    speed: 5000,
    autoplaySpeed: 0,
    cssEase: 'linear',
    pauseOnHover: false,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          speed: 4000,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          speed: 3000,
        },
      },
    ],
  }

  return (
    <div className="logos-carousel-section bg-white py-12 sm:py-16">
      <div className="logos-carousel-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-header text-center mb-10">
          <h3 className="section-title text-3xl font-semibold text-violet-800 relative inline-block">
            Students from Top Universities Use and Trust Resume Bueno
            {/* <span className="title-underline absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-teal-500 rounded-full mt-2"></span> */}
          </h3>
        </div>

        <div className="carousel-container relative px-4">
          <Slider {...settings}>
            {[...universityLogos, ...universityLogos].map((logo, index) => (
              <div key={index} className="carousel-slide px-4">
                <div className="logo-container flex items-center justify-center h-28">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={150}
                    height={60}
                    className="logo-image object-contain max-h-24 grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  )
}

export default ImageCarousel
