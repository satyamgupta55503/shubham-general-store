
import Layout from "@/components/layout/Layout"
import Link from 'next/link'
export default function Help() {

    return (
        <>

            <Layout headerStyle={1} footerStyle={1} headerCls="header-style-2 header-style-4" >
                <section className="section-box box-how-help">
                    <div className="box-how-help-inner">
                        <div className="container">
                            <div className="text-center box-help-mw"><Link className="btn btn-brand-4-sm" href="#">Help Center</Link>
                                <h2 className="heading-2 mb-15 mt-15">How can we help you today?</h2>
                                <p className="text-lg neutral-500 mb-50">Lorem ipsum dolor sit amet, consectetur adipiscing elit lobortis arcu enim urna<br className="d-none d-lg-block" />adipiscing praesent velit viverra sit semper draconius.</p>
                                <div className="box-form-search">
                                    <form action="#">
                                        <input className="form-control" type="text" placeholder="What are you looking for?" />
                                        <button className="btn btn-black btn-rounded" type="submit">Search
                                            <svg width={20} height={20} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <g clipPath="url(#clip0_547_3620)">
                                                    <path d="M0.03125 8.4188C0.03125 10.6431 0.914833 12.7762 2.48762 14.349C4.06041 15.9218 6.19356 16.8054 8.41782 16.8054C10.2803 16.8077 12.0895 16.1837 13.5546 15.0337L18.1567 19.6463C18.2542 19.7446 18.3701 19.8226 18.4979 19.8758C18.6256 19.929 18.7626 19.9564 18.901 19.9564C19.0394 19.9564 19.1764 19.929 19.3042 19.8758C19.4319 19.8226 19.5479 19.7446 19.6453 19.6463C19.7436 19.5489 19.8216 19.4329 19.8748 19.3052C19.928 19.1774 19.9554 19.0404 19.9554 18.902C19.9554 18.7636 19.928 18.6266 19.8748 18.4988C19.8216 18.3711 19.7436 18.2552 19.6453 18.1577L15.0327 13.5556C16.1827 12.0905 16.8067 10.2813 16.8044 8.4188C16.8044 6.19454 15.9208 4.06138 14.348 2.4886C12.7752 0.915809 10.6421 0.0322266 8.41782 0.0322266C6.19356 0.0322266 4.06041 0.915809 2.48762 2.4886C0.914833 4.06138 0.03125 6.19454 0.03125 8.4188ZM8.41782 2.12887C9.66185 2.12887 10.8779 2.49777 11.9123 3.18891C12.9467 3.88006 13.7529 4.86241 14.229 6.01174C14.705 7.16108 14.8296 8.42577 14.5869 9.6459C14.3442 10.866 13.7451 11.9868 12.8655 12.8664C11.9858 13.7461 10.865 14.3452 9.64492 14.5879C8.4248 14.8306 7.1601 14.706 6.01077 14.2299C4.86143 13.7539 3.87908 12.9477 3.18794 11.9133C2.49679 10.8789 2.12789 9.66283 2.12789 8.4188C2.12789 6.7506 2.79058 5.15074 3.97017 3.97115C5.14976 2.79156 6.74963 2.12887 8.41782 2.12887Z" fill="white" />
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_547_3620">
                                                        <rect width={20} height={20} fill="white" />
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="section-box box-category-question">
                    <div className="container">
                        <div className="text-center box-help-mw">
                            <h2 className="heading-2 mb-15 mt-15">Browse questions by category</h2>
                            <p className="text-lg neutral-500 mb-50">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla mollis est <br className="d-none d-lg-block" />id faucibus iaculis. Cras et congue tortor. Integer laoreet.</p>
                        </div>
                        <div className="row">
                            <div className="col-lg-4 col-md-6">
                                <div className="card-question">
                                    <div className="card-image"> <img src="/assets/imgs/page/help/bill.png" alt="Nivia" /></div>
                                    <div className="card-info">
                                        <h5>Billing and Payments</h5>
                                        <div className="meta-post"> <span className="text-sm topic">32 topics </span><span className="text-sm article">168 articles </span></div>
                                        <p className="text-md neutral-600">Suspendisse vestibulum vitae enim a porta. Etiam pulvinar risus vitae turpis sagittis, sit amet placerat ipsum euismod. Morbi semper velit risus, ut convallis tortor bibendum vel. Morbi enim ex, elementum nec elit vel, gravida commodo augue.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6">
                                <div className="card-question bg-1">
                                    <div className="card-image"> <img src="/assets/imgs/page/help/trouble.png" alt="Nivia" /></div>
                                    <div className="card-info">
                                        <h5>Troubleshooting</h5>
                                        <div className="meta-post"> <span className="text-sm topic">32 topics </span><span className="text-sm article">168 articles </span></div>
                                        <p className="text-md neutral-600">Suspendisse vestibulum vitae enim a porta. Etiam pulvinar risus vitae turpis sagittis, sit amet placerat ipsum euismod. Morbi semper velit risus, ut convallis tortor bibendum vel. Morbi enim ex, elementum nec elit vel, gravida commodo augue.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6">
                                <div className="card-question bg-2">
                                    <div className="card-image"> <img src="/assets/imgs/page/help/integration.png" alt="Nivia" /></div>
                                    <div className="card-info">
                                        <h5>Integrations</h5>
                                        <div className="meta-post"> <span className="text-sm topic">32 topics </span><span className="text-sm article">168 articles </span></div>
                                        <p className="text-md neutral-600">Suspendisse vestibulum vitae enim a porta. Etiam pulvinar risus vitae turpis sagittis, sit amet placerat ipsum euismod. Morbi semper velit risus, ut convallis tortor bibendum vel. Morbi enim ex, elementum nec elit vel, gravida commodo augue.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6">
                                <div className="card-question bg-3">
                                    <div className="card-image"> <img src="/assets/imgs/page/help/started.png" alt="Nivia" /></div>
                                    <div className="card-info">
                                        <h5>Getting Started</h5>
                                        <div className="meta-post"> <span className="text-sm topic">32 topics </span><span className="text-sm article">168 articles </span></div>
                                        <p className="text-md neutral-600">Suspendisse vestibulum vitae enim a porta. Etiam pulvinar risus vitae turpis sagittis, sit amet placerat ipsum euismod. Morbi semper velit risus, ut convallis tortor bibendum vel. Morbi enim ex, elementum nec elit vel, gravida commodo augue.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6">
                                <div className="card-question bg-4">
                                    <div className="card-image"> <img src="/assets/imgs/page/help/account.png" alt="Nivia" /></div>
                                    <div className="card-info">
                                        <h5>Account Settings</h5>
                                        <div className="meta-post"> <span className="text-sm topic">32 topics </span><span className="text-sm article">168 articles </span></div>
                                        <p className="text-md neutral-600">Suspendisse vestibulum vitae enim a porta. Etiam pulvinar risus vitae turpis sagittis, sit amet placerat ipsum euismod. Morbi semper velit risus, ut convallis tortor bibendum vel. Morbi enim ex, elementum nec elit vel, gravida commodo augue.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6">
                                <div className="card-question bg-5">
                                    <div className="card-image"> <img src="/assets/imgs/page/help/advance.png" alt="Nivia" /></div>
                                    <div className="card-info">
                                        <h5>Advanced analytics</h5>
                                        <div className="meta-post"> <span className="text-sm topic">32 topics </span><span className="text-sm article">168 articles </span></div>
                                        <p className="text-md neutral-600">Suspendisse vestibulum vitae enim a porta. Etiam pulvinar risus vitae turpis sagittis, sit amet placerat ipsum euismod. Morbi semper velit risus, ut convallis tortor bibendum vel. Morbi enim ex, elementum nec elit vel, gravida commodo augue.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6">
                                <div className="card-question bg-2">
                                    <div className="card-image"> <img src="/assets/imgs/page/help/started.png" alt="Nivia" /></div>
                                    <div className="card-info">
                                        <h5>Networking</h5>
                                        <div className="meta-post"> <span className="text-sm topic">32 topics </span><span className="text-sm article">168 articles </span></div>
                                        <p className="text-md neutral-600">Suspendisse vestibulum vitae enim a porta. Etiam pulvinar risus vitae turpis sagittis, sit amet placerat ipsum euismod. Morbi semper velit risus, ut convallis tortor bibendum vel. Morbi enim ex, elementum nec elit vel, gravida commodo augue.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6">
                                <div className="card-question bg-6">
                                    <div className="card-image"> <img src="/assets/imgs/page/help/account.png" alt="Nivia" /></div>
                                    <div className="card-info">
                                        <h5>Career</h5>
                                        <div className="meta-post"> <span className="text-sm topic">32 topics </span><span className="text-sm article">168 articles </span></div>
                                        <p className="text-md neutral-600">Suspendisse vestibulum vitae enim a porta. Etiam pulvinar risus vitae turpis sagittis, sit amet placerat ipsum euismod. Morbi semper velit risus, ut convallis tortor bibendum vel. Morbi enim ex, elementum nec elit vel, gravida commodo augue.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6">
                                <div className="card-question bg-3">
                                    <div className="card-image"> <img src="/assets/imgs/page/help/advance.png" alt="Nivia" /></div>
                                    <div className="card-info">
                                        <h5>Other help</h5>
                                        <div className="meta-post"> <span className="text-sm topic">32 topics </span><span className="text-sm article">168 articles </span></div>
                                        <p className="text-md neutral-600">Suspendisse vestibulum vitae enim a porta. Etiam pulvinar risus vitae turpis sagittis, sit amet placerat ipsum euismod. Morbi semper velit risus, ut convallis tortor bibendum vel. Morbi enim ex, elementum nec elit vel, gravida commodo augue.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="section-box box-faqs-question">
                    <div className="container">
                        <div className="box-list-prices">
                            <div className="text-center"> <Link className="btn btn-brand-4-sm" href="#">Pricing Plan</Link>
                                <h2 className="mb-45 mt-15">Need Any Help ?<br className="d-none d-lg-block" /> Read Popular Questions</h2>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="card-faq card-faq-black">
                                        <div className="item-title">
                                            <h6>
                                                <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 18 18" fill="none">
                                                    <g clipPath="url(#clip0_51_1478)">
                                                        <path d="M9 0C4.02571 0 0 4.02525 0 9C0 13.9742 4.02525 18 9 18C13.9743 18 18 13.9747 18 9C18 4.02571 13.9747 0 9 0ZM9 16.7442C4.72985 16.7442 1.25582 13.2702 1.25582 9C1.25582 4.72982 4.72985 1.25582 9 1.25582C13.2702 1.25582 16.7442 4.72982 16.7442 9C16.7442 13.2702 13.2702 16.7442 9 16.7442Z" fill="true" />
                                                        <path d="M8.73434 11.3887C8.23677 11.3887 7.83398 11.8033 7.83398 12.3008C7.83398 12.7866 8.22492 13.2131 8.73434 13.2131C9.24375 13.2131 9.6465 12.7866 9.6465 12.3008C9.6465 11.8033 9.23187 11.3887 8.73434 11.3887Z" fill="true" />
                                                        <path d="M8.8885 4.48047C7.28917 4.48047 6.55469 5.42825 6.55469 6.06795C6.55469 6.52997 6.94563 6.74323 7.26548 6.74323C7.90521 6.74323 7.6446 5.831 8.85296 5.831C9.44527 5.831 9.91918 6.09164 9.91918 6.6366C9.91918 7.2763 9.25574 7.64355 8.8648 7.97525C8.52122 8.27137 8.07108 8.75712 8.07108 9.77595C8.07108 10.392 8.23695 10.5697 8.72263 10.5697C9.3031 10.5697 9.42157 10.3091 9.42157 10.0839C9.42157 9.46791 9.43342 9.11252 10.085 8.6031C10.4049 8.35434 11.4118 7.54873 11.4118 6.43516C11.4118 5.32158 10.4049 4.48047 8.8885 4.48047Z" fill="true" />
                                                    </g>
                                                    <defs>
                                                        <clipPath id="clip0_51_1478">
                                                            <rect width={18} height={18} fill="white" />
                                                        </clipPath>
                                                    </defs>
                                                </svg>How do I purchase an item?
                                            </h6>
                                        </div>
                                        <div className="item-info">
                                            <p className="text-md">With it profitable sure wrong continued in the queen's perhaps and simple fat denied adding worthy little use as some he so high down am week conduct esteems by cottage to pasture.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="col-md-6"> </div>
                                    <div className="card-faq card-faq-black">
                                        <div className="item-title">
                                            <h6>
                                                <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 18 18" fill="none">
                                                    <g clipPath="url(#clip0_51_1478)">
                                                        <path d="M9 0C4.02571 0 0 4.02525 0 9C0 13.9742 4.02525 18 9 18C13.9743 18 18 13.9747 18 9C18 4.02571 13.9747 0 9 0ZM9 16.7442C4.72985 16.7442 1.25582 13.2702 1.25582 9C1.25582 4.72982 4.72985 1.25582 9 1.25582C13.2702 1.25582 16.7442 4.72982 16.7442 9C16.7442 13.2702 13.2702 16.7442 9 16.7442Z" fill="true" />
                                                        <path d="M8.73434 11.3887C8.23677 11.3887 7.83398 11.8033 7.83398 12.3008C7.83398 12.7866 8.22492 13.2131 8.73434 13.2131C9.24375 13.2131 9.6465 12.7866 9.6465 12.3008C9.6465 11.8033 9.23187 11.3887 8.73434 11.3887Z" fill="true" />
                                                        <path d="M8.8885 4.48047C7.28917 4.48047 6.55469 5.42825 6.55469 6.06795C6.55469 6.52997 6.94563 6.74323 7.26548 6.74323C7.90521 6.74323 7.6446 5.831 8.85296 5.831C9.44527 5.831 9.91918 6.09164 9.91918 6.6366C9.91918 7.2763 9.25574 7.64355 8.8648 7.97525C8.52122 8.27137 8.07108 8.75712 8.07108 9.77595C8.07108 10.392 8.23695 10.5697 8.72263 10.5697C9.3031 10.5697 9.42157 10.3091 9.42157 10.0839C9.42157 9.46791 9.43342 9.11252 10.085 8.6031C10.4049 8.35434 11.4118 7.54873 11.4118 6.43516C11.4118 5.32158 10.4049 4.48047 8.8885 4.48047Z" fill="true" />
                                                    </g>
                                                    <defs>
                                                        <clipPath id="clip0_51_1478">
                                                            <rect width={18} height={18} fill="white" />
                                                        </clipPath>
                                                    </defs>
                                                </svg>Does Nivia share my information with others?
                                            </h6>
                                        </div>
                                        <div className="item-info">
                                            <p className="text-md"> Comfort reached gay perhaps chamber his six detract besides add. Moonlight newspaper. the queen's perhaps and simple fat denied adding worthy little use as some he so high</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="col-md-6"> </div>
                                    <div className="card-faq card-faq-black">
                                        <div className="item-title">
                                            <h6>
                                                <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 18 18" fill="none">
                                                    <g clipPath="url(#clip0_51_1478)">
                                                        <path d="M9 0C4.02571 0 0 4.02525 0 9C0 13.9742 4.02525 18 9 18C13.9743 18 18 13.9747 18 9C18 4.02571 13.9747 0 9 0ZM9 16.7442C4.72985 16.7442 1.25582 13.2702 1.25582 9C1.25582 4.72982 4.72985 1.25582 9 1.25582C13.2702 1.25582 16.7442 4.72982 16.7442 9C16.7442 13.2702 13.2702 16.7442 9 16.7442Z" fill="true" />
                                                        <path d="M8.73434 11.3887C8.23677 11.3887 7.83398 11.8033 7.83398 12.3008C7.83398 12.7866 8.22492 13.2131 8.73434 13.2131C9.24375 13.2131 9.6465 12.7866 9.6465 12.3008C9.6465 11.8033 9.23187 11.3887 8.73434 11.3887Z" fill="true" />
                                                        <path d="M8.8885 4.48047C7.28917 4.48047 6.55469 5.42825 6.55469 6.06795C6.55469 6.52997 6.94563 6.74323 7.26548 6.74323C7.90521 6.74323 7.6446 5.831 8.85296 5.831C9.44527 5.831 9.91918 6.09164 9.91918 6.6366C9.91918 7.2763 9.25574 7.64355 8.8648 7.97525C8.52122 8.27137 8.07108 8.75712 8.07108 9.77595C8.07108 10.392 8.23695 10.5697 8.72263 10.5697C9.3031 10.5697 9.42157 10.3091 9.42157 10.0839C9.42157 9.46791 9.43342 9.11252 10.085 8.6031C10.4049 8.35434 11.4118 7.54873 11.4118 6.43516C11.4118 5.32158 10.4049 4.48047 8.8885 4.48047Z" fill="true" />
                                                    </g>
                                                    <defs>
                                                        <clipPath id="clip0_51_1478">
                                                            <rect width={18} height={18} fill="white" />
                                                        </clipPath>
                                                    </defs>
                                                </svg>How do I arrange a replacement item?
                                            </h6>
                                        </div>
                                        <div className="item-info">
                                            <p className="text-md">With it profitable sure wrong continued in the queen's perhaps and simple fat denied adding worthy little use as some he so high down am week conduct esteems by cottage to pasture.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="col-md-6"> </div>
                                    <div className="card-faq card-faq-black">
                                        <div className="item-title">
                                            <h6>
                                                <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 18 18" fill="none">
                                                    <g clipPath="url(#clip0_51_1478)">
                                                        <path d="M9 0C4.02571 0 0 4.02525 0 9C0 13.9742 4.02525 18 9 18C13.9743 18 18 13.9747 18 9C18 4.02571 13.9747 0 9 0ZM9 16.7442C4.72985 16.7442 1.25582 13.2702 1.25582 9C1.25582 4.72982 4.72985 1.25582 9 1.25582C13.2702 1.25582 16.7442 4.72982 16.7442 9C16.7442 13.2702 13.2702 16.7442 9 16.7442Z" fill="true" />
                                                        <path d="M8.73434 11.3887C8.23677 11.3887 7.83398 11.8033 7.83398 12.3008C7.83398 12.7866 8.22492 13.2131 8.73434 13.2131C9.24375 13.2131 9.6465 12.7866 9.6465 12.3008C9.6465 11.8033 9.23187 11.3887 8.73434 11.3887Z" fill="true" />
                                                        <path d="M8.8885 4.48047C7.28917 4.48047 6.55469 5.42825 6.55469 6.06795C6.55469 6.52997 6.94563 6.74323 7.26548 6.74323C7.90521 6.74323 7.6446 5.831 8.85296 5.831C9.44527 5.831 9.91918 6.09164 9.91918 6.6366C9.91918 7.2763 9.25574 7.64355 8.8648 7.97525C8.52122 8.27137 8.07108 8.75712 8.07108 9.77595C8.07108 10.392 8.23695 10.5697 8.72263 10.5697C9.3031 10.5697 9.42157 10.3091 9.42157 10.0839C9.42157 9.46791 9.43342 9.11252 10.085 8.6031C10.4049 8.35434 11.4118 7.54873 11.4118 6.43516C11.4118 5.32158 10.4049 4.48047 8.8885 4.48047Z" fill="true" />
                                                    </g>
                                                    <defs>
                                                        <clipPath id="clip0_51_1478">
                                                            <rect width={18} height={18} fill="white" />
                                                        </clipPath>
                                                    </defs>
                                                </svg>What kind of financial advice do you give?
                                            </h6>
                                        </div>
                                        <div className="item-info">
                                            <p className="text-md"> Comfort reached gay perhaps chamber his six detract besides add. Moonlight newspaper. the queen's perhaps and simple fat denied adding worthy little use as some he so high</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="section-box wow animate__animated animate__fadeIn box-more-question">
                    <div className="container">
                        <div className="block-more-question">
                            <div className="question-left">
                                <h3 className="mb-10">Have more questions</h3>
                                <p className="text-lg mb-20">If you still can’t find the answer you’re looking for, let we help you.</p><Link className="btn btn-brand-4" href="#">Go to Support Center
                                    <svg width={23} height={22} viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clipPath="url(#clip0_449_3780)">
                                            <path d="M22.5 10.9993L18.9791 7.47852V10.3064H0.5V11.6924H18.9791V14.5203L22.5 10.9993Z" fill="#191919" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_449_3780">
                                                <rect width={22} height={22} fill="white" transform="translate(0.5)" />
                                            </clipPath>
                                        </defs>
                                    </svg></Link>
                            </div>
                            <div className="question-right"><img src="/assets/imgs/page/homepage4/bg-question.png" alt="Nivia" /></div>
                        </div>
                    </div>
                </section>
                <div className="mb-100" />
            </Layout>
        </>
    )
}