'use client'
import { useEffect } from 'react'

const ResizeContainer = () => {
    useEffect(() => {
        const handleResize = () => {
            const pdLeft = document.querySelector(".padding-left-auto")
            const pdRight = document.querySelector(".padding-right-auto")
            const container = document.querySelector(".container")
            const offsetLeft = container.offsetLeft

            pdLeft.style.paddingLeft = `${offsetLeft}px`
            pdRight.style.paddingRight = `${offsetLeft}px`
            // document.querySelector(".box-comming-soon-banner").style.paddingLeft = `${offsetLeft}px`
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

export default ResizeContainer