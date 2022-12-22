# medium-lite

Что бы запустить проект используйте команду

```shell
npm run dev
```

Оно запустится по порту [localhost:1000](http://localhost:1000)


**GET методы**

|  |  |
| --- | --- |
| [`/api/users`](http://localhost:1000/api/users) | Для получения зарегистрированных пользователей плюс пагинация |
| [`/api/user/:user_id`](http://localhost:1000/api/user/1) | Получения пользователя по id |
| [`/api/user/:user_id/posts`](http://localhost:1000/api/user/1/posts) | Получения всех постов пользователя плюс пагинация |
| [`/api/user/:user_id/post/:post_id`](http://localhost:1000/api/user/1/post/1) | Получения конкретного поста пользователя по id |


**POST методы**

|  |  |  |
| --- | --- | --- |
| [`/api/users/login`](http://localhost:1000/api/users/login) | Вход зарегистрированных пользователей в систему | В теле метода `email` и `password` |
| [`/api/users/register`](http://localhost:1000/api/users/register) | Регистрация пользователей в системе | В теле метода `email` и `password` |


**POST методы для которого нужен токен**

&#x26a0;&#xfe0f; Токен можно получить после `логина` или `регистрации`. Токен нужно отправить в `Headers Authorization`

|  |  |  |
| --- | --- | --- |
| [`/api/post/add`](http://localhost:1000/api/post/add) | Добавление поста | В теле метода `title` и `content` |
| [`/api/post/rating`](http://localhost:1000/api/post/rating) | Это для рейтинга постов | В теле метода `post_id` и `rating` |