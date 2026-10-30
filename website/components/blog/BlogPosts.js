// // components/blog/BlogPost.jsx
// import Link from "next/link";

// export default function BlogPosts({ posts = [], showItem = 6 }) {
//   return (
//     <>
//       {posts.slice(0, showItem).map((post) => (
//         <div className="col-lg-4 col-md-6 mb-4" key={post.id}>
//           <div className="blog-card">
//             <h4 className="mb-2">{post.title}</h4>
//             <p className="text-sm">
//               {post.sections[0]?.content || post.sections[0]?.points?.[0]}
//             </p>
//             <Link href={`/blog/${post.id}`}>
//               <span className="btn btn-brand-4-sm mt-2">Read More</span>
//             </Link>
//           </div>
//         </div>
//       ))}
//     </>
//   );
// }


// components/blog/BlogPosts.jsx
import Link from "next/link";

export default function BlogPosts({ posts = [], showItem = 6 }) {
  return (
    <>
      {posts.slice(0, showItem).map((post) => (
        <div className="col-lg-4 col-md-6 mb-4" key={post._id}>
          <div className="blog-card" style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            
            {/* Post Image */}
            {post.image && (
              <div className="blog-img mb-3">
                <img 
                  src={`https://backend.digikraftsocial.com/uploads/${post.image}`} 
                  alt={post.title} 
                  style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }}
                />
              </div>
            )}

            <h4 className="mb-2">{post.title}</h4>
            
            {/* Post Content Summary */}
            <p className="text-sm">
              {post.content && post.content.length > 120
                ? `${post.content.slice(0, 120)}...`
                : post.content || "No description available."}
            </p>
            
            {/* FIXED: Passing post._id instead of slug to avoid 404 Error */}
            <div className="mt-auto">
              <Link href={`/blog/${post._id}`}>
                <span className="btn btn-brand-4-sm mt-2">Read More</span>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}