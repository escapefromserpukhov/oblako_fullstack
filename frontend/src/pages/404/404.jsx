import { Link } from "react-router-dom";
import image from "./image.svg";

export const NotFound = () => {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        marginTop: "-40px",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "1.5em",
      }}
    >
      <div className="item">
        <img style={{ height: "20vw", maxHeight: 250 }} src={image} />
        <div style={{ textAlign: "center" }}>
          <h1 className="error-page-code">404</h1>
          Страница не найдена
        </div>
        <br />
        <Link to="/" children="Назад" />
      </div>
    </div>
  );
};
