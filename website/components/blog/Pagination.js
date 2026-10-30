
export default function Pagination({
    prev,
    currentPage,
    getPaginationGroup,
    next,
    pages,
    handleActive,
}) {
    return (
        <>

            <div className="text-center">
                <nav aria-label="Page navigation example">
                    <ul className="pagination">
                        {getPaginationGroup.length <= 0 ? null : (
                            <li onClick={prev} className="next_link page-item">
                                {currentPage === 1 ? null : (
                                    <a className="page-link" aria-label="Previous"><span aria-hidden="true">
                                        <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" fill="none">
                                            <path d="M10 3.33398L5.33333 8.00065L10 12.6673" stroke="#191919" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg></span></a>
                                )}
                            </li>
                        )}

                        {getPaginationGroup.map((item, index) => {
                            return (
                                <li
                                    onClick={() => handleActive(item)}
                                    key={index}
                                    className='page-item'
                                    
                                >
                                    <a className={
                                        currentPage === item
                                            ? "page-link active"
                                            : "page-link"
                                    }>{item}</a>
                                </li>
                            )
                        })}

                        {getPaginationGroup.length <= 0 ? null : (
                            <li onClick={next} className="next_link page-item">
                                {currentPage >= pages ? null : (
                                    <a className="page-link" aria-label="Next"><span aria-hidden="true">
                                        <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" fill="none">
                                            <path d="M6 3.33398L10.6667 8.00065L6 12.6673" stroke="#191919" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg></span></a>
                                )}
                            </li>
                        )}
                    </ul>
                </nav>
            </div>




        </>
    )
}