'use client'
import { useEffect } from 'react'

const ResizeComingSoon = () => {
    useEffect(() => {
        const handleResize = () => {
            const container = document.querySelector(".container")
            const offsetLeft = container.offsetLeft
            document.querySelector(".box-comming-soon-banner").style.paddingLeft = `${offsetLeft}px`
        }

        // Add resize event listener
        window.addEventListener('resize', handleResize)

        // Call the function when the component mounts
        handleResize()

        // Cleanup function to remove event listener when the component unmounts
        return () => {
            window.removeEventListener('resize', handleResize)
            // Additional cleanup code if necessary
        }
    }, [])
}

export default ResizeComingSoon