const express = require('express');
const fs = require('fs');
const path = require('path');
const { checkBody, checkParams } = require('./validation/validator');
const { idScheme, userScheme } = require('./validation/scheme');

const app = express();

let uniqueID = 0;
const users = [];
if (fs.existsSync(path.join(__dirname, 'users.json'))) {
    users = JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json'), 'utf-8'));
}

app.use(express.json());

/**
 * Получить всех пользователей
 */
app.get('/users', (req, res) => {
    res.send({ users });
});

/**
 * Создание пользователя
 */
app.post('/users', checkBody(userScheme), (req, res) => {
    uniqueID += 1;

    users.push({
        id: uniqueID,
        ... req.body
    });

    fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users));

    res.send({
        id: uniqueID,
    });
});

/**
 * Обновление пользователя
 */
app.put('/users/:id', checkParams(idScheme), checkBody(userScheme), (req, res) => {
    const user = users
        .find((user) => user.id === Number(req.params.id));

    if (user) {
        user.firstName = req.body.firstName;
        user.secondName = req.body.secondName;
        user.age = req.body.age;
        user.city = req.body.city;

        fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users));

        res.send({ user });
    } else {
        res.status(404);
        res.send({ user: null });
    }
});

/**
 * Получить конкретного пользователя
 */
app.get('/users/:id', checkParams(idScheme), (req, res) => {
    const user = users
        .find((user) => user.id === Number(req.params.id));

    if (user) {
        res.send({ user });
    } else {
        res.status(404);
        res.send({ user: null });
    }
});

/**
 * Удаление пользователя
 */
app.delete('/users/:id', checkParams(idScheme), (req, res) => {
    const user = users
        .find((user) => user.id === Number(req.params.id));

    if (user) {
        const userIndex = users.indexOf(user);
        users.splice(userIndex, 1);

        fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users));

        res.send({ user });
    } else {
        res.status(404);
        res.send({ user: null });
    }
});

/**
 * Обработка несуществующих роутов
 */
app.use((req, res) => {
    res.status(404).send({ message: 'URL not found' })
});

const port = 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});