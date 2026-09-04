/* =====================================================
   SOCIAL X
   APP.JS
   COMPLETE VERSION
   ===================================================== */

const CLOUDINARY_CLOUD_NAME = "Wahohh6w";
const CLOUDINARY_UPLOAD_PRESET = "socialx";

let currentPage = "home";
let currentChatUser = null;
let unsubscribeMessages = null;
let unsubscribeTyping = null;
let typingTimer = null;


/* =====================================================
   MAIN ELEMENTS
===================================================== */

const content = document.getElementById("content");
const loginModal = document.getElementById("loginModal");
const postModal = document.getElementById("postModal");


/* =====================================================
   HELPERS
===================================================== */

function clean(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
}


function authEmail(username) {
    return username.toLowerCase() + "@socialx.local";
}


function chatId(a, b) {
    return [a, b].sort().join("_");
}


/* =====================================================
   LOGIN MODAL
===================================================== */

function openLogin() {
    if (loginModal) {
        loginModal.classList.remove("hidden");
    }
}


function closeLogin() {
    if (loginModal) {
        loginModal.classList.add("hidden");
    }
}


function openLoginBox() {
    openLogin();
    switchToLogin();
}


/* =====================================================
   POST MODAL
===================================================== */

function openPost() {
    if (postModal) {
        postModal.classList.remove("hidden");
    }
}


function closePost() {
    if (postModal) {
        postModal.classList.add("hidden");
    }
}


/* =====================================================
   DARK MODE
===================================================== */

function toggleDarkMode() {
    document.body.classList.toggle("dark");

    localStorage.setItem(
        "socialx_dark",
        document.body.classList.contains("dark")
    );
}


function loadDarkMode() {
    if (
        localStorage.getItem("socialx_dark") === "true"
    ) {
        document.body.classList.add("dark");
    }
}


/* =====================================================
   HOME
===================================================== */

function showHome() {

    currentPage = "home";

    if (!content) return;

    content.innerHTML = `
        <div class="page">

            <h1>Home 🏠</h1>

            <div id="posts">

                <div class="card">
                    <h3>Welcome to Social X 👋</h3>
                    <p>Loading posts...</p>
                </div>

            </div>

        </div>
    `;

    loadPosts();
}


/* =====================================================
   EXPLORE
===================================================== */

function showExplore() {

    currentPage = "explore";

    if (!content) return;

    content.innerHTML = `
        <div class="page">

            <h1>Explore 🔎</h1>

            <div class="card">

                <p>
                    Search and discover people
                    on Social X.
                </p>

                <input
                    id="exploreSearch"
                    type="text"
                    placeholder="Search users..."
                >

                <button
                    class="primary"
                    type="button"
                    onclick="searchUsers()">

                    Search

                </button>

                <div id="searchResults"></div>

            </div>

        </div>
    `;
}


/* =====================================================
   CREATE
===================================================== */

function showCreate() {

    currentPage = "create";

    if (!content) return;

    content.innerHTML = `
        <div class="page">

            <h1>Create Post ➕</h1>

            <div class="card">

                <p>
                    Share something with Social X.
                </p>

                <button
                    class="primary"
                    type="button"
                    onclick="openPost()">

                    ➕ Create a Post

                </button>

            </div>

        </div>
    `;
}


/* =====================================================
   NOTIFICATIONS
===================================================== */

function showNotifications() {

    currentPage = "notifications";

    if (!content) return;

    content.innerHTML = `
        <div class="page">

            <h1>Notifications 🔔</h1>

            <div class="card">

                <p>
                    No notifications yet.
                </p>

            </div>

        </div>
    `;
}


/* =====================================================
   MESSAGES
===================================================== */

function showMessages() {

    currentPage = "messages";

    if (!content) return;

    content.innerHTML = `
        <div class="page">

            <h1>Messages 💬</h1>

            <div class="card">

                <p>
                    Search for a user in Explore
                    to start a conversation.
                </p>

            </div>

        </div>
    `;
}


/* =====================================================
   PROFILE
===================================================== */

async function showProfile() {

    currentPage = "profile";

    if (!content) return;

    const user =
        firebase.auth().currentUser;

    if (!user) {
        openLoginBox();
        return;
    }

    let username =
        user.email
            ? user.email.split("@")[0]
            : "user";

    try {

        const doc =
            await firebase.firestore()
                .collection("users")
                .doc(user.uid)
                .get();

        if (doc.exists) {

            const data = doc.data();

            if (data.username) {
                username = data.username;
            }

        }

    } catch (error) {

        console.error(error);

    }

    content.innerHTML = `
        <div class="page">

            <h1>Profile 👤</h1>

            <div class="card">

                <div class="bigLogo">
                    X
                </div>

                <h2>
                    @${clean(username)}
                </h2>

                <p>
                    Welcome to your Social X profile.
                </p>

            </div>

        </div>
    `;
}


/* =====================================================
   SETTINGS
===================================================== */

function showSettings() {

    currentPage = "settings";

    if (!content) return;

    content.innerHTML = `
        <div class="page">

            <h1>Settings ⚙️</h1>

            <div class="card">

                <button
                    class="secondary full"
                    type="button"
                    onclick="toggleDarkMode()">

                    🌙 Toggle Dark Mode

                </button>

                <br><br>

                <button
                    class="primary full"
                    type="button"
                    onclick="logout()">

                    Logout

                </button>

            </div>

        </div>
    `;
}


/* =====================================================
   LOGIN
===================================================== */

function loginUser() {

    const usernameInput =
        document.getElementById("username");

    const passwordInput =
        document.getElementById("password");

    if (!usernameInput || !passwordInput) {

        alert("Login fields not found.");

        return;
    }

    const username =
        usernameInput.value.trim();

    const password =
        passwordInput.value.trim();

    if (!username || !password) {

        alert(
            "Please enter username and password."
        );

        return;
    }

    if (typeof firebase === "undefined") {

        alert("Firebase is not connected.");

        return;
    }

    const email =
        authEmail(username);

    firebase.auth()
        .signInWithEmailAndPassword(
            email,
            password
        )
        .then(() => {

            closeLogin();

            showHome();

        })
        .catch((error) => {

            console.error(error);

            alert(
                "Login failed: " +
                error.message
            );

        });
}


/* =====================================================
   REGISTER
===================================================== */

function registerUser() {

    const usernameInput =
        document.getElementById("username");

    const passwordInput =
        document.getElementById("password");

    if (!usernameInput || !passwordInput) {

        alert("Signup fields not found.");

        return;
    }

    const username =
        usernameInput.value.trim();

    const password =
        passwordInput.value.trim();

    if (!username || !password) {

        alert(
            "Please enter username and password."
        );

        return;
    }

    if (username.length < 3) {

        alert(
            "Username must be at least 3 characters."
        );

        return;
    }

    if (password.length < 6) {

        alert(
            "Password must be at least 6 characters."
        );

        return;
    }

    const email =
        authEmail(username);

    firebase.auth()
        .createUserWithEmailAndPassword(
            email,
            password
        )
        .then((result) => {

            return firebase.firestore()
                .collection("users")
                .doc(result.user.uid)
                .set({

                    uid: result.user.uid,

                    username: username,

                    usernameLower:
                        username.toLowerCase(),

                    createdAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                });

        })
        .then(() => {

            alert(
                "Account created successfully! 🎉"
            );

            closeLogin();

            showHome();

        })
        .catch((error) => {

            console.error(error);

            alert(error.message);

        });
}


/* =====================================================
   LOGIN / SIGNUP SWITCH
===================================================== */

function switchToLogin() {

    const title =
        document.getElementById("loginTitle");

    const actionButton =
        document.getElementById("loginAction");

    const switchButton =
        document.getElementById("switchAuth");

    if (title) {
        title.textContent = "Login";
    }

    if (actionButton) {

        actionButton.textContent =
            "Login";

        actionButton.onclick =
            loginUser;
    }

    if (switchButton) {

        switchButton.textContent =
            "Create a new account";

        switchButton.onclick =
            switchToSignup;
    }
}


function switchToSignup() {

    const title =
        document.getElementById("loginTitle");

    const actionButton =
        document.getElementById("loginAction");

    const switchButton =
        document.getElementById("switchAuth");

    if (title) {

        title.textContent =
            "Create Account";
    }

    if (actionButton) {

        actionButton.textContent =
            "Sign Up";

        actionButton.onclick =
            registerUser;
    }

    if (switchButton) {

        switchButton.textContent =
            "Already have an account? Login";

        switchButton.onclick =
            switchToLogin;
    }
}


/* =====================================================
   LOGOUT
===================================================== */

function logout() {

    if (typeof firebase === "undefined") {
        return;
    }

    firebase.auth()
        .signOut()
        .then(() => {

            currentChatUser = null;

            if (unsubscribeMessages) {

                unsubscribeMessages();

                unsubscribeMessages = null;
            }

            if (unsubscribeTyping) {

                unsubscribeTyping();

                unsubscribeTyping = null;
            }

            showHome();

            alert(
                "Logged out successfully."
            );

        })
        .catch((error) => {

            console.error(error);

            alert(error.message);

        });
}


/* =====================================================
   CREATE POST
===================================================== */

async function createPost() {

    const textInput =
        document.getElementById("postText");

    const imageInput =
        document.getElementById("postImage");

    const locationInput =
        document.getElementById("location");

    const hashtagsInput =
        document.getElementById("hashtags");

    const text =
        textInput
            ? textInput.value.trim()
            : "";

    const file =
        imageInput &&
        imageInput.files
            ? imageInput.files[0]
            : null;

    const location =
        locationInput
            ? locationInput.value.trim()
            : "";

    const hashtags =
        hashtagsInput
            ? hashtagsInput.value.trim()
            : "";

    if (!text && !file) {

        alert(
            "Write something or select an image."
        );

        return;
    }

    const user =
        firebase.auth().currentUser;

    if (!user) {

        alert("Please login first.");

        openLoginBox();

        return;
    }

    let imageUrl = "";

    try {

        if (file) {

            const formData =
                new FormData();

            formData.append(
                "file",
                file
            );

            formData.append(
                "upload_preset",
                CLOUDINARY_UPLOAD_PRESET
            );

            const response =
                await fetch(
                    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                    {
                        method: "POST",
                        body: formData
                    }
                );

            if (!response.ok) {

                throw new Error(
                    "Image upload failed."
                );
            }

            const data =
                await response.json();

            imageUrl =
                data.secure_url || "";
        }


        let username =
            user.email
                ? user.email.split("@")[0]
                : "user";


        const userDoc =
            await firebase.firestore()
                .collection("users")
                .doc(user.uid)
                .get();


        if (userDoc.exists) {

            const userData =
                userDoc.data();

            if (userData.username) {

                username =
                    userData.username;
            }
        }


        await firebase.firestore()
            .collection("posts")
            .add({

                uid: user.uid,

                username: username,

                text: text,

                image: imageUrl,

                location: location,

                hashtags: hashtags,

                likes: [],

                createdAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });


        if (textInput) {
            textInput.value = "";
        }

        if (imageInput) {
            imageInput.value = "";
        }

        if (locationInput) {
            locationInput.value = "";
        }

        if (hashtagsInput) {
            hashtagsInput.value = "";
        }


        closePost();

        alert(
            "Post created successfully! 🎉"
        );

        showHome();

    } catch (error) {

        console.error(error);

        alert(
            "Could not create post.\n\n" +
            error.message
        );
    }
}


/* =====================================================
   LOAD POSTS
===================================================== */

function loadPosts() {

    const postsContainer =
        document.getElementById("posts");

    if (!postsContainer) return;

    if (typeof firebase === "undefined") {
        return;
    }


    firebase.firestore()
        .collection("posts")
        .orderBy(
            "createdAt",
            "desc"
        )
        .onSnapshot(

            (snapshot) => {

                postsContainer.innerHTML = "";


                if (snapshot.empty) {

                    postsContainer.innerHTML = `
                        <div class="card">

                            <h3>
                                No posts yet.
                            </h3>

                            <p>
                                Be the first person
                                to post!
                            </p>

                        </div>
                    `;

                    return;
                }


                snapshot.forEach((doc) => {

                    const post =
                        doc.data();

                    const postId =
                        doc.id;

                    const likes =
                        Array.isArray(post.likes)
                            ? post.likes
                            : [];

                    const currentUser =
                        firebase.auth()
                            .currentUser;

                    const liked =
                        currentUser &&
                        likes.includes(
                            currentUser.uid
                        );


                    const imageHTML =
                        post.image
                            ? `
                                <img
                                    src="${clean(post.image)}"
                                    class="postImage"
                                    alt="Post image"
                                >
                              `
                            : "";


                    postsContainer.innerHTML += `

                        <div class="card postCard">

                            <div class="postHeader">

                                <strong>
                                    @${clean(
                                        post.username
                                    )}
                                </strong>

                            </div>


                            ${
                                post.text
                                    ? `
                                        <p>
                                            ${clean(
                                                post.text
                                            )}
                                        </p>
                                      `
                                    : ""
                            }


                            ${imageHTML}


                            ${
                                post.location
                                    ? `
                                        <small>
                                            🌏 ${clean(
                                                post.location
                                            )}
                                        </small>
                                      `
                                    : ""
                            }


                            ${
                                post.hashtags
   
