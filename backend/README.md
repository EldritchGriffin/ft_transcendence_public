# ft_transcendence
until now most of the api is ready here are some routes (still need to include the nicknames in the queries)
**NOTE!!!**
to start using the api you need to first sign in using the /auth/signin endpoint provide the username and password in the body as a key value , (username your nickname and password 123 e.g {username:sixe,password:123}) you will be provided with a jwt token valid for 24h add it to the header of every request as a bearer token. to start the api here are the follow these steps
1. run the docker container (u need to create the volumes path)
```
docker compose up --build -d
```
2. run prisma to migrate and generate the objects to interact with the database.
```
npx prisma migrate dev
```
```
npx prisma generate
```
```
npx prisma studio
```
3. run the api in watch mode
```
npm run start:dev
```
## Backend
**GET**
```
GET /leaderboard        returns the user ranked from the highes to the lowest based on the performance
```
```
GET /users/me           returns the logged in user
```
```
GET /users/:user        returns the searche user with their match history friends...
```
**POST**
```
POST /auth/signin       takes in a user and pass (temporarily) returns the logged in user
```

```
POST /auth/signup       adds a new user to the db (will be modified)
```

the `/users/*` routes are protected by a `UserGuard` where a blocked user cannot access other's info

```
POST /users/addfriend/:user sends a friend request to the provided user
```

```
POST /users/removefriend/:user removes the user from the caller's friend list
```

```
POST /users/acceptfriend/:user  accepts the user's friend request if they are requesting
```

```
POST /users/rejectfriend/:user rejects a friend request
```

```
POST /users/cancelfriend/:user cancels the friend request
```

```
POST /users/blockfriend/:user blocks a user from all the users ressources
```