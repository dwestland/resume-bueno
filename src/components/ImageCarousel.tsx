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
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  }

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-3xl text-center mb-8 text-gray-600">
          Students from Top Universities Trust Resume Bueno
        </h3>
        <div className="carousel-container">
          <Slider {...settings}>
            {[...universityLogos, ...universityLogos].map((logo, index) => (
              <div key={index} className="px-4">
                <div className="flex items-center justify-center h-28">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={150}
                    height={60}
                    className="object-contain max-h-24 grayscale hover:grayscale-0 transition-all duration-300"
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
