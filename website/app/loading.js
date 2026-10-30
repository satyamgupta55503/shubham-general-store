import Loader from "@/components/elements/Loader";
import Preloader from "@/components/elements/Preloader";

export default function loading() {
  return (
    <>
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#000",
        }}
      >
        <Loader />
      </div>
    </>
  );
}
