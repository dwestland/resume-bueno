'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'

const Slider = dynamic(() => import('react-slick'), {
  ssr: false,
})

const studentReviews = [
  {
    quote:
      'Resume Bueno matched my skills perfectly to job requirements. Three interviews and one offer within two weeks!',
    person: 'Alex T., Harvard University',
    logo: '/university-logos/harvard.png',
  },
  {
    quote:
      'The match qualification score saved me from applying to wrong positions. Landed my tech internship on first try!',
    person: 'Maya P., Yale University',
    logo: '/university-logos/yale.png',
  },
  {
    quote:
      'Resume Bueno transformed my engineering resume. Five callback interviews after months of silence. Worth every penny.',
    person: 'James L., MIT',
    logo: '/university-logos/mit.png',
  },
  {
    quote:
      'Their AI accurately highlighted my relevant skills. Secured interviews at three top tech firms immediately.',
    person: 'Sophia W., Stanford University',
    logo: '/university-logos/stanford.png',
  },
  {
    quote:
      "Resume Bueno's tailored cover letter got me noticed. From application to offer in just 10 days!",
    person: 'Noah R., Princeton University',
    logo: '/university-logos/princeton.png',
  },
  {
    quote:
      'The resume package completely transformed my job search. Four interviews and two offers in one week!',
    person: 'Olivia K., Columbia University',
    logo: '/university-logos/columbia.png',
  },
  {
    quote:
      'Resume Bueno helped me showcase my research experience perfectly. Got hired at my dream biotech company!',
    person: 'Ethan J., UC Berkeley',
    logo: '/university-logos/berkeley.png',
  },
  {
    quote:
      "Their platform highlighted skills I didn't know were valuable. Now working at a Fortune 500 company!",
    person: 'Isabella M., Harvard University',
    logo: '/university-logos/harvard.png',
  },
  {
    quote:
      "Resume Bueno's matching algorithm is genius. Went from zero responses to multiple interviews overnight.",
    person: 'Daniel C., Stanford University',
    logo: '/university-logos/stanford.png',
  },
  {
    quote:
      'The customized resume emphasized my project experience perfectly. Interview requests started flooding in immediately.',
    person: 'Emma R., Yale University',
    logo: '/university-logos/yale.png',
  },
  {
    quote:
      'Resume Bueno transformed my academic achievements into industry strengths. Landed my dream tech role!',
    person: 'William H., MIT',
    logo: '/university-logos/mit.png',
  },
  {
    quote:
      'Their platform helped me pivot careers seamlessly. From academia to industry with three excellent offers.',
    person: 'Ava S., UC Berkeley',
    logo: '/university-logos/berkeley.png',
  },
]

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

const StudentReviews: React.FC = () => {
  const [currentReview, setCurrentReview] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentReview((prev) => (prev + 1) % studentReviews.length)
        setIsVisible(true)
      }, 1000) // Half of the transition duration
    }, 7000) // Change every 7 seconds

    return () => clearInterval(interval)
  }, [])

  const review = studentReviews[currentReview]

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
    <div className="logos-carousel-section bg-white pt-4 overflow-hidden">
      <div className="logos-carousel-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div id="student-reviews" className="section-header text-center mb-8">
          <div className="review-container relative h-24">
            <div
              className={`review-content absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="review-logo mb-6"></div>
              <blockquote className="text-xl text-violet-900 text-center max-w-3xl mb-2 leading-relaxed">
                &ldquo;{review.quote}&rdquo;
              </blockquote>
              <cite className="text-lg font-medium text-gray-900 flex items-center gap-3">
                <Image
                  src={review.logo}
                  alt={review.person.split(',')[1].trim()}
                  width={100}
                  height={40}
                  className="object-contain h-10 w-auto grayscale hover:grayscale-0 transition-all duration-300"
                  priority
                />
                {review.person}
              </cite>
            </div>
          </div>
        </div>

        <div className="carousel-container relative">
          <style jsx global>{`
            .slick-track {
              display: flex !important;
              align-items: center;
            }
            .slick-slide {
              padding: 0 1rem;
              display: flex !important;
              justify-content: center;
            }
            .slick-list {
              overflow: hidden;
            }
          `}</style>
          <Slider {...settings}>
            {[...universityLogos, ...universityLogos].map((logo, index) => (
              <div key={index} className="carousel-slide">
                <div className="logo-container flex items-center justify-center h-28">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={150}
                    height={60}
                    className="logo-image object-contain max-h-24 w-auto grayscale hover:grayscale-0 transition-all duration-300"
                    priority={index < 6}
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

export default StudentReviews
