import React from 'react'
import { Button } from './ui/button'

const Navbar = () => {
  return (
    <nav className='border-b mx-10'>

    <div className=' max-w-6xl mx-auto p-8 flex items-center justify-between'>
        <h1 className='text-3xl'>Upscaler.tt</h1>

        <Button>Github</Button>
    </div>
    </nav>
  )
}

export default Navbar