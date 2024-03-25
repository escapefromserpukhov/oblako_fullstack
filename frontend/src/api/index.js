import { AUTH_TOKEN_NAME } from "../utils/constants";

class Api {
    #baseUrl = `${BASE_URL}/api`;

    #token = localStorage.getItem(AUTH_TOKEN_NAME);

    #urls = {
        login: `${this.#baseUrl}/signin`,
        register: `${this.#baseUrl}/signup`,
        me: `${this.#baseUrl}/users/me`,
        users: `${this.#baseUrl}/users`,
        updateUser: `${this.#baseUrl}/users/update`,
        deleteUsers: `${this.#baseUrl}/users/delete`,
        files: `${this.#baseUrl}/files`,
        loadFile: `${this.#baseUrl}/files/load/`,
        updateFile: `${this.#baseUrl}/files/update`,
        deleteFile: `${this.#baseUrl}/files/delete`,
        downloadFile: `${this.#baseUrl}/files/download`,
        getLink: `${this.#baseUrl}/files/link`,
        copyFile: `${this.#baseUrl}/files/copy`,
    };

    async #handleRequest(response) {
        return response?.json() || Promise.reject({ message: "Error api.handleRequest", response });
    }

    get #headers() {
        let headers = {
            credentials: "include",
        };
        if (this.#token) {
            headers.Authorization = `Bearer ${this.#token}`;
        }
        return headers;
    }

    setToken(token = localStorage.getItem(AUTH_TOKEN_NAME)) {
        this.#token = token;
    }

    getToken() {
        return this.#token;
    }

    #createRequest = async (url, method = "GET", body, headers) => {
        headers = { ...this.#headers, ...headers };
        body = body ? JSON.stringify(body) : undefined;
        if (method !== "GET") {
            headers["Content-Type"] = "application/json;charset=utf-8";
        }
        const timeout = (fn, resolve) =>
            setTimeout(async () => {
                resolve(await fn());
                clearInterval(timeout);
            }, 500);
        return new Promise((resolve) => timeout(() => fetch(url, { body, method, headers }).then(this.#handleRequest), resolve));
    };

    getMe = async () => await this.#createRequest(this.#urls.me);

    onLogin = async (body) => await this.#createRequest(this.#urls.login, "POST", body);

    onRegister = async (body) => await this.#createRequest(this.#urls.register, "POST", body);

    getUsers = async () => await this.#createRequest(this.#urls.users);

    getFiles = async (userId = "") => await this.#createRequest(`${this.#urls.files}/${userId}/`);

    onUpdateUser = async (userId, body) => await this.#createRequest(`${this.#urls.updateUser}/${userId}/`, "PATCH", body);

    onDeleteUsers = async (userIds = []) => await this.#createRequest(`${this.#urls.deleteUsers}/`, "DELETE", userIds);

    onLoadFile = async (body) =>
        await fetch(`${this.#urls.loadFile}`, { method: "POST", body, headers: this.#headers }).then(this.#handleRequest);

    onUpdateFile = async (fileId, fileData) => await this.#createRequest(`${this.#urls.updateFile}/${fileId}/`, "PATCH", fileData);

    onDeleteFile = async (fileId) => await this.#createRequest(`${this.#urls.deleteFile}/${fileId}/`, "DELETE");

    onDeleteManyFiles = async (fileIds) => await this.#createRequest(`${this.#urls.deleteFile}/`, "DELETE", fileIds);

    onGetDownloadFileLink = async (fileId) => await this.#createRequest(`${this.#urls.getLink}/${fileId}/`);

    onDownloadFile = async (fileId) => {
        const res = await this.onGetDownloadFileLink(fileId);
        const fileLink = res?.data?.link_id;
        if (fileLink) {
            const linkElement = document.createElement("a");
            linkElement.setAttribute("href", `${this.#urls.downloadFile}/${fileLink}/`);
            linkElement.setAttribute("download", "file");
            linkElement.style.display = "none";
            document.body.appendChild(linkElement);
            linkElement.click();
            document.body.removeChild(linkElement);
            linkElement.remove();
            return { data: fileLink, success: true };
        }
        return { errors: [{ message: "Не успешно" }], success: false };
    };
}

export const api = new Api();
