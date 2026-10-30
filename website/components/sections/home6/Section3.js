
import VideoPopup from '@/components/elements/VideoPopup'
import Link from 'next/link'

export default function Section3() {
    return (
        <>

            <section className="section-box wow animate__animated animate__fadeIn box-case-study">
                <div className="container">
                    <div className="text-center">
                        <h2 className="display-2 mb-70">Real-Time collaboration,<br className="d-none d-lg-block" /> wherever you are
                            right now</h2>
                    </div>
                    <div className="block-case-study">
                        <div className="row align-items-center">
                            <div className="col-lg-7 mb-30"><Link className="btn btn-border-linear-2 mb-35" href="#"><span>Case
                                Study</span></Link>
                                <h2 className="heading-1 text-linear-3 mb-35">Build The Perfect Workflow For Every Projects.
                                </h2>
                                <p className="text-lg neutral-0 mb-40">Track your entire project from start to finish with
                                    beautiful views that make project planning a breeze manage your resources in a list box,
                                    Gantt, board or create your own workflow with customizable views.</p>
                                <div className="box-buttons"><Link className="btn btn-green-linear mr-15" href="#">Subscribe
                                    <svg width={22} height={22} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22 11.0003L18.4791 7.47949V10.3074H0V11.6933H18.4791V14.5213L22 11.0003Z" fill="true" />
                                    </svg></Link>
                                    <VideoPopup />
                                </div>
                            </div>
                            <div className="col-lg-5 mb-30">
                                <div className="box-case-gradient">
                                    <div className="box-case-gradient-inner" />
                                    <div className="box-case-gradient-bottom"><img src="/assets/imgs/page/homepage5/img-case.png" alt="Nivia" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
