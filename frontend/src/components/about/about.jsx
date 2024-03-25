import { IconButton } from "rsuite";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Panel } from "rsuite";
import ArowBackIcon from "@rsuite/icons/ArowBack";

export const About = (props) => {
  const { loggedIn } = useSelector((state) => state.user);
  return (
    <Panel bordered style={{ width: 400, overflow: "visible" }} header="О приложении">
      <>
        Bеб-приложение - облачное хранилище, для хранения любых файлов, которые вы решите загрузить. Позволяет
        отображать, загружать, отправлять, скачивать и переименовывать ваши файлы.
      </>
      {!loggedIn && (
        <>
          <br />
          <br />
          <>
            <Link to="/signin" children={"Войдите"} /> или <Link to="/signup" children={"зарегистрируйтесь"} /> в
            приложении чтобы управлять вашим облачным хранилищем.
          </>
          <br />
          <br />
          <IconButton onClick={() => props.setCurrent(0)} icon={<ArowBackIcon />} size="xs" children="Назад" />
        </>
      )}
    </Panel>
  );
};
