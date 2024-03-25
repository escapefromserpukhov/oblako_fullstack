import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
    IconButton,
    Input,
    InputGroup,
    Table,
    Button,
    DOMHelper,
    Checkbox,
    Stack,
    Popover,
    Whisper,
    Modal,
    useToaster,
    Notification,
} from "rsuite";
import SearchIcon from "@rsuite/icons/Search";
import ReloadIcon from "@rsuite/icons/Reload";
import { AdminCell, CheckCell, ImageCell, NameCell } from "./cells";
import { useActions } from "../../store";
import { Storage } from "../../pages/storage";
import { bytesToMegaBytes } from "../../utils";
import { PropTypes } from "prop-types";

const { Column, HeaderCell, Cell } = Table;
const { getHeight } = DOMHelper;

export const GridTable = () => {
    const [checkedKeys, setCheckedKeys] = useState([]);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortType, setSortType] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [gridLoading, setGridLoading] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const [loadingDeleteButton, setLoadingDeleteButton] = useState(false);

    const { users: data } = useSelector((state) => state.main);
    const { isLoading } = useSelector((state) => state.app);

    const toaster = useToaster();
    const toast = (type, msg) => <Notification type={type} header={msg} />;

    const user = useSelector((state) => state.user);

    const { dispatch, actions } = useActions();

    let checked = false;
    let indeterminate = false;

    if (checkedKeys.length && checkedKeys.length === data?.length - 1) {
        checked = true;
    } else if (checkedKeys.length === 0) {
        checked = false;
    } else if (checkedKeys.length > 0 && checkedKeys.length < data?.length) {
        indeterminate = true;
    }

    const handleCheckAll = (_value, checked) => {
        const keys = checked ? data.map((item) => (item.id !== user.data?.id ? item.id : null)).filter((e) => e !== null) : [];
        setCheckedKeys(keys);
    };

    const handleCheck = (value, checked) => {
        const keys = checked ? [...checkedKeys, value] : checkedKeys.filter((item) => item !== value);
        setCheckedKeys(keys);
    };

    const handleSortColumn = (sortColumn, sortType) => {
        setSortColumn(sortColumn);
        setSortType(sortType);
    };

    const handleClickDeleteUsers = async () => {
        setLoadingDeleteButton(true);
        const res = await dispatch(actions.main.onDeleteUsers(checkedKeys));
        if (res.payload) toaster.push(toast("success", "Успешно"), { duration: 2000 });
        setCheckedKeys([]);
        setLoadingDeleteButton(false);
    };

    const handleCloseModal = () => {
        setSelectedRecord(null);
    };

    const factoryData = () => {
        let filtered = data?.filter((item) => {
            if (!item.username.includes(searchKeyword)) {
                return false;
            }
            return true;
        });

        if (sortColumn && sortType) {
            filtered.sort((a, b) => {
                let x = a[sortColumn];
                let y = b[sortColumn];

                switch (sortColumn) {
                    case "progress":
                        x = bytesToMegaBytes(a.files.reduce((sum, e) => sum + e.size, 0));
                        y = bytesToMegaBytes(b.files.reduce((sum, e) => sum + e.size, 0));
                        break;
                    case "count":
                        x = a.files?.length;
                        y = b.files?.length;
                        break;
                }

                if (typeof x === "string") {
                    x = x.charCodeAt(0);
                }
                if (typeof y === "string") {
                    y = y.charCodeAt(0);
                }

                if (sortType === "asc") {
                    return x - y;
                } else {
                    return y - x;
                }
            });
        }

        const currentUserIndex = filtered.findIndex((item) => item.id === user.data?.id);

        if (currentUserIndex > 0) {
            filtered = [filtered[currentUserIndex], ...filtered.slice(0, currentUserIndex), ...filtered.slice(currentUserIndex + 1)];
        }

        return filtered;
    };

    return (
        <>
            <Stack className="table-toolbar" justifyContent="space-between">
                <Stack style={{ paddingBottom: 12 }} spacing={8}>
                    <InputGroup inside>
                        <Input placeholder="Поиск" value={searchKeyword} onChange={setSearchKeyword} />
                        <InputGroup.Addon>
                            <SearchIcon />
                        </InputGroup.Addon>
                    </InputGroup>
                    <Button
                        loading={loadingDeleteButton}
                        appearance="ghost"
                        onClick={handleClickDeleteUsers}
                        disabled={Boolean(checkedKeys.length) === false}
                        color="red"
                    >
                        Удалить выбранных
                    </Button>
                </Stack>
                <Whisper placement="left" speaker={<Popover>Обновить</Popover>}>
                    <IconButton
                        onClick={async () => {
                            setGridLoading(true);
                            await dispatch(actions.main.getUsers());
                            setGridLoading(false);
                        }}
                        color="blue"
                        size="xs"
                        icon={<ReloadIcon />}
                        appearance="ghost"
                        circle
                    />
                </Whisper>
            </Stack>

            <Table
                height={Math.max(getHeight(window) - 200, 400)}
                data={factoryData()}
                sortColumn={sortColumn}
                sortType={sortType}
                onSortColumn={handleSortColumn}
                loading={gridLoading || isLoading}
                onRowClick={(rowData) => setSelectedRecord(rowData)}
            >
                <Column width={50} align="center" fixed fullText>
                    <HeaderCell>Id</HeaderCell>
                    <Cell dataKey="id" />
                </Column>

                <Column width={50} fixed>
                    <HeaderCell style={{ padding: 0 }}>
                        <div style={{ lineHeight: "40px" }}>
                            <Checkbox inline checked={checked} indeterminate={indeterminate} onChange={handleCheckAll} />
                        </div>
                    </HeaderCell>
                    <CheckCell dataKey="id" checkedKeys={checkedKeys} onChange={handleCheck} disabledId={user.data.id} />
                </Column>

                <Column width={80} align="center">
                    <HeaderCell>🙂</HeaderCell>
                    <ImageCell dataKey="avatar" />
                </Column>

                <Column width={200} flexGrow={1} fullText>
                    <HeaderCell>Имя</HeaderCell>
                    <NameCell dataKey="username" />
                </Column>

                <Column width={200} flexGrow={1} fullText>
                    <HeaderCell>Email</HeaderCell>
                    <Cell dataKey="email" />
                </Column>

                <Column width={160} align="center">
                    <HeaderCell>Количество файлов</HeaderCell>
                    <Cell dataKey="file_count" />
                </Column>

                <Column width={150} align="center">
                    <HeaderCell>Общий объем, Мб</HeaderCell>
                    <Cell dataKey="total_size" align="center">
                        {(rowData) => bytesToMegaBytes(rowData.total_size || 0)}
                    </Cell>
                </Column>

                <Column width={100} align="center">
                    <HeaderCell>Роль</HeaderCell>
                    <AdminCell align="end" dataKey="role" currentUser={user.data} />
                </Column>
            </Table>
            {selectedRecord && <SelectedUserStorage currentUser={selectedRecord} handleCloseModal={handleCloseModal} />}
        </>
    );
};

const SelectedUserStorage = ({ currentUser, handleCloseModal }) => {
    const modalBodyRef = useRef();
    return (
        <Modal backdrop="true" open={Boolean(currentUser)} onClose={handleCloseModal} size="lg">
            <Modal.Header>Хранилище - {currentUser?.username}</Modal.Header>
            <Modal.Body ref={modalBodyRef}>
                <Storage parentRef={modalBodyRef} currentUser={currentUser || undefined} />
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleCloseModal} appearance="subtle">
                    Закрыть
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

SelectedUserStorage.propTypes = {
    currentUser: PropTypes.object,
    handleCloseModal: PropTypes.func,
};
