import Layout from "@/components/layout/Layout"
import Link from 'next/link'
export default function Error() {

    return (
        <>

            <Layout headerStyle={1} footerStyle={1} headerCls="header-style-2 header-style-4" >
                <section className="section-box wow animate__animated animate__fadeIn box-404">
                    <div className="text-center"><img src="/assets/imgs/page/404/404.png" alt="Nivia" />
                        <h2 className="heading-2 mt-15 mb-20">Page Not Found</h2>
                        <p className="text-lg neutral-500 mb-35">The page you are looking for doesn't exist or has been moved</p><Link className="btn btn-brand-4" href="/">Back to Home Page
                            <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 22 22" fill="none">
                                <path d="M22 10.9993L18.4791 7.47852V10.3064H0V11.6924H18.4791V14.5203L22 10.9993Z" fill="true">
                                </path>
                            </svg></Link>
                    </div>
                </section>

            </Layout>
        </>
    )
}