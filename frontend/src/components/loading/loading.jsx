import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { Loader, Placeholder } from "rsuite";

export const Loading = () => {
  const { isLoading } = useSelector((state) => state.app);
  const loading = (
    <div>
      <Placeholder.Paragraph rows={8} />
      <Loader backdrop size="lg" content="Загрузка..." vertical />
    </div>
  );
  return isLoading ? loading : <Outlet />;
};
