import { PropTypes } from "prop-types";

export const RenderEmpty = ({ emptyText, loadingText } = {}) => {
  return (
    <div role="rowgroup" className="rs-table-body-row-wrapper" style={{ top: 40, height: 160 }}>
      <div
        className="rs-table-body-wheel-area"
        style={{ position: "absolute", height: 0, minHeight: 200, transform: "translate(0px, 0px)" }}
      ></div>
      <div className="rs-table-body-info">{emptyText || "Нет данных"}</div>
      <div className="rs-table-loader-wrapper">
        <div className="rs-table-loader">
          <i className="rs-table-loader-icon"></i>
          <span className="rs-table-loader-text">{loadingText || "Загрузка..."}</span>
        </div>
      </div>
    </div>
  );
};

RenderEmpty.propTypes = {
  emptyText: PropTypes.string,
  loadingText: PropTypes.string,
};
