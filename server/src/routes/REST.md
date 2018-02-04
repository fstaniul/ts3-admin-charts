# Routes defined in this REST Api

### /api
  - `/users`
     - **GET**: Returns list of all users registered in the service
     ```javascript
     users: [{
         uuid: string /* User's unqiue indentified */
         username: string  /* User's username. */
         administrator: boolean /* Wheter a user is an administrator or not */
         accepted: boolean /* Wheter a user is accepted or not */
         createdAt: Date /* Date when user was created */
         updatedAt: Date /* Date when user was last updated */
     }]
     ```
     - **POST**: Creates new user account from passed creadentials: `username`, `password` and `passwordRepeat`.
     - **PATCH**: Edits a user state (depending on passed information): `uuid`, `accepted`, `administrator`, where it updates data on user pointed by `uuid`.
  - `/users/:uuid`
    - **PATCH**: Updated user password if the one requesting is the user for which password is being changed. Request data: `password` and `passwordRepeat`.
    - **DELETE**: Deletes user pointed by `uuid`.
  - `/ts3admins`
    - **GET**: Returns list of actual teamspeak 3 administrators.
  - `/reg`
    - **GET**: Returns data for chart.js to display count of registered clients by administrators. Query parameters: `ids`, `from`, `to`.
### /auth
  - **POST**: Checks clients passed credentials for logging in and returns clients data with a secret generated JWT token used for authroization agains api. Required credentials `username` and `password`.