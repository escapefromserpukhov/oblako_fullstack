import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api";
import { handleResponse } from "../../utils";

const onSaveFile = createAsyncThunk("storage/saveFile", async ({ fileData, fileId }, thunkApi) => {
    if (fileData) {
        const res = await handleResponse(api.onUpdateFile.bind(this, fileId, fileData), thunkApi);
        return res.data;
    }
});

const onLoadFile = createAsyncThunk("storage/loadFile", async (fileData, thunkApi) => {
    if (fileData) {
        const res = await handleResponse(api.onLoadFile.bind(this, fileData), thunkApi);
        return res.data;
    }
});

const onGetDownloadFileLink = createAsyncThunk("storage/copyFile", async (fileId, thunkApi) => {
    const res = await handleResponse(api.onGetDownloadFileLink.bind(this, fileId), thunkApi);
    return res.data;
});

const onDeleteFile = createAsyncThunk("storage/deleteFile", async (fileId, thunkApi) => {
    const res = await handleResponse(api.onDeleteFile.bind(this, fileId), thunkApi);
    return { responseData: res.data, fileId };
});

const onDeleteManyFiles = createAsyncThunk("storage/deleteManyFiles", async (fileIds, thunkApi) => {
    const res = await handleResponse(api.onDeleteManyFiles.bind(this, fileIds), thunkApi);
    return { responseData: res.data, fileIds };
});

const onDownloadFile = createAsyncThunk("storage/downloadFile", async (fileId, thunkApi) => {
    const res = await handleResponse(api.onDownloadFile.bind(this, fileId), thunkApi);
    return res.data;
});

const getFiles = createAsyncThunk("storage/getFiles", async (userId, thunkApi) => {
    const res = await handleResponse(api.getFiles.bind(this, userId), thunkApi);
    return res.data;
});

export const storageSlice = createSlice({
    name: "storage",
    initialState: {
        isEditFile: false,
        fileData: null,
        files: [],
        errorSaveFile: "",
        fileDataSnapshot: null,
        isModified: false,
    },
    reducers: {
        setFile(state, { payload }) {
            state.fileData = payload.fileData;
            state.fileDataSnapshot = payload.fileData;
            state.isModified = false;
            state.isEditFile = Boolean(payload.isEditFile);
        },
        setFiles(state, { payload }) {
            state.files = payload;
        },
        pushFiles(state, { payload }) {
            state.files = state.files.concat(payload);
        },
        setErrorLoadFile(state, { payload }) {
            state.errorSaveFile = payload;
        },
        onChangeValueFile(state, { payload }) {
            state.fileData = { ...state.fileData, ...payload };
            state.isModified = Object.entries(state.fileData).some(([field, value]) => state.fileDataSnapshot[field] !== value);
        },
    },
    extraReducers(builder) {
        builder
            .addCase(onSaveFile.fulfilled, (state) => {
                state.errorSaveFile = "";
            })
            .addCase(onLoadFile.fulfilled, (state) => {
                state.fileData = null;
                state.fileDataSnapshot = null;
                state.isModified = false;
                state.errorSaveFile = "";
            })
            .addCase(onDeleteFile.fulfilled, (state, { payload }) => {
                state.fileData = null;
                state.fileDataSnapshot = null;
                state.isModified = false;
                state.files = state.files.filter((item) => payload.fileId !== item.id);
                state.errorSaveFile = "";
            })
            .addCase(onDeleteManyFiles.fulfilled, (state, { payload }) => {
                state.files = state.files.filter((item) => !payload.fileIds.includes(item.id));
                state.errorSaveFile = "";
            })
            .addCase(onGetDownloadFileLink.fulfilled, (state, { payload }) => {
                const unsecuredCopyToClipboard = (text) => {
                    const textArea = document.createElement("textarea");
                    textArea.value = text;
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    try {
                        document.execCommand("copy");
                    } catch (err) {
                        console.error("Unable to copy to clipboard", err);
                    }
                    document.body.removeChild(textArea);
                    textArea.remove();
                };
                const content = `${BASE_URL}/api/files/download/${payload?.link_id}`;
                if (window.isSecureContext && navigator.clipboard) {
                    navigator.clipboard.writeText(content);
                } else {
                    unsecuredCopyToClipboard(content);
                }
            })
            .addCase(onDownloadFile.fulfilled, (state) => {
                state.errorSaveFile = "";
            })
            .addCase(getFiles.fulfilled, (state, { payload }) => {
                if (payload?.length) {
                    state.files = payload;
                }
            })
            .addCase(onDownloadFile.rejected, (state) => {
                state.errorSaveFile = "Ошибка запроса к хранилищу";
            })
            .addCase(onSaveFile.rejected, (state) => {
                state.errorSaveFile = "Ошибка запроса к хранилищу";
            })
            .addCase(onDeleteFile.rejected, (state) => {
                state.errorSaveFile = "Ошибка запроса к хранилищу";
            })
            .addCase(onGetDownloadFileLink.rejected, (state) => {
                state.errorSaveFile = "Ошибка запроса к хранилищу";
            })
            .addCase(onDeleteManyFiles.rejected, (state) => {
                state.errorSaveFile = "Ошибка запроса к хранилищу";
            });
    },
});

storageSlice.actions = {
    ...storageSlice.actions,
    onSaveFile,
    onLoadFile,
    onDeleteFile,
    onGetDownloadFileLink,
    onDeleteManyFiles,
    onDownloadFile,
    getFiles,
};
