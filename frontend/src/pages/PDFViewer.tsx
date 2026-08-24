import { useLocation } from "react-router-dom";

const PDFViewer = () => {

  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);

  const pdf = queryParams.get("file");

  return (

    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "#f4f7fb",
      }}
    >

      <iframe
        src={pdf || ""}
        title="Medical Report PDF"
        width="100%"
        height="100%"
        style={{
          border: "none",
        }}
      />

    </div>

  );

};

export default PDFViewer;