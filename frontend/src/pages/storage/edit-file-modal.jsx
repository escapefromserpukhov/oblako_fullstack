import { useState } from "react";
import { Button, Modal, Input, FlexboxGrid, Notification, useToaster } from "rsuite";
import RemindIcon from "@rsuite/icons/legacy/Remind";
import TrashIcon from "@rsuite/icons/Trash";

import * as dateFns from "date-fns";
import { useActions } from "../../store";
import { bytesToMegaBytes } from "../../utils";
import { PropTypes } from "prop-types";

const ControlRow = ({ label, control, ...rest }) => (
    <FlexboxGrid {...rest} style={{ marginBottom: 10 }} align="middle">
        <FlexboxGrid.Item colspan={10}>{label}: </FlexboxGrid.Item>
        <FlexboxGrid.Item colspan={12}>{control}</FlexboxGrid.Item>
    </FlexboxGrid>
);

ControlRow.propTypes = {
    label: PropTypes.string,
    control: PropTypes.any,
};

export const EditFileModal = ({ handleCloseModal, data, isEditFile = true, isModified = false }) => {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isSavingFile, setIsSavingFile] = useState(false);
    const [isDeletingFile, setIsDeletingFile] = useState(false);

    const { dispatch, actions } = useActions();

    const toaster = useToaster();
    const toast = (type, msg) => <Notification type={type} header={msg} />;

    const handleSave = async (confirm, event) => {
        event && event.preventDefault();
        setIsSavingFile(true);
        await handleCloseModal(confirm, event);
        setIsSavingFile(false);
    };

    const handleConfirmDelete = async (confirm) => {
        if (confirm) {
            setIsDeletingFile(true);
            const res = await dispatch(actions.storage.onDeleteFile(data.id));
            if (res?.payload) {
                toaster.push(toast("success", "Файл удален"), {
                    duration: 2000,
                });
            } else {
                toaster.push(toast("error", "Ошибка"), { duration: 2000 });
            }
            setIsDeletingFile(false);
        }
        setConfirmDelete(false);
    };

    const handleChangeValue = (value) => {
        dispatch(actions.storage.onChangeValueFile(value));
    };

    return (
        <>
            <Modal
                open={confirmDelete ? false : Boolean(data)}
                onClose={isSavingFile ? undefined : () => handleCloseModal(false)}
                style={{ minWeight: 320, width: "40vw", right: 0, left: 0, margin: "0 auto", alignContent: "center" }}
                // onEntered={handleEntered}
            >
                <form onSubmit={(e) => handleSave(true, e)}>
                    <Modal.Header>
                        <Modal.Title>{isEditFile ? "Редактирование файла" : "Загрузка файла"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {data && (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    minHeight: "30vh",
                                    gap: 8,
                                }}
                            >
                                <ControlRow
                                    label="Оригинальное название"
                                    control={
                                        <Input
                                            plaintext={isEditFile}
                                            readOnly
                                            name="name"
                                            value={data.origin_name}
                                            placeholder="Оригинальное название"
                                        />
                                    }
                                />
                                <ControlRow
                                    label="Ваше название"
                                    control={
                                        <Input
                                            name="custom_name"
                                            onChange={(value) => handleChangeValue({ custom_name: value })}
                                            disabled={isSavingFile}
                                            value={data.custom_name}
                                            placeholder="Имя файл"
                                        />
                                    }
                                />
                                <ControlRow
                                    label="Комментарий"
                                    control={
                                        <Input
                                            name="comment"
                                            onChange={(value) =>
                                                handleChangeValue({
                                                    comment: value,
                                                })
                                            }
                                            disabled={isSavingFile}
                                            as="textarea"
                                            rows={3}
                                            value={data.comment}
                                            placeholder="Комментарий"
                                        />
                                    }
                                />
                                <ControlRow
                                    label="Размер файла"
                                    control={
                                        <Input
                                            name="size"
                                            plaintext={isEditFile}
                                            readOnly
                                            value={isEditFile ? `${bytesToMegaBytes(data.size)} Мб` : data.size}
                                        />
                                    }
                                />
                                {data.downloadedAt && (
                                    <ControlRow
                                        label="Дата скачивания"
                                        control={dateFns.format(new Date(data.downloadedAt), "dd.LL.yyyy hh:mm:ss")}
                                    />
                                )}
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        {isEditFile && (
                            <Button
                                size="xs"
                                disabled={isSavingFile}
                                color="red"
                                onClick={() => setConfirmDelete(true)}
                                appearance="primary"
                                startIcon={<TrashIcon />}
                            >
                                Удалить файл
                            </Button>
                        )}
                        <Button
                            disabled={isEditFile ? !isModified : false}
                            type="submit"
                            size="xs"
                            loading={isSavingFile}
                            appearance="primary"
                        >
                            {isEditFile ? "Сохранить" : "Загрузить"}
                        </Button>
                        <Button size="xs" disabled={isSavingFile} onClick={() => handleCloseModal(false)} appearance="subtle">
                            Отмена
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>

            <Modal backdrop="static" role="alertdialog" open={confirmDelete} size="xs">
                <Modal.Body>
                    <RemindIcon style={{ color: "#ffb300", fontSize: 24 }} />
                    <br />
                    <br />
                    Файл &apos;{data?.name}&apos; будет удален без возможности восстановления.
                    <br />
                    <br />
                    Удалить?
                </Modal.Body>
                <Modal.Footer>
                    <Button loading={isDeletingFile} size="xs" onClick={() => handleConfirmDelete(true)} appearance="primary">
                        Удалить
                    </Button>
                    <Button size="xs" onClick={() => handleConfirmDelete(false)} appearance="subtle">
                        Отмена
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

EditFileModal.propTypes = {
    handleCloseModal: PropTypes.func,
    data: PropTypes.object,
    isEditFile: PropTypes.bool,
    isModified: PropTypes.bool,
};
