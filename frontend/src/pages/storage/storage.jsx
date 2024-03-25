import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { DOMHelper, Table, IconButton, Popover, Whisper, Button, Modal, Checkbox, Notification, useToaster } from "rsuite";
import EditIcon from "@rsuite/icons/Edit";
import FileUploadIcon from "@rsuite/icons/FileUpload";
import FileDownloadIcon from "@rsuite/icons/FileDownload";
import ImportIcon from "@rsuite/icons/Import";
import WarningRoundIcon from "@rsuite/icons/WarningRound";
import CopyIcon from "@rsuite/icons/Copy";

import * as dateFns from "date-fns";
import { useActions } from "../../store";
import { bytesToMegaBytes } from "../../utils";
import { Loading } from "../../components/loading";
import { CheckCell } from "../../components/grid/cells";
import { PropTypes } from "prop-types";
import { EditFileModal } from "./edit-file-modal";
import { api } from "../../api";

const { Column, HeaderCell, Cell } = Table;
const { getHeight } = DOMHelper;

/** */
export const Storage = (props) => {
    const [checkedKeys, setCheckedKeys] = useState([]);
    const [deletingFiles, setDeletingFiles] = useState(false);

    const [file, setFile] = useState(null);

    const { dispatch, actions } = useActions();

    const user = useSelector((state) => state.user);
    const { fileData, fileDataSnapshot, errorSaveFile, isEditFile, files, isModified } = useSelector((state) => state.storage);
    const { isLoading } = useSelector((state) => state.app);

    const { currentUser = user.data, parentRef = null } = props;

    useEffect(() => {
        dispatch(actions.storage.getFiles(currentUser.id));
        return () => {
            setCheckedKeys([]);
            dispatch(actions.storage.setFiles([]));
        };
    }, []);

    const toaster = useToaster();
    const toast = (type, msg) => <Notification type={type} header={msg} />;

    const handleSaveFile = async (confirm, event) => {
        let isSaved = false;
        let res;
        if (confirm) {
            if (isEditFile) {
                const data = Object.entries(fileData).reduce(
                    (obj, [field, value]) => (fileDataSnapshot[field] !== value ? { ...obj, [field]: value } : obj),
                    {}
                );
                res = await dispatch(actions.storage.onSaveFile({ fileData: data, fileId: fileData.id }));
                if (res.payload) {
                    const newFiles = files.map((item) => (item.id === res.payload.id ? res.payload : item));
                    dispatch(actions.storage.setFiles(newFiles));
                }
                isSaved = errorSaveFile === "";
            } else {
                const body = new FormData(event.target);
                body.append("file", file);
                res = await api.onLoadFile(body);
                setFile(null);
                res?.data.length && dispatch(actions.storage.setFiles(res.data));
                isSaved = errorSaveFile === "";
            }
        }
        if (!confirm || isSaved) {
            dispatch(actions.storage.setFile({ fileData: null }));
            isSaved && toaster.push(toast("success", isEditFile ? "Сохранено" : "Файл загружен"), { duration: 2000 });
            errorSaveFile && toaster.push(toast("error", "Ошибка"), { duration: 2000 });
        }
        return res;
    };

    const handleCopyLinkFile = async (rowData) => {
        const res = await dispatch(actions.storage.onGetDownloadFileLink(rowData.id));
        if (res.payload) {
            toaster.push(toast("success", "Скопировано"), { duration: 2000 });
        } else {
            toaster.push(toast("error", "Ошибка"), { duration: 2000 });
        }
    };

    const handleDeleteFiles = async () => {
        setDeletingFiles(true);
        const res = await dispatch(actions.storage.onDeleteManyFiles(checkedKeys));
        if (res.payload) {
            toaster.push(toast("success", "Выбранные файлы удалены"), {
                duration: 2000,
            });
            setCheckedKeys([]);
        } else {
            toaster.push(toast("error", "Ошибка"), { duration: 2000 });
        }
        setDeletingFiles(false);
    };

    const handleClickLoadFile = () => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.style.display = "none";
        input.click();
        input.addEventListener("change", async () => {
            const file = input.files.item(0);
            if (file) {
                setFile(file);

                const fileData = {
                    name: file.name,
                    size: file.size,
                    custom_name: file.name,
                    origin_name: file.name,
                    comment: "",
                };

                dispatch(
                    actions.storage.setFile({
                        fileData,
                        isEditFile: false,
                    })
                );
            }
            input.remove();
        });
    };

    const handleDownloadFile = async (rowData) => {
        const res = await dispatch(actions.storage.onDownloadFile(rowData.id));
        if (res.payload) {
            const newFiles = files.map((item) => (item.id === rowData.id ? { ...item, downloaded_at: new Date().toISOString() } : item));
            dispatch(actions.storage.setFiles(newFiles));
            toaster.push(toast("success", "Файл скачан"), { duration: 2000 });
        }
    };

    let checked = false;
    let indeterminate = false;

    if (checkedKeys.length && checkedKeys.length === files.length) {
        checked = true;
    } else if (checkedKeys.length === 0) {
        checked = false;
    } else if (checkedKeys.length > 0 && checkedKeys.length < files.length) {
        indeterminate = true;
    }

    const handleCheckAll = (_value, checked) => {
        const keys = checked ? files.map((item) => item.id) : [];
        setCheckedKeys(keys);
    };

    const handleCheck = (value, checked) => {
        const keys = checked ? [...checkedKeys, value] : checkedKeys.filter((item) => item !== value);
        setCheckedKeys(keys);
    };

    const gridHeight = useMemo(() => getHeight(parentRef?.current || window) - 96, [parentRef, parentRef?.current]);

    if (!currentUser) return <Loading />;

    return (
        <>
            <Modal
                backdrop={true}
                onClose={() => dispatch(actions.storage.setErrorLoadFile(""))}
                role="alertdialog"
                open={Boolean(errorSaveFile)}
                size="xs"
            >
                <Modal.Header>
                    <WarningRoundIcon style={{ color: "red", fontSize: 24, marginRight: 10 }} />
                    Ошибка
                    <br />
                </Modal.Header>
                <Modal.Body>
                    Попробуйте загрузить файл позже.
                    <br />
                    <br />
                    <span>{errorSaveFile}</span>
                </Modal.Body>
                <Modal.Footer>
                    <Button size="xs" onClick={() => dispatch(actions.storage.setErrorLoadFile(""))} appearance="subtle">
                        Закрыть
                    </Button>
                </Modal.Footer>
            </Modal>
            <div
                style={{
                    display: "flex",
                    marginBottom: 20,
                    gap: 15,
                    alignItems: "end",
                }}
            >
                {currentUser?.id === user.data?.id && (
                    <div>
                        <Button startIcon={<ImportIcon />} onClick={handleClickLoadFile} color="green" appearance="ghost">
                            Загрузить файл
                        </Button>
                    </div>
                )}

                <div>
                    <Button
                        disabled={Boolean(checkedKeys.length) === false}
                        loading={deletingFiles}
                        onClick={handleDeleteFiles}
                        color="red"
                        appearance="ghost"
                    >
                        Удалить выбранное
                    </Button>
                </div>
            </div>
            <Table
                loading={isLoading}
                virtualized
                data={[...files]?.sort((a, b) => (a?.id > b?.id ? 1 : -1))}
                height={gridHeight}
                translate3d={false}
            >
                <Column width={30} align="center" fixed>
                    <HeaderCell>Id</HeaderCell>
                    <Cell dataKey="id" />
                </Column>

                <Column width={50} fixed>
                    <HeaderCell style={{ padding: 0 }}>
                        <div style={{ lineHeight: "40px" }}>
                            <Checkbox inline checked={checked} indeterminate={indeterminate} onChange={handleCheckAll} />
                        </div>
                    </HeaderCell>
                    <CheckCell dataKey="id" checkedKeys={checkedKeys} onChange={handleCheck} disabledId={fileData?.id} />
                </Column>

                <Column width={50} align="center" fixed>
                    <HeaderCell>Скачать</HeaderCell>
                    <Cell>
                        {(rowData) => (
                            <Whisper placement="top" speaker={<Popover>Скачать - {rowData.custom_name}</Popover>}>
                                <FileDownloadIcon
                                    onClick={() => handleDownloadFile(rowData)}
                                    style={{
                                        color: "green",
                                        fontSize: 20,
                                        cursor: "pointer",
                                    }}
                                />
                            </Whisper>
                        )}
                    </Cell>
                </Column>

                <Column width={120} align="center" fixed>
                    <HeaderCell>Получить ссылку</HeaderCell>
                    <Cell>
                        {(rowData) => (
                            <Whisper placement="top" speaker={<Popover>Нажмите чтобы скопировать ссылку</Popover>}>
                                <CopyIcon
                                    onClick={() => handleCopyLinkFile(rowData)}
                                    style={{
                                        color: "blue",
                                        fontSize: 20,
                                        cursor: "pointer",
                                    }}
                                />
                            </Whisper>
                        )}
                    </Cell>
                </Column>

                <Column width={150} fixed fullText>
                    <HeaderCell>Имя файла</HeaderCell>
                    <Cell dataKey="custom_name" />
                </Column>

                <Column width={130} fullText>
                    <HeaderCell>Размер, Мб</HeaderCell>
                    <Cell>{(rowData) => bytesToMegaBytes(rowData.size)}</Cell>
                </Column>

                <Column flexGrow={1} fullText>
                    <HeaderCell>Комментарий</HeaderCell>
                    <Cell dataKey="comment" />
                </Column>

                <Column width={150} fullText>
                    <HeaderCell>
                        <FileUploadIcon style={{ marginRight: 10 }} />
                        Дата создания
                    </HeaderCell>
                    <Cell>{(rowData) => rowData.created_at && dateFns.format(new Date(rowData.created_at), "dd.LL.yyyy hh:mm:ss")}</Cell>
                </Column>

                <Column width={150} fullText>
                    <HeaderCell>
                        <FileDownloadIcon style={{ marginRight: 10 }} />
                        Дата скачивания
                    </HeaderCell>
                    <Cell>
                        {(rowData) =>
                            rowData.downloaded_at
                                ? dateFns.format(new Date(rowData.downloaded_at), "dd.LL.yyyy hh:mm:ss")
                                : "Еще не скачали"
                        }
                    </Cell>
                </Column>

                <Column width={80} fixed="right">
                    <HeaderCell>...</HeaderCell>

                    <Cell style={{ padding: "6px" }}>
                        {(rowData) => (
                            <Whisper placement="top" speaker={<Popover>Редактировать</Popover>}>
                                <IconButton
                                    size="lg"
                                    appearance="link"
                                    icon={<EditIcon />}
                                    onClick={() =>
                                        dispatch(
                                            actions.storage.setFile({
                                                fileData: rowData,
                                                isEditFile: true,
                                            })
                                        )
                                    }
                                />
                            </Whisper>
                        )}
                    </Cell>
                </Column>
            </Table>
            <EditFileModal handleCloseModal={handleSaveFile} data={fileData} isEditFile={isEditFile} isModified={isModified} />
        </>
    );
};

Storage.propTypes = {
    currentUser: PropTypes.object,
    parentRef: PropTypes.object,
};
