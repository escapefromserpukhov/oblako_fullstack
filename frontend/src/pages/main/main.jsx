import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Button, Container, Content, Sidebar, Nav, Sidenav, Modal } from "rsuite";
import { useActions } from "../../store";
import { GridTable } from "../../components/grid";
import GroupIcon from "@rsuite/icons/legacy/Group";
import AdminIcon from "@rsuite/icons/Admin";
import SettingHorizontalIcon from "@rsuite/icons/SettingHorizontal";
import ExitIcon from "@rsuite/icons/Exit";
import { Storage } from "../storage/storage";

const NavHeader = () => {
    const [showConfirmExit, setShowConfirmExit] = useState(false);
    const { dispatch, actions } = useActions();
    const { data, isAdmin } = useSelector((state) => state.user);

    const handleConfirmExit = async (confirm) => {
        if (confirm) {
            dispatch(actions.user.onLogout());
            dispatch(actions.user.clearUserData());
            dispatch(actions.main.clearUsers());
        }
        setShowConfirmExit(false);
    };

    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div
                    style={{
                        width: 40,
                        height: 40,
                        background: "#f5f5f5",
                        borderRadius: "50%",
                        marginTop: 2,
                        overflow: "hidden",
                        display: "inline-block",
                    }}
                >
                    <img loading="lazy" src={`https://i.pravatar.cc/100`} width="40" />
                </div>
                <span style={{ fontSize: 14 }}>
                    {isAdmin ? "admin" : "user"} - {data?.username}
                </span>
            </div>
            <Button startIcon={<ExitIcon />} onClick={() => setShowConfirmExit(true)} color="red" appearance="ghost" size="xs">
                Выйти
            </Button>
            <Modal backdrop="static" role="alertdialog" open={showConfirmExit} size="xs">
                <Modal.Header>
                    <ExitIcon color="red" />
                </Modal.Header>
                <Modal.Body>
                    Все не сохраненные данные будут утеряны.
                    <br />
                    <br />
                    Выйти?
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => handleConfirmExit(true)} color="red" appearance="ghost">
                        Выйти
                    </Button>
                    <Button onClick={() => handleConfirmExit(false)} appearance="subtle">
                        Отмена
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export const MainPage = () => {
    const { isAdmin, data: userData } = useSelector((state) => state.user);

    const [expanded, setExpanded] = React.useState(true);
    const [activeKey, setActiveKey] = React.useState(!isAdmin ? "1" : localStorage.getItem("activeKey") || "1");

    const { users } = useSelector((state) => state.main);
    const { files } = useSelector((state) => state.storage);

    const { dispatch, actions } = useActions();

    useEffect(() => {
        isAdmin && !users.length && dispatch(actions.main.getUsers());
    }, [users]);

    useEffect(() => {
        if (activeKey === "2") {
            isAdmin && dispatch(actions.main.getUsers());
        }
    }, [activeKey, files.length]);

    useMemo(() => localStorage.setItem("activeKey", activeKey), [activeKey]);

    return (
        <Container style={{ height: "100vh", width: "100vw" }}>
            <Sidebar width={expanded ? 260 : 56} collapsible>
                <Sidenav
                    style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100vh" }}
                    expanded={expanded}
                    // appearance="inverse"
                >
                    <Sidenav.Body>
                        <Nav activeKey={activeKey} onSelect={setActiveKey}>
                            <Nav.Item eventKey={activeKey} icon={<AdminIcon />}>
                                <NavHeader />
                            </Nav.Item>
                            <Nav.Item eventKey="1" icon={<SettingHorizontalIcon />}>
                                Мое хранилище
                            </Nav.Item>
                            {isAdmin && (
                                <Nav.Item eventKey="2" icon={<GroupIcon />}>
                                    Список пользователей
                                </Nav.Item>
                            )}
                        </Nav>
                    </Sidenav.Body>
                    <Sidenav.Toggle onToggle={setExpanded} />
                </Sidenav>
            </Sidebar>

            <Container>
                <Content style={{ padding: 20 }}>
                    {activeKey === "1" && userData && <Storage />}
                    {isAdmin && activeKey === "2" && <GridTable />}
                </Content>
            </Container>
        </Container>
    );
};
