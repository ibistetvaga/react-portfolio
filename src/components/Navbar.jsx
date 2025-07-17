import React from 'react'
import logo from '../assets/kevinRushLogo.png'
import { FaLinkedin } from 'react-icons/fa'
import { FaGithub } from 'react-icons/fa'
import { FaSquareXTwitter } from 'react-icons/fa6'
import { FaInstagram } from 'react-icons/fa'
import LanguageToggle from './LanguageToggle'


const Navbar = () => {
  return (
    <nav className='mb-20 flex items-center justify-between py-6'>
      <div className='flex flex-shrink-0 items-center'>
        <img className='mx-2 w-10' src={logo} alt="logo" />
      </div>
      
      {/* Center section with language toggle for larger screens */}
      <div className='hidden md:flex items-center'>
        <LanguageToggle />
      </div>
      
      <div className='m-8 flex items-center justify-center gap-4 text-2xl'>
        {/* Language toggle for mobile - positioned before social icons */}
        <div className='md:hidden mr-4'>
          <LanguageToggle />
        </div>
        <FaLinkedin/>
        <FaGithub/>
        <FaSquareXTwitter/>
        <FaInstagram/>
      </div>
    </nav>
  )
}

export default Navbar