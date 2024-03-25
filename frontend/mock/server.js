import jsonServer from "json-server";
import jwt from "jsonwebtoken";
import { compare, genSalt, hash } from "bcrypt";
import lodash from "lodash";

const server = jsonServer.create();
const routes = jsonServer.router("mock/data.json");
const middlewares = jsonServer.defaults();

let isConnected = false;

const dbModel = {
  interval: null,
  users(origin = false) {
    if (origin) {
      return routes.db.get("api").find({ id: "users" });
    }
    return routes.db.get("api").find({ id: "users" }).get("data");
  },
  files(origin = false) {
    if (origin) {
      return routes.db.get("api").find({ id: "files" });
    }
    return routes.db.get("api").find({ id: "files" }).get("data");
  },
  forceUpdate: [],
  startInterval() {
    if (!this.interval) {
      this.interval = setInterval(() => {
        if (!isConnected) {
          const currentUsers = this.users().value();
          const currentFiles = this.files().value();

          const hasChanges =
            this.forceUpdate.length || !lodash.isEqual(currentUsers, users) || !lodash.isEqual(currentFiles, files);

          if (this.forceUpdate.includes("users") || !lodash.isEqual(currentUsers, users)) {
            console.log("[JSON-SERVER] write users");
            dbModel.users(true).set("data", users).set("lastId", lastUserId).write();
            this.forceUpdate = this.forceUpdate.filter((item) => item !== "users");
          }
          if (this.forceUpdate.includes("files") || !lodash.isEqual(currentFiles, files)) {
            console.log("[JSON-SERVER] write files");
            dbModel.files(true).set("data", files).set("lastId", lastFileId).write();
            this.forceUpdate = this.forceUpdate.filter((item) => item !== "files");
          }
          if (!hasChanges) {
            clearInterval(this.interval);
            this.interval = null;
            this.forceUpdate = [];
          }
        }
      }, 500);
    }
  },
  commitChanges() {
    this.startInterval();
  },
};

let lastUserId = dbModel.users(true).get("lastId").value();
let lastFileId = dbModel.files(true).get("lastId").value();
let users = [...dbModel.users().value()];
let files = [...dbModel.files().value()];

const authGuard = (req) => {
  if (req.headers?.authorization) {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token || token === "null" || token === "undefined") {
      throw new Error("Не авторизован");
    }
    return token;
  }
};

const getUserFiles = (userId) => files.filter((item) => item.ownerId === userId);

const userResponse = ({ password, ...user }) => ({ ...user, files: getUserFiles(user.id) });

const handleRequest = async (fn, { res, req, useAuthGuard = true }) => {
  try {
    useAuthGuard && authGuard(req);
    const result = await fn();
    const data = await new Promise((resolve) => setTimeout(() => resolve(result), 200 + Math.random() * 1000));
    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(400).json({ errors: [{ message: e.message }], success: false });
  } finally {
    isConnected = false;
  }
};

const checkEmptyFields = (fieldsArr) => {
  fieldsArr.forEach((item) => {
    const [[key, value]] = Object.entries(item);
    if (!value) {
      throw new Error(`Поле ${key} не должно быть пустым`);
    }
  });
};

const generateToken = (data) => {
  return {
    access_token: jwt.sign({ data }, "jwt_secret", {
      expiresIn: "1d",
    }),
  };
};

const getUserByToken = (req, errMsg) => {
  const token = authGuard(req);
  if (Boolean(token)) {
    const email = jwt.verify(token, "jwt_secret")?.data?.email;
    if (!email) {
      throw new Error(errMsg || "Не авторизован");
    }
    const user = users.find((user) => user.email === email);
    if (!user) {
      throw new Error(errMsg || "Не авторизован");
    }
    return user;
  }
};

server.use(middlewares);

server.use(jsonServer.bodyParser);

server.use("*", (req, res, next) => {
  isConnected = true;
  dbModel.commitChanges();
  next();
});

server.get("/me", (req, res) => {
  handleRequest(
    async () => {
      const user = getUserByToken(req);
      let password;
      return { ...userResponse(user), password };
    },
    { res, req, authGuard: false }
  );
});

server.use("/users/update/:id", (req, res) => {
  if (req.method === "PUT") {
    handleRequest(
      async () => {
        const user = users.find((item) => item.id === parseInt(req.params.id, 10));

        if (!user) {
          throw new Error("Пользователь не найден");
        }

        const body = req.body;

        if (!body) {
          throw new Error("Не переданы данные для обновления пользователя");
        }

        users = users.map((item) => (item.id === user.id ? { ...item, ...body } : item));

        return users.map(userResponse);
      },
      { res, req }
    );
  }
});

server.use("/users/delete", (req, res) => {
  if (req.method === "DELETE") {
    handleRequest(
      async () => {
        const userIds = req.body;

        users = users.filter((item) => !userIds.includes(item.id));

        return users.map(userResponse);
      },
      { res, req }
    );
  }
});

server.get("/users", (req, res) => {
  handleRequest(
    async () => {
      return users.map(({ password, ...item }) => userResponse(item));
    },
    { res, req }
  );
});

server.post("/signin", (req, res) => {
  handleRequest(
    async () => {
      const { email, password } = req.body;
      checkEmptyFields([{ email }, { password }]);
      const user = users.find((user) => user.email === email);
      if (!user) {
        throw new Error("Некорректно введены email или пароль");
      }
      const isComparePassword = await compare(password, user.password);
      if (!isComparePassword) {
        throw new Error("Некорректно введены email или пароль");
      }
      return generateToken({ email });
    },
    { res, req, useAuthGuard: false }
  );
});

server.post("/signup", async (req, res) => {
  await handleRequest(
    async () => {
      const { username, email, password } = req.body;
      checkEmptyFields([{ username }, { email }, { password }]);
      const user = users.find((user) => user.email === email);
      if (user) {
        throw new Error("Пользователь с таким email уже зарегистрирован");
      }
      const newUser = {
        id: ++lastUserId,
        role: "admin",
        username,
        email,
        storage_size: 100,
      };

      users.push({ ...newUser, password: await hash(password, await genSalt(10)) });

      const response = { ...userResponse(newUser), ...generateToken({ email }) };
      return response;
    },
    { res, req, useAuthGuard: false }
  );
});

server.post("/files/load", async (req, res) => {
  await handleRequest(
    async () => {
      const fileData = req.body;
      if (!fileData) {
        throw new Error("Ошибка в данных файла");
      }
      const user = getUserByToken(req, "Пользователь не найден");
      const file = {
        ...fileData,
        id: ++lastFileId,
        ownerId: parseInt(user.id, 10),
        createdAt: new Date().toISOString(),
        downloadedAt: new Date().toISOString(),
      };
      files.push(file);
      return file;
    },
    { res, req }
  );
});

server.use("/files/update", async (req, res) => {
  if (req.method === "PUT") {
    await handleRequest(
      async () => {
        const fileData = req.body;
        if (!fileData) {
          throw new Error("Ошибка в данных файла");
        }
        files = files.map((item) => (item.id === fileData.id ? { ...item, ...fileData } : item));
        return fileData;
      },
      { res, req }
    );
  }
});

server.get("/files/copy/:fileId", async (req, res) => {
  await handleRequest(
    async () => {
      const { fileId } = req.params;

      const fileData = files.find((item) => item.id === parseInt(fileId, 10));

      if (!fileData) {
        throw new Error("Ошибка в данных файла");
      }

      const user = getUserByToken(req, "Пользователь не найден");

      const file = {
        ...fileData,
        id: ++lastFileId,
        ownerId: parseInt(user.id, 10),
        createdAt: new Date().toISOString(),
        downloadedAt: new Date().toISOString(),
      };
      files.push(file);
      return file;
    },
    { res, req }
  );
});

server.use("/files/delete/:fileId", async (req, res) => {
  if (req.method === "DELETE") {
    await handleRequest(
      async () => {
        const { fileId } = req.params;

        const fileData = files.find((item) => item.id === parseInt(fileId, 10));

        if (!fileData) {
          throw new Error("Ошибка в данных файла");
        }

        files = files.filter((item) => item.id !== parseInt(fileId, 10));

        return fileData;
      },
      { res, req }
    );
  }
});

server.use("/files/delete", async (req, res) => {
  if (req.method === "DELETE") {
    await handleRequest(
      async () => {
        const fileIds = req.body;
        files = files.filter((item) => !fileIds.includes(item.id));
        return files;
      },
      { res, req }
    );
  }
});

server.get("/files/download/:fileId", async (req, res) => {
  await handleRequest(
    async () => {
      const { fileId } = req.params;
      const file = files.find((item) => item.id === parseInt(fileId, 10));
      if (!file) {
        throw new Error("Файл не найден");
      }
      file.downloadedAt = new Date().toISOString();
      files = files.map((item) => (file.id === item.id ? file : item));
      dbModel.forceUpdate = ["files"];
      return file;
    },
    { res, req }
  );
});

const PORT = process.env.PORT || 3000;
const URL = process.env.MAIN_URL || "http://localhost:" + PORT;

server.use(routes);
server.listen(PORT, () => {
  console.log(`start mock server ${URL}`);
});
