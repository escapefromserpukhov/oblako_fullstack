import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api";
import { isEmail, latinValue, maxLength, minLength, required, specSymbol, validator } from "../../utils/validator";
import { AUTH_TOKEN_NAME } from "../../utils/constants";
import { handleResponse } from "../../utils";

const getMe = createAsyncThunk("user/me", async (_, thunkApi) => {
    if (api.getToken()) {
        const response = await handleResponse(api.getMe.bind(this), thunkApi);
        return response?.data || response;
    }
});

const onLogin = createAsyncThunk("user/login", async (payload, thunkApi) => {
    if (payload) {
        const response = await handleResponse(api.onLogin.bind(this, payload), thunkApi);
        return response?.data || response;
    }
});

const onRegister = createAsyncThunk("user/register", async (payload, thunkApi) => {
    if (payload) {
        const response = await handleResponse(api.onRegister.bind(this, payload), thunkApi);
        return response?.data;
    }
});

const initState = {
    loggedIn: Boolean(false),
    isAdmin: false,
    requestErrors: [],
    data: null,
    dataFields: {
        username: String(""),
        password: String(""),
        email: String(""),
    },
    errors: {
        username: String(""),
        password: String(""),
        email: String(""),
    },

    hasErrors: true,
};

export const userSlice = createSlice({
    name: "user",
    initialState: { ...initState },
    reducers: {
        setUsername(state, { payload }) {
            state.dataFields.username = payload;
            state.errors.username = validator(state.dataFields.username, required(), latinValue(), minLength(4), maxLength(20));
        },
        setPassword(state, { payload }) {
            state.dataFields.password = payload;
            state.errors.password = validator(
                state.dataFields.password,
                required(),
                minLength(6),
                specSymbol(),
                (value) => /[\d]/g.test(value) || "Значение должно содержать хотя бы одну цифру.",
                (value) => /[A-Z]/g.test(value) || "Значение должно содержать хотя бы одну заглавную букву."
            );
        },
        setEmail(state, { payload }) {
            state.dataFields.email = payload;
            state.errors.email = validator(state.dataFields.email, required(), isEmail());
        },
        setHasErrors(state, { payload }) {
            state.hasErrors = payload;
        },
        onLogout(state) {
            state.loggedIn = false;
            localStorage.removeItem(AUTH_TOKEN_NAME);
            api.setToken(null);
        },
        clearRequestErrors(state) {
            state.requestErrors = [];
        },
        clearUserData(state) {
            Object.keys(state).forEach((key) => {
                state[key] = initState[key];
            });
        },
    },
    extraReducers(builder) {
        builder
            .addCase(getMe.fulfilled, (state, { payload }) => {
                if (payload) {
                    state.data = payload;
                    state.loggedIn = true;
                    state.isAdmin = payload.role === "admin";
                    state.dataFields.password = "";
                }
            })
            .addCase(onRegister.fulfilled, (state, { payload }) => {
                if (payload) {
                    const token = payload?.access_token;
                    api.setToken(token);
                    localStorage.setItem(AUTH_TOKEN_NAME, token);

                    state.data = payload.user;
                    state.loggedIn = true;
                    state.isAdmin = payload.user.role === "admin";
                    state.dataFields.password = "";
                }
            })
            .addCase(onRegister.rejected, (state, { payload }) => {
                if (payload?.length) {
                    state.requestErrors = payload;
                }
            })
            .addCase(onLogin.fulfilled, (state, { payload }) => {
                const token = payload?.access_token;
                if (token) {
                    localStorage.setItem(AUTH_TOKEN_NAME, token);
                    api.setToken(token);
                    state.loggedIn = true;
                    state.dataFields.password = "";
                }
            })
            .addCase(onLogin.rejected, (state, { payload }) => {
                if (payload?.length) {
                    state.requestErrors = payload;
                }
            });
    },
});

userSlice.actions = { ...userSlice.actions, getMe, onLogin, onRegister };
