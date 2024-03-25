import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api";
import { handleResponse } from "../../utils";

const getUsers = createAsyncThunk("main/users", async (_, thunkApi) => {
    const response = await handleResponse(api.getUsers.bind(this), thunkApi);
    return response.data;
});

const onUpdateUser = createAsyncThunk("main/updateUser", async ({ userId, data }, thunkApi) => {
    const response = await handleResponse(api.onUpdateUser.bind(this, userId, data), thunkApi);
    return response.data;
});

const onDeleteUsers = createAsyncThunk("main/deleteUsers", async (userIds, thunkApi) => {
    const response = await handleResponse(api.onDeleteUsers.bind(this, userIds), thunkApi);
    return { data: response.data, userIds };
});

export const mainSlice = createSlice({
    name: "main",
    initialState: {
        users: [],
    },
    reducers: {
        clearUsers(state) {
            state.users = [];
        },
        setUsers(state, { payload }) {
            state.users = payload;
        },
    },
    extraReducers(builder) {
        builder
            .addCase(getUsers.fulfilled, (state, { payload }) => {
                if (payload) {
                    state.users = payload;
                }
            })
            .addCase(onUpdateUser.fulfilled, (state, { payload }) => {
                if (payload) {
                    state.users = state.users.map((item) => (item.id === payload.id ? payload : item));
                }
            })
            .addCase(onDeleteUsers.fulfilled, (state, { payload }) => {
                if (payload.data) {
                    state.users = state.users.filter((item) => !payload.userIds.includes(item.id));
                }
            });
    },
});

mainSlice.actions = { ...mainSlice.actions, getUsers, onUpdateUser, onDeleteUsers };
