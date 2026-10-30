
import Layout from "@/components/layout/Layout"
import Link from 'next/link'
export default function ForgetPassword() {

    return (
        <>

            <Layout headerStyle={1} footerStyle={1} headerCls="header-style-2 header-style-4" >
                <section className="section-box box-content-login box-content-forget">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-6">
                                <div className="box-form-register">
                                    <h3 className="title-register">Forgot password?</h3>
                                    <p className="text-md neutral-700">No worries, we’ll send you reset instruction</p>
                                    <form className="form-register" action="#">
                                        <div className="form-group">
                                            <label>Your Email <span className="brand-1">*</span></label>
                                            <input className="form-control" type="text" placeholder="email@website.com" />
                                        </div>
                                        <div className="form-group">
                                            <button className="btn btn-black btn-rounded">Reset password
                                                <svg xmlns="http://www.w3.org/2000/svg" width={23} height={8} viewBox="0 0 23 8" fill="none">
                                                    <path d="M22.5 4.00032L18.9791 0.479492V3.3074H0.5V4.69333H18.9791V7.52129L22.5 4.00032Z" fill="true" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="other-login mt-45">
                                            <p className="text-lg neutral-500">Back to <Link className="brand-1-1" href="/login">Login Page</Link></p>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="box-image-banner-login"> <img src="/assets/imgs/page/forget/banner.png" alt="Nivia" /></div>
                            </div>
                        </div>
                    </div>
                </section>

            </Layout>
        </>
    )
}