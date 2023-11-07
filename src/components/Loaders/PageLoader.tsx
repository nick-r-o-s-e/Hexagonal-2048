import { Circles } from "react-loader-spinner";

function PageLoader() {
  return (
    <div className="page--loader">
      <Circles
        height="130"
        width="130"
        color="#e4d1bf"
        ariaLabel="circles-loading"
        wrapperStyle={{}}
        wrapperClass=""
        visible={true}
      />
    </div>
  );
}

export default PageLoader;
