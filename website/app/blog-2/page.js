import BlogPost from "@/components/blog/BlogPost";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
export default function Blog2() {
  return (
    <>
      <Layout
        headerStyle={1}
        footerStyle={1}
        headerCls="header-style-2 header-style-4"
      >
        <section className="section-box box-content-blog-2">
          <div className="container">
            <div className="text-center blog-head">
              <span className="icon-1 shape-1" />
              <span className="icon-2 shape-2" />
              <span className="icon-3 shape-3" />
              <span className="btn btn-brand-4-sm">Our Inside</span>
              <h2 className="heading-2 mb-20 mt-15">Blog Resources</h2>
              <p className="text-lg">
                Explore our blog and resources for valuable insights, expert
                opinions, and up-to-
                <br className="d-none d-lg-block" />
                date information on the latest trends in the industry.
              </p>
            </div>
            <div className="row content-blog-2 mt-100">
              <div className="col-lg-9">
                <div className="box-list-news-2">
                  <div className="row">
                    <BlogPost showItem={6} style={2} showPagination />
                  </div>
                </div>
              </div>
              <div className="col-lg-3">
                <div className="sidebar">
                  <div className="sidebar-right sidebar-search">
                    <div className="form-search">
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Search..."
                      />
                      <button className="btn btn-search-black" />
                    </div>
                  </div>
                  <div className="sidebar-right sidebar-text">
                    <h5 className="mb-15">About Us</h5>
                    <p className="text-md neutral-500">
                      Praesent commodo cursus magna, vel scelerisque nisl
                      consectetur et. Sed posuere consectetur est at lobortis.
                      Cras mattis consectetur purus sit amet fermentum. Fusce
                      dapibus, tellus ac cursus commodo, tortor mauris
                      condimentum nibh. Cras mattis consectetur purus.
                    </p>
                    <div className="box-socials-commingsoon mt-15">
                      {" "}
                      <Link className="icon-socials icon-facebook" href="#">
                        <img
                          alt="Nivia"
                          src="/assets/imgs/template/icons/fb.svg"
                        />
                      </Link>
                      <Link className="icon-socials icon-instagram" href="#">
                        <img
                          alt="Nivia"
                          src="/assets/imgs/template/icons/in.svg"
                        />
                      </Link>
                      <Link className="icon-socials icon-twitter" href="#">
                        <img
                          alt="Nivia"
                          src="/assets/imgs/template/icons/tw.svg"
                        />
                      </Link>
                      <Link className="icon-socials icon-be" href="#">
                        <img
                          alt="Nivia"
                          src="/assets/imgs/template/icons/be.svg"
                        />
                      </Link>
                    </div>
                  </div>
                  <div className="sidebar-right sidebar-posts">
                    <h5 className="mb-15">Popular Posts</h5>
                    <ul className="list-popular-posts">
                      <li>
                        <div className="card-post">
                          <div className="card-image">
                            {" "}
                            <img
                              alt="Nivia"
                              src="/assets/imgs/page/blog/post.png"
                            />
                          </div>
                          <div className="card-info">
                            {" "}
                            <Link href="#">
                              <h6 className="text-18-semibold">
                                25 easy step-by-step tutorials to make cool
                                drawings
                              </h6>
                            </Link>
                            <span className="date-post">16 October 2023</span>
                          </div>
                        </div>
                      </li>
                      <li>
                        <div className="card-post">
                          <div className="card-image">
                            {" "}
                            <img
                              alt="Nivia"
                              src="/assets/imgs/page/blog/post2.png"
                            />
                          </div>
                          <div className="card-info">
                            {" "}
                            <Link href="#">
                              <h6 className="text-18-semibold">
                                25 easy step-by-step tutorials to make cool
                                drawings
                              </h6>
                            </Link>
                            <span className="date-post">16 October 2023</span>
                          </div>
                        </div>
                      </li>
                      <li>
                        <div className="card-post">
                          <div className="card-image">
                            {" "}
                            <img
                              alt="Nivia"
                              src="/assets/imgs/page/blog/post3.png"
                            />
                          </div>
                          <div className="card-info">
                            {" "}
                            <Link href="#">
                              <h6 className="text-18-semibold">
                                25 easy step-by-step tutorials to make cool
                                drawings
                              </h6>
                            </Link>
                            <span className="date-post">16 October 2023</span>
                          </div>
                        </div>
                      </li>
                      <li>
                        <div className="card-post">
                          <div className="card-image">
                            {" "}
                            <img
                              alt="Nivia"
                              src="/assets/imgs/page/blog/post4.png"
                            />
                          </div>
                          <div className="card-info">
                            {" "}
                            <Link href="#">
                              <h6 className="text-18-semibold">
                                25 easy step-by-step tutorials to make cool
                                drawings
                              </h6>
                            </Link>
                            <span className="date-post">16 October 2023</span>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="sidebar-right sidebar-posts">
                    <h5 className="mb-15">Categories </h5>
                    <ul className="list-categories">
                      <li>
                        {" "}
                        <Link href="#">Teamwork (21)</Link>
                      </li>
                      <li>
                        {" "}
                        <Link href="#">Ideas (19)</Link>
                      </li>
                      <li>
                        {" "}
                        <Link href="#">Workspace (16)</Link>
                      </li>
                      <li>
                        {" "}
                        <Link href="#">Coding (7)</Link>
                      </li>
                      <li>
                        {" "}
                        <Link href="#">Meeting (12)</Link>
                      </li>
                      <li>
                        {" "}
                        <Link href="#">Business Tips (14)</Link>
                      </li>
                    </ul>
                  </div>
                  <div className="sidebar-right sidebar-posts">
                    <h5 className="mb-15">Tags </h5>
                    <div className="box-tags-sidebar">
                      {" "}
                      <Link className="btn btn-neutral-100" href="#">
                        Technology
                      </Link>
                      <Link className="btn btn-neutral-100" href="#">
                        Still Life
                      </Link>
                      <Link className="btn btn-neutral-100" href="#">
                        Nature
                      </Link>
                      <Link className="btn btn-neutral-100" href="#">
                        Blog
                      </Link>
                      <Link className="btn btn-neutral-100" href="#">
                        Photography
                      </Link>
                      <Link className="btn btn-neutral-100" href="#">
                        Workshop
                      </Link>
                      <Link className="btn btn-neutral-100" href="#">
                        Business Day
                      </Link>
                      <Link className="btn btn-neutral-100" href="#">
                        Urban
                      </Link>
                      <Link className="btn btn-neutral-100" href="#">
                        Macro
                      </Link>
                      <Link className="btn btn-neutral-100" href="#">
                        Landscape
                      </Link>
                    </div>
                  </div>
                  <div className="sidebar-right sidebar-posts">
                    <h5 className="mb-15">Categories </h5>
                    <ul className="list-categories">
                      <li>
                        {" "}
                        <Link href="#">Teamwork (21)</Link>
                      </li>
                      <li>
                        {" "}
                        <Link href="#">Ideas (19)</Link>
                      </li>
                      <li>
                        {" "}
                        <Link href="#">Workspace (16)</Link>
                      </li>
                      <li>
                        {" "}
                        <Link href="#">Coding (7)</Link>
                      </li>
                      <li>
                        {" "}
                        <Link href="#">Meeting (12)</Link>
                      </li>
                      <li>
                        {" "}
                        <Link href="#">Business Tips (14)</Link>
                      </li>
                    </ul>
                  </div>
                  <div className="box-sidebar-normal">
                    <Link href="#">
                      <img src="/assets/imgs/page/job/ads.png" alt="Nivia" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
