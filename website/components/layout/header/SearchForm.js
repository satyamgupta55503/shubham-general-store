import ClickOutside from '@/util/ClickOutside'
import Link from 'next/link'
import { useState } from 'react'

export default function SearchForm() {
    const [count, setCount] = useState(false)

    const handleClickOutside = () => {
        setCount(false)
    }

    const ref = ClickOutside(handleClickOutside)

    const handleClick = () => {
        setCount(!count)
    }
    return (
        <>
            <a className="btn btn-search hover-up" onClick={handleClick} />
            
            <div className="form-search p-20 dark" ref={ref} style={{ display: `${count ? "block" : "none"}` }}>
                <form action="#">
                    <input className="form-control" type="text" placeholder="Search" />
                    <input className="btn-search-2" type="submit" />
                </form>
                <div className="popular-keywords text-start mt-20">
                    <p className="mb-10 color-white">Popular search:</p><Link className="color-gray-600 mr-10 font-xs" href="#">Platform,</Link><Link className="color-gray-600 mr-10 font-xs" href="#"># Database,</Link><Link className="color-gray-600 mr-10 font-xs" href="#"># Price</Link>
                </div>
            </div>

        </>
    )
}
