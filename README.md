## ☁️ Облачное хранилище «MyCloud»

На примере виртуального сервера с адресом
http://79.174.94.12

## Развёртывание проекта локально

-   Клонировать репозиторий:

```
git clone [<repo_url>](https://github.com/escapefromserpukhov/oblako_fullstack.git )
```

-   Активировать виртуальное окружение и установить зависимости:

```
cd <dir_to_repo>
```

```
python3 -m venv venv
```

```
source ./venv/bin/activate
```

```
cd ./backend
```

```
pip install -r requirements.txt
```

-   Создать базу данных PostgreSQL
    Пример:

```
sudo su postgres
```

```
psql
```

```
CREATE DATABASE oblakodb;
```

```
CREATE USER student WITH PASSWORD 'student';
```

```
GRANT ALL PRIVILEGES ON DATABASE oblakodb TO student;
```

```
\q
```

```
exit
```

-   Перейти в каталог /backend `cd /backend` и создать файл `.env` для задания переменных окружения:
    Пример:

```
DB_NAME=oblakodb
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=student
DB_PASS=student
DB_ENGINE=django.db.backends.postgresql
DEBUG=true
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
LOGGER=true
```

-   Выполнить миграции в директории /backend

```
python3 manage.py makemigrations
```

```
python3 manage.py migrate
```

-   Запустить бэкенд приложения находясь в каталоге backend:

```
python3 manage.py runserver
```

-   Перейти в директорию `/frontend` установить NPM зависимости.

```
npm install
```

-   В директории frontend создать файл `.env` для задания переменных окружения:

```
MAIN_URL=http://localhost:8000
```

-   Запустить фронтенд приложения находясь в каталоге frontend:

```
npm run dev:py-backend
```

## 🤖 Развертывание на сервере

-   Подключиться к серверу

```
ssh root@<IP сервера>
```

-   Создать пользователя, дать права и подключиться:

```
adduser user
```

```
usermod user -aG sudo
```

```
su - user
```

-   Обновить пакеты, установить новые

```
sudo apt update
```

```
sudo apt upgrade
```

```
sudo apt install python3-venv python3-pip postgresql nginx npm
```

```
Если будет ошибка связанная с psycopg2 (libpq-fe.h) то попробовать установить:
sudo apt install --reinstall libpq-dev
```

-   Обновить nodejs до стабильной актуальной версии:

```
sudo npm cache clean -f
```

```
sudo npm install -g n
```

```
sudo n stable
```

-   Установить pm2

```
sudo npm i pm2 -g
```

-   Проверить, что Nginx запущен

```
sudo systemctl start nginx
```

```
sudo systemctl status nginx
```

-   Клонировать репозиторий и перейти в него

```
git clone <repo_url>
```

```
cd <dir_to_repo>
```

### База данных

-   Создать базу данных PostgreSQL
    Пример:

```
sudo su postgres
```

```
psql
```

```
CREATE DATABASE oblakodb;
```

```
CREATE USER student WITH PASSWORD 'student';
```

```
GRANT ALL PRIVILEGES ON DATABASE oblakodb TO student;
```

```
\q
```

```
exit
```

### Фронтенд

Замечание - важно начать с фронтэнда, т.к. в директории backend понадобится билд фронта

-   Перейти в директорию `/frontend`, установить NPM зависимости

```
npm install
```

-   В директории frontend создать файл `.env` для задания основного урла куда будет обращаться апи фронта в данном случае нужно указать домен или ip-адрес:

```
MAIN_URL=http://79.174.94.12
```

-   Запустить скрипт для формирования билда для бэкенда:

```
npm run build:django-prod
```

### Бэкенд

-   В корне каталога склонированного репозитория создать и активировать виртуальное окружение

```
python3 -m venv venv
source ./venv/bin/activate
```

-   Перейти в каталог backend `cd ./backend`, создать файл `.env` в директории для указания переменных

```
DB_NAME=oblakodb
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=student
DB_PASS=student
DB_ENGINE=django.db.backends.postgresql
DEBUG=false
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
LOGGER=true
```

-   Создать директорию logs и файл в нем django.log

```
mkdir logs
touch ./logs/django.log
```

или в .env файле прописать LOGGER=false
иначе будут ошибки при создании миграций

-   Установить зависимости Python, применить миграции, создать статик файлы и запустить бэкенд через pm2

```
pip install -r requirements.txt
```

```
python3 manage.py makemigrations
```

```
python3 manage.py migrate
```

```
python3 manage.py collectstatic
```

```
pm2 --name=oblako-api start "gunicorn oblako.wsgi"
```

Бэкенд проекта запущен но - http://127.0.0.1:8000

-   Опциональное команды не обязательные для выполнения (для справки)

```
pm2 status - посмотреть список запущенных процессов
pm2 kill - остановка процессов
pm2 save - сохранить текущее состояние процессов (если что-то упадет pm2 попытается восстановить)
```

### Конфиг Nginx

```
sudo nano /etc/nginx/sites-available/default
```

В самом верху файла вставить

```
server {
    server_name 79.174.94.12; # указать домен или ip-адрес

    index index.php index.html index.htm index.nginx-debian.html;

    location / {
        proxy_pass http://localhost:8000; # указать где запущен бэкенд
    }
}
```

-   Открыть порты и дать права Nginx

```
sudo ufw allow 8000
```

```
sudo ufw allow 80
```

```
sudo ufw allow 'Nginx Full'
```

-   Проверить, что nginx активен

```
sudo systemctl status nginx
```

-   Перезагрузить nginx

```
sudo systemctl restart nginx
```

Проект Django + React должен быть полностью доступен по http://79.174.94.12 на обычном порту 80.

## Структура проекта

Проект основан на Django и включает в себя два приложения:

-   backend - бэкенд часть проекта, реализованная на django rest framework
-   frontend - фронтенд часть проекта, которая реализована на react, redux, react-router

Связь фронденда с бекендом осуществляется через билд фронта, находящийся в директории `backend/frontend/index.html`. В django прописан url по дефолту на эту директорию

## Создание пользователя, регистрация

### Регистрация

По пути http://79.174.94.12/signup находится форма регистрации пользователя

Создать администратора вы можете регистрационной форме сайта.
По дефолту при регистрации выдаются права администратора.

После регистрации или входа в приложение в навигационном меню есть две вкладки:

-   Мое хранилище (доступно всем пользователям)
-   Список пользователей (доступно админам)

В шапке навигационного меню присутствует кнопка выход, чтобы выйти из приложения

## Основной функционал

### Добавление файла

Добавить файл в хранилище вы можете через кнопку `Загрузить файл` в верхнем левом углу на панели страницы "Мое хранилище". Добавление файлов осуществляется по одному. Перед отправкой файла появится модальное окно с возможностью задать комментарий и ваше имя файла

### Удаление, переименование, комментарий

При добавлении файла в таблице на панели страницы "Мое хранилище" отобразится данный файл, слева по записи таблицы присутствует "ручка" при нажатии на которую появится модальное окно с настройкой файла.
В ячейках таблицы присутствует чекбокс для выделения файла или файлов которые необходимо удалить (при выделении файлов кнопка "Удалить выбранное" становится активной) Так же кнопка удаления есть и в самой форме с настройкой файла.

В ячейках таблицы есть иконка скачать файл и иконка получения ссылки через копирования в буфер.
При наведении на иконки появится подсказка

Во вкладке "Список пользователей" таблица с пользователями, слева по записи в таблице есть toggle элемент для переключения роли(прав) пользователя при нажатии на запись таблицы появляется модальное окно с его хранилищем, весь функционал доступен как во вкладке "Мое хранилище"

Выделяя пользователей становится активна кнопка "Удалить выбранных", для удаления пользователя.
По умолчанию профиль под которым вы зашли будет вначале таблицы.
Во вкладке присутствует поиск пользователей по нику
Присутствует кнопка обновить таблицу
