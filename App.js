/* =========================
   SOCIAL X
   Firebase Connected
========================= */

let currentPage = "home";

const content = document.getElementById("content");
const loginModal = document.getElementById("loginModal");
const postModal = document.getElementById("postModal");


/* =========================
   HOME
========================= */

function showHome() {

    const user = firebase.auth().currentUser;

    if (user) {

        content.innerHTML = `

            <div class="card">

                <div class="createCard">

                    <div class="avatar">
                        👤
                    </div>

                    <button
                        class="createInput"
                        onclick="openPost()">

                        ✨ Create your first post...

                    </button>

                </div>

            </div>

            <div class="card empty">

                <div class="emptyIcon">
                    🎬
                </div>

                <h2>
                    No Posts Yet 😏
                </h2>

                <p>
                    Create your first post and share it with Social X.
                </p>

                <button
                    class="primary"
                    onclick="openPost()">

                    ➕ Create Post

                </button>

            </div>

        `;

    } else {

        content.innerHTML = `

            <div class="card">

                <div class="createCard">

                    <div class="avatar">
                        ?
                    </div>

                    <button
                        class="createInput"
                        onclick="openLogin()">

                        🔐 Login to create a post...

                    </button>

                </div>

            </div>

            <div class="card empty">

                <div class="emptyIcon">
                    🎬
                </div>

                <h2>
                    No Posts Yet 😏
                </h2>

                <p>
                    Login to create your first post.
                </p>

                <button
                    class="primary"
                    onclick="openLogin()">

                    ✨ Login / Sign Up

                </button>

            </div>

        `;
    }
}
/* =========================
   EXPLORE
========================= */

function showExplore() {

    content.innerHTML = `
        <div class="card">

            <h2>🔎 Explore</h2>

            <p>
                Create Account Not Imagination.
            </p>

        </div>

        <div class="card empty">

            <div class="emptyIcon">
                🌎
            </div>

            <h2>
                Explore Real Social X Content
            </h2>

            <p>
                Real posts and reels will appear here.
            </p>

        </div>
    `;
}


/* =========================
   CREATE
========================= */

function showCreate() {
    openPost();
}


/* =========================
   NOTIFICATIONS
========================= */

function showNotifications() {

    content.innerHTML = `
        <div class="card empty">

            <div class="emptyIcon">
                🔔
            </div>

            <h2>
                No notifications
            </h2>

            <p>
                Your notifications will appear here.
            </p>

        </div>
    `;
}


/* =========================
   MESSAGES
========================= */

function showMessages() {

    content.innerHTML = `
        <div class="card empty">

            <div class="emptyIcon">
                💬
            </div>

            <h2>
                No messages
            </h2>

            <p>
                Your messages will appear here.
            </p>

        </div>
    `;
}


/* =========================
   PROFILE
========================= */

function showProfile() {

    const user = firebase.auth().currentUser;

    if (user) {

        content.innerHTML = `

            <div class="card">

                <div class="cover"></div>

                <div class="profileInfo">

                    <div class="avatar profileAvatar">
                        👤
                    </div>

                    <h2>
                        Your Profile
                    </h2>

                    <p>
                        ${user.email}
                    </p>

                    <button
                        class="secondary"
                        onclick="logout()">

                        🚪 Logout

                    </button>

                </div>

            </div>

            <div class="card empty">

                <div class="emptyIcon">
                    📸
                </div>

                <h3>
                    Your posts will appear here
                </h3>

            </div>
        `;

    } else {

        content.innerHTML = `

            <div class="card">

                <div class="cover"></div>

                <div class="profileInfo">

                    <div class="avatar profileAvatar">
                        ?
                    </div>

                    <h2>
                        Your Profile
                    </h2>

                    <p>
                        Please login or create an account.
                    </p>

                    <button
                        class="primary"
                        onclick="openLogin()">

                        🔐 Login / Sign Up

                    </button>

                </div>

            </div>
        `;
    }
}


/* =========================
   SETTINGS
========================= */

function showSettings() {

    content.innerHTML = `

        <div class="card">

            <h2>⚙️ Settings</h2>

            <hr>

            <h3>👤 Account</h3>

            <p>Profile information</p>

            <p>🔑 Password & Security</p>

            <p>📧 Email</p>

            <hr>

            <h3>🔒 Privacy</h3>

            <p>Private Account</p>

            <p>🚫 Blocked Accounts</p>

            <p>🛡️ Security</p>

            <hr>

            <h3>🔔 Notifications</h3>

            <p>Likes</p>

            <p>Comments</p>

            <p>Followers</p>

            <hr>

            <h3>🎨 Appearance</h3>

            <button
                class="secondary"
                onclick="toggleDarkMode()">

                🌙 Toggle Dark Mode

            </button>

            <hr>

            <h3>ℹ️ About</h3>

            <p>Social X</p>

            <p>Version 1.0</p>

        </div>
    `;
}


/* =========================
   PAGE ROUTER
========================= */

function render() {

    if (currentPage === "home") {
        showHome();
    }

    else if (currentPage === "explore") {
        showExplore();
    }

    else if (currentPage === "create") {
        showCreate();
    }

    else if (currentPage === "notifications") {
        showNotifications();
    }

    else if (currentPage === "messages") {
        showMessages();
    }

    else if (currentPage === "profile") {
        showProfile();
    }

    else if (currentPage === "settings") {
        showSettings();
    }
}


/* =========================
   NAVIGATION
========================= */

document
    .querySelectorAll(".menu")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                currentPage = this.dataset.page;

                document
                    .querySelectorAll(".menu")
                    .forEach(item => {

                        item.classList.remove("active");

                    });

                this.classList.add("active");

                render();

            }
        );

    });


/* =========================
   LOGIN MODAL
========================= */

function openLogin() {

    loginModal.classList.remove("hidden");

}


function closeLogin() {

    loginModal.classList.add("hidden");

}


/* =========================
   FIREBASE SIGN UP
========================= */

function signup() {

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    if (!email || !password) {

        alert("Please enter email and password.");

        return;
    }

    if (password.length < 6) {

        alert("Password must be at least 6 characters.");

        return;
    }

    firebase.auth()
        .createUserWithEmailAndPassword(
            email,
            password
        )
        .then(function(userCredential) {

            alert("Account created successfully! 🎉");

            closeLogin();

            render();

        })
        .catch(function(error) {

            console.error(error);

            alert(error.message);

        });
}


/* =========================
   FIREBASE LOGIN
========================= */

function login() {

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    if (!email || !password) {

        alert("Please enter email and password.");

        return;
    }

    firebase.auth()
        .signInWithEmailAndPassword(
            email,
            password
        )
        .then(function(userCredential) {

            alert("Login successful! 🎉");

            closeLogin();

            render();

        })
        .catch(function(error) {

            console.error(error);

            alert(error.message);

        });
}


/* =========================
   LOGOUT
========================= */

function logout() {

    firebase.auth()
        .signOut()
        .then(function() {

            alert("Logged out successfully.");

            render();

        })
        .catch(function(error) {

            console.error(error);

            alert(error.message);

        });
}


/* =========================
   FIREBASE AUTH STATE
========================= */

firebase.auth().onAuthStateChanged(
    function(user) {

        if (user) {

            console.log(
                "Logged in:",
                user.email
            );

        } else {

            console.log(
                "No user logged in."
            );

        }

        render();

    }
);


/* =========================
   CREATE POST
========================= */

function openPost() {

    postModal.classList.remove("hidden");

}


function closePost() {

    postModal.classList.add("hidden");

}


function createPost() {

    const user = firebase.auth().currentUser;

    if (!user) {
        alert("Please login first.");
        openLogin();
        return;
    }

    const fileInput =
        document.getElementById("postFile");

    const text =
        document.getElementById("postText").value.trim();

    const location =
        document.getElementById("location").value.trim();

    const hashtags =
        document.getElementById("hashtags").value.trim();

    const file = fileInput.files[0];

    if (!file) {
        alert("Please select an image or video.");
        return;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "video/mp4",
        "video/webm"
    ];

    if (!allowedTypes.includes(file.type)) {
        alert("Please select a valid image or video.");
        return;
    }

    const maxSize = 50 * 1024 * 1024;

    if (file.size > maxSize) {
        alert("File must be smaller than 50 MB.");
        return;
    }

    const button =
        document.querySelector(
            '#postModal button[onclick="createPost()"]'
        );

    if (button) {
        button.disabled = true;
        button.innerText = "⏳ Uploading...";
    }

    const fileName =
        Date.now() + "_" + file.name;

    const storageRef =
        firebase.storage()
            .ref()
            .child("posts/" + user.uid + "/" + fileName);

    storageRef
        .put(file)
        .then(function(snapshot) {

            return snapshot.ref.getDownloadURL();

        })
        .then(function(downloadURL) {

            return firebase.firestore()
                .collection("posts")
                .add({

                    uid: user.uid,

                    email: user.email,

                    text: text,

                    location: location,

                    hashtags: hashtags,

                    mediaURL: downloadURL,

                    mediaType: file.type.startsWith("video/")
                        ? "video"
                        : "image",

                    createdAt:
                        firebase.firestore.FieldValue.serverTimestamp()

                });

        })
        .then(function() {

            alert("Post uploaded successfully! 🎉");

            document.getElementById("postFile").value = "";
            document.getElementById("postText").value = "";
            document.getElementById("location").value = "";
            document.getElementById("hashtags").value = "";

            closePost();

            if (button) {
                button.disabled = false;
                button.innerText = "🚀 Post";
            }

        })
        .catch(function(error) {

            console.error("Post upload error:", error);

            alert(
                "Post upload failed: " +
                error.message
            );

            if (button) {
                button.disabled = false;
                button.innerText = "🚀 Post";
            }

        });

}


/* =========================
   DARK MODE
========================= */

function toggleDarkMode() {

    document.body.classList.toggle("dark");

}


/* =========================
   SEARCH
========================= */

document
    .getElementById("search")
    .addEventListener(
        "input",
        function() {

            console.log(
                "Searching:",
                this.value
            );

        }
    );


/* =========================
   START
========================= */

render();
