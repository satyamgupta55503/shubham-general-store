// "use client";
// import Layout from "@/components/layout/Layout";
// import data from "@/util/blog.json";
// import Link from "next/link";
// import { useParams } from "next/navigation";
// import { useEffect, useState } from "react";

// export default function BlogDetails() {
//   let Router = useParams();
//   const [blogPost, setBlogPost] = useState(null);
//   const id = Router.id;

//   useEffect(() => {
//     setBlogPost(data.find((data) => data.id == id));
//   }, [id]);

//   return (
//     <>
//       {blogPost && (
//         <Layout
//           headerStyle={1}
//           footerStyle={1}
//           headerCls="header-style-2 header-style-4"
//         >
//           <section className="section-box box-content-blog-2 box-content-blog-post">
//             <div className="container">
//               <div className="text-center blog-head">
//                 <span className="btn btn-brand-4-sm">Technology</span>
//                 <h2 className="heading-2 mb-20 mt-15">
//                   Hey Business Owners, Are You Invisible Online? Here's How to
//                   Rank #1 in Local Searches and Get More Customers!
//                 </h2>
//                 <p className="text-lg">
//                   Picture this: You’ve worked hard to set up your business,
//                   stocked your shop with quality products, and provided the best
//                   services. But here’s the reality check—your customers aren’t
//                   walking through your door anymore. Instead, they’re on their
//                   phones, searching for nearby businesses online. If your shop
//                   isn't showing up when they search, it’s like being invisible
//                   in a crowded market. So, what’s the solution? You need to rank
//                   higher in local searches—because that’s where your customers
//                   are looking!{" "}
//                 </p>
//               </div>
//               <div className="row">
//                 <div className="col-lg-1" />
//                 <div className="col-lg-10">
//                   <div className="box-content-detail-blog">
//                     <div className="box-image-header">
//                       <img
//                         alt="Nivia"
//                         src={`/assets/imgs/page/blog/${blogPost.img}`}
//                       />
//                     </div>
//                     <div className="box-detail-info">
//                       <h5>
//                         {" "}
//                         Why You’re Losing Customers Without Even Realizing It
//                       </h5>
//                       <p>
//                         Imagine a potential customer searching, “best grocery
//                         store near me” or “top fashion boutiques in Raipur.” If
//                         your business doesn’t appear in those top results,
//                         they’ll end up visiting your competitor—even if your
//                         shop is just a street away. Think of local search
//                         ranking as digital real estate. The higher you rank, the
//                         more foot traffic and calls your business will receive.
//                         No ranking? You’re losing money every single day. But
//                         don’t worry, you’re not alone. Many businesses are still
//                         unaware of the importance of local search optimization.
//                         Let’s break it down for you, and by the end of this
//                         article, you’ll be ready to dominate your local market!
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>
//           <section className="section-box box-content-recommended">
//             <div className="container">
//               <div className="text-center">
//                 <h2 className="mb-55">Recommended Articles</h2>
//               </div>
//               <div className="row">
//                 <div className="col-lg-4">
//                   <div className="card-news-style-2">
//                     <div className="card-image">
//                       {" "}
//                       <Link href="/blog-post">
//                         <img
//                           src="/assets/imgs/page/blog/detail.png"
//                           alt="Nivia"
//                         />
//                       </Link>
//                     </div>
//                     <div className="card-info">
//                       <div className="card-meta">
//                         {" "}
//                         <Link className="btn btn-tag-sm" href="/blog-post">
//                           Technology
//                         </Link>
//                         <span className="date-post">16 October 2023</span>
//                       </div>
//                       <div className="card-title">
//                         {" "}
//                         <Link className="link-new" href="/blog-post">
//                           Savvy brand marketing: from branding basics to key
//                           strategies
//                         </Link>
//                       </div>
//                       <div className="card-more">
//                         {" "}
//                         <Link className="btn btn-learmore-2" href="/blog-post">
//                           Read More
//                           <svg
//                             width={13}
//                             height={13}
//                             viewBox="0 0 13 13"
//                             fill="none"
//                             xmlns="http://www.w3.org/2000/svg"
//                           >
//                             <g clipPath="url(#clip0_599_4830)">
//                               <path
//                                 d="M10.6537 3.8149L1.71801 12.7506L0.25 11.2826L9.18469 2.3469H1.31V0.270508H12.7301V11.6906H10.6537V3.8149Z"
//                                 fill="true"
//                               />
//                             </g>
//                             <defs>
//                               <clipPath id="clip0_599_4830">
//                                 <rect width={13} height={13} fill="white" />
//                               </clipPath>
//                             </defs>
//                           </svg>
//                         </Link>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="col-lg-4">
//                   <div className="card-news-style-2">
//                     <div className="card-image">
//                       {" "}
//                       <Link href="/blog-post">
//                         <img
//                           src="/assets/imgs/page/blog/detail2.png"
//                           alt="Nivia"
//                         />
//                       </Link>
//                     </div>
//                     <div className="card-info">
//                       <div className="card-meta">
//                         {" "}
//                         <Link className="btn btn-tag-sm" href="/blog-post">
//                           Technology
//                         </Link>
//                         <span className="date-post">16 October 2023</span>
//                       </div>
//                       <div className="card-title">
//                         {" "}
//                         <Link className="link-new" href="/blog-post">
//                           110 drawing ideas to improve your skills you must know
//                           in this year
//                         </Link>
//                       </div>
//                       <div className="card-more">
//                         {" "}
//                         <Link className="btn btn-learmore-2" href="/blog-post">
//                           Read More
//                           <svg
//                             width={13}
//                             height={13}
//                             viewBox="0 0 13 13"
//                             fill="none"
//                             xmlns="http://www.w3.org/2000/svg"
//                           >
//                             <g clipPath="url(#clip0_599_4830)">
//                               <path
//                                 d="M10.6537 3.8149L1.71801 12.7506L0.25 11.2826L9.18469 2.3469H1.31V0.270508H12.7301V11.6906H10.6537V3.8149Z"
//                                 fill="true"
//                               />
//                             </g>
//                             <defs>
//                               <clipPath id="clip0_599_4830">
//                                 <rect width={13} height={13} fill="white" />
//                               </clipPath>
//                             </defs>
//                           </svg>
//                         </Link>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="col-lg-4">
//                   <div className="card-news-style-2">
//                     <div className="card-image">
//                       {" "}
//                       <Link href="/blog-post">
//                         <img
//                           src="/assets/imgs/page/blog/detail3.png"
//                           alt="Nivia"
//                         />
//                       </Link>
//                     </div>
//                     <div className="card-info">
//                       <div className="card-meta">
//                         {" "}
//                         <Link className="btn btn-tag-sm" href="/blog-post">
//                           Technology
//                         </Link>
//                         <span className="date-post">16 October 2023</span>
//                       </div>
//                       <div className="card-title">
//                         {" "}
//                         <Link className="link-new" href="/blog-post">
//                           Perfect product images with Generative AI in Nivia
//                           platform
//                         </Link>
//                       </div>
//                       <div className="card-more">
//                         {" "}
//                         <Link className="btn btn-learmore-2" href="/blog-post">
//                           Read More
//                           <svg
//                             width={13}
//                             height={13}
//                             viewBox="0 0 13 13"
//                             fill="none"
//                             xmlns="http://www.w3.org/2000/svg"
//                           >
//                             <g clipPath="url(#clip0_599_4830)">
//                               <path
//                                 d="M10.6537 3.8149L1.71801 12.7506L0.25 11.2826L9.18469 2.3469H1.31V0.270508H12.7301V11.6906H10.6537V3.8149Z"
//                                 fill="true"
//                               />
//                             </g>
//                             <defs>
//                               <clipPath id="clip0_599_4830">
//                                 <rect width={13} height={13} fill="white" />
//                               </clipPath>
//                             </defs>
//                           </svg>
//                         </Link>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>
//         </Layout>
//       )}
//     </>
//   );
// }


"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import axios from "axios";

export default function BlogDetails({ params }) {
  // Directly grab id from params (Compatible with Next.js 13/14 plain object structure)
  const id = params?.id;

  const [blogPost, setBlogPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    setMounted(true);

    const fetchPostDetails = async () => {
      // 1. Structural Check
      if (!id) {
        setLoading(false);
        return;
      }

      // 2. Trim hidden spaces or newlines that might cause 404s
      const cleanId = id.trim();

      // 3. Strict 24-character validation for standard MongoDB ObjectIds
      if (cleanId.length !== 24) {
        console.error(`Rejected invalid ID format: "${cleanId}" (Length: ${cleanId.length})`);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setApiError(null);
        
        const res = await axios.get(`https://backend.digikraftsocial.com/api/posts/${cleanId}`);
        setBlogPost(res.data);
      } catch (error) {
        console.error("Error fetching blog details:", error);
        setApiError(error.response?.status || 500);
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [id]);

  // Prevent Next.js Hydration Mismatch Errors
  if (!mounted) return null;

  // Loading State UI
  if (loading) {
    return (
      <Layout headerStyle={1} footerStyle={1}>
        <div className="text-center" style={{ padding: "100px 0" }}>
          <h3>Loading Post Details...</h3>
        </div>
      </Layout>
    );
  }

  // Error/Not Found State UI
  if (!blogPost || apiError === 404) {
    return (
      <Layout headerStyle={1} footerStyle={1}>
        <div className="text-center" style={{ padding: "100px 0" }}>
          <h3>Post Not Found!</h3>
          <p style={{ color: '#777', marginTop: '10px' }}>
            The requested Post ID <strong>"{id?.trim()}"</strong> does not exist in the database.
          </p>
          <Link href="/blog" className="btn btn-brand-4-sm mt-3">Back to Blog</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      headerStyle={1}
      footerStyle={1}
      headerCls="header-style-2 header-style-4"
    >
      <section className="section-box box-content-blog-2 box-content-blog-post">
        <div className="container">
          <div className="text-center blog-head">
            <span className="btn btn-brand-4-sm">
              {blogPost.category?.name || "Technology"}
            </span>
            
            <h2 className="heading-2 mb-20 mt-15">
              {blogPost.title}
            </h2>
            
            <p className="text-lg" style={{ color: "#777" }}>
              By {blogPost.author?.name || "Admin"} | {blogPost.createdAt ? new Date(blogPost.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : ""}
            </p>
          </div>

          <div className="row">
            <div className="col-lg-1" />
            <div className="col-lg-10">
              <div className="box-content-detail-blog">
                {blogPost.image && (
                  <div className="box-image-header" style={{ marginBottom: "30px" }}>
                    <img
                      alt={blogPost.title}
                      src={`https://backend.digikraftsocial.com/uploads/${blogPost.image}`}
                      style={{ width: "100%", maxHeight: "500px", objectFit: "cover", borderRadius: "16px" }}
                    />
                  </div>
                )}

                <div className="box-detail-info">
                  <p style={{ fontSize: "18px", lineHeight: "1.8", color: "#333", whiteSpace: "pre-line" }}>
                    {blogPost.content}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECOMMENDED ARTICLES SECTION */}
      <section className="section-box box-content-recommended">
        <div className="container">
          <div className="text-center">
            <h2 className="mb-55">Recommended Articles</h2>
          </div>
          <div className="row">
            <div className="col-lg-4">
              <div className="card-news-style-2">
                <div className="card-image">
                  <Link href="/blog">
                    <img src="/assets/imgs/page/blog/detail.png" alt="Recommended" />
                  </Link>
                </div>
                <div className="card-info">
                  <div className="card-meta">
                    <Link className="btn btn-tag-sm" href="/blog">Technology</Link>
                    <span className="date-post">16 October 2023</span>
                  </div>
                  <div className="card-title">
                    <Link className="link-new" href="/blog">
                      Savvy brand marketing: from branding basics to key strategies
                    </Link>
                  </div>
                  <div className="card-more">
                    <Link className="btn btn-learmore-2" href="/blog">
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}