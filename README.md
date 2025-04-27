# Real-Time Collaborative 3D Scene Manager

This project is a backend system that enables users to create, read, update, and delete 3D scenes and collaborate on them in real-time.

## Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/jitheshjustin305/backendproject](https://github.com/jitheshjustin305/backendproject)
    cd backendproject  
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Start the server:**

    ```bash
    npm start or node server.js
    ```

    The server will be running on [http://localhost:3000](http://localhost:3000).

## API Endpoints

### User Authentication

* `POST /signup` - Create a new user.
    * Request body: `{ "username": "your_username", "password": "your_password" }`
* `POST /login` - Log in a user.
    * Request body: `{ "username": "your_username", "password": "your_password" }`
    * Response: `{ "token": "your_jwt_token" }`

### Scene Management (Protected with JWT)

* `POST /scenes` - Create a new scene.
    * Request Headers: `Authorization: Bearer your_jwt_token`
    * Request body: `{ "name": "Scene Name", "objects": [] }`
* `GET /scenes/:id` - Get scene details.
    * Request Headers: `Authorization: Bearer your_jwt_token`
    * Parameters:
        * `id`: The ID of the scene to retrieve (e.g., `scene1`).  ✅ (Added for clarity)
* `PATCH /scenes/:id` - Update scene.
    * Request Headers: `Authorization: Bearer your_jwt_token`
    * Request body: `{ "name": "New Scene Name", "objects": [...] }` (You can update name or objects or both)
    * Parameters:
        * `id`: The ID of the scene to update (e.g., `scene1`).  ✅ (Added for clarity)
* `DELETE /scenes/:id` - Delete scene.
    * Request Headers: `Authorization: Bearer your_jwt_token`
    * Parameters:
        * `id`: The ID of the scene to delete (e.g., `scene1`).  ✅ (Added for clarity)

### Real-Time Collaboration (WebSocket)

* Clients connect to the server via WebSocket.
* Clients join a scene using the `joinScene` event:
    * `socket.emit('joinScene', 'scene1');`
* Object updates are sent using the `objectUpdated` event:
    * `socket.emit('objectUpdated', { sceneId: 'scene1', objectId: 'obj1', position: { x: 1, y: 2, z: 3 } });`
* Object creation is sent using the `objectCreated` event:
    * `socket.emit('objectCreated', { sceneId: 'scene1', id: 'newObj', type: 'cube', position: { x: 0, y: 0, z: 0 } });`
* Object deletion is sent using the `objectDeleted` event:
    * `socket.emit('objectDeleted', { sceneId: 'scene1', objectId: 'obj1' });`
* The server broadcasts these events to all clients in the same scene.

## Sample User Credentials

* **Username:** testuser
* **Password:** testpassword

## Postman Collection/cURL Examples

### User Authentication

* **Signup:**

    ```bash
    curl -X POST -H "Content-Type: application/json" -d "{ \"username\": \"testuser\", \"password\": \"testpassword\" }" http://localhost:3000/signup
    ```

* **Login:**

    ```bash
    curl -X POST -H "Content-Type: application/json" -d "{ \"username\": \"testuser\", \"password\": \"testpassword\" }" http://localhost:3000/login
    ```

    _(This will return a JWT token in the response. You'll need to copy this token for the following requests.)_

### Scene Management (Protected with JWT)

* **Create Scene:**

    ```bash
    curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <your_jwt_token>" -d "{ \"name\": \"Test Scene\", \"objects\": [] }" http://localhost:3000/scenes
    ```

    _(Replace `<your_jwt_token>` with the actual token.)_

* **Get Scene Details:**

    ```bash
    curl -X GET -H "Authorization: Bearer <your_jwt_token>" http://localhost:3000/scenes/scene1
    ```

    _(Replace `<your_jwt_token>` and `scene1` with the actual scene ID.)_

* **Update Scene:**

    ```bash
    curl -X PATCH -H "Content-Type: application/json" -H "Authorization: Bearer <your_jwt_token>" -d "{ \"name\": \"Updated Scene Name\" }" http://localhost:3000/scenes/scene1
    ```

    _(Replace `<your_jwt_token>` and `scene1`.)_

* **Delete Scene:**

    ```bash
    curl -X DELETE -H "Authorization: Bearer <your_jwt_token>" http://localhost:3000/scenes/scene1
    ```

    _(Replace `<your_jwt_token>` and `scene1`.)_

## Notes

* This project uses in-memory data storage. Data is not persisted across server restarts.
* The real-time collaboration is implemented using Socket.IO.

## Author

Jithesh Kudipudi