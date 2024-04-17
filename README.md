# ft_transcendence_public
I have added a base .env at your disposal, you just have to get your API credentials for [Cloudinary](https://cloudinary.com/) and [intra](intra.42.fr)
for the intra API click on your login then settings, and on your left click on API and then register new APP, after that, fill in any name however in the Redirect URI field, you need two links split by a newline, `http://hostname:3000/twoFactorAuth` and `http://hostname:3001/auth/signin`, in case you decided to test the app on the same machine, hostname is `localhost` and make sure it is localhost in `/frontend/.env.local` also, otherwise it will be the IP of the machine and dont forget to update `/frontend/.env.local` accordingly,
**NOTE**
  the hostname in the intra's redirect URI should be exactly the same in the `FT_CALLBACK` and `FT_CALLBACK2`, and dont forget `/frontend/.env.local`.

after this set up you should be good to go just run the following command and wait for the app to run
`docker compose up --build`

### things to note during testing
* a user can not match with themselves
* a user can not chat with themselseves
* a user is required to have a nickname otherwise they won't have access to any website's ressouerces and they will be invisible to other users
* if a user lost their 2FA OTP there is no way to retrieve it
* of course you need at least 2 intra accounts to actually test all the features
* the owner of a channel is of course a higher grade, they can assign new admins, downgrade them kick users , change channel's permissions,etc...
* Have fun (this website was hosted locally at 1337 for 4 hours while at least 100 users were playing and all the data was updated in realtime except the leaderboard)
