/* =====================================================
   SOCIAL X
   APP.JS - PART 1
   ===================================================== */

const CLOUDINARY_CLOUD_NAME = "Wahohh6w";
const CLOUDINARY_UPLOAD_PRESET = "socialx";

let currentPage = "home";
let currentChatUser = null;
let unsubscribeMessages = null;
let unsubscribeTyping = null;
let typingTimer = null;

/* =========================
   MAIN ELEMENTS
========================= */

const content = document.getElementById("content");
const loginModal = document.getElementById("loginModal");
const postModal = document.getElementById("postModal");

/* =========================
   HELPERS
========================= */

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

/* =========================
   LOGIN MODAL
========================= */

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

/* =========================
   POST MODAL
========================= */

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

/* =========================
   DARK MODE
========================= */

function toggleDarkMode() {
    document.body.classList.toggle("dark");
}

/* =========================
   HOME
========================= */

function showHome() {

    currentPage = "home";

    if (!content) return;

    content.innerHTML = `
        <div class="page">
            <h1>Home</h1>

            <div id="posts">
                <div class="card">
                    <h3>Welcome to Social X 👋</h3>
                    <p>No posts yet.</p>
                </div>
            </div>
        </div>
    `;
}

/* =========================
   EXPLORE
========================= */

function showExplore() {

    currentPage = "explore";

    if (!content) return;

    content.innerHTML = `
        <div class="page">
            <h1>Explore 🔎</h1>

            <div class="card">
                <p>Search and discover people on Social X.</p>

                <input
                    id="exploreSearch"
                    type="text"
                    placeholder="Search users..."
                >

                <button
                    class="primary"
                    onclick="searchUsers()">
                    Search
                </button>

                <div id="searchResults"></div>
            </div>
        </div>
    `;
}

/* =========================
   CREATE
========================= */

function showCreate() {

    currentPage = "create";

    if (!content) return;

    content.innerHTML = `
        <div class="page">
            <h1>Create Post ➕</h1>

            <button
                class="primary"
                onclick="openPost()">
                Create a Post
            </button>
        </div>
    `;
}

/* =========================
   NOTIFICATIONS
========================= */

function showNotifications() {

    currentPage = "notifications";

    if (!content) return;

    content.innerHTML = `
        <div class="page">
            <h1>Notifications 🔔</h1>

            <div class="card">
                <p>No notifications yet.</p>
            </div>
        </div>
    `;
}

/* =========================
   MESSAGES
========================= */

function showMessages() {

    currentPage = "messages";

    if (!content) return;

    content.innerHTML = `
        <div class="page">
            <h1>Messages 💬</h1>

            <div class="card">
                <p>No conversations yet.</p>
            </div>
        </div>
    `;
}

/* =========================
   PROFILE
========================= */

function showProfile() {

    currentPage = "profile";

    if (!content) return;

    content.innerHTML = `
        <div class="page">
            <h1>Profile 👤</h1>

            <div class="card">
                <div class="bigLogo">X</div>

                <h2>Social X User</h2>

                <p>Your profile will appear here.</p>
            </div>
        </div>
    `;
}

/* =========================
   SETTINGS
========================= */

function showSettings() {

    currentPage = "settings";

    if (!content) return;

    content.innerHTML = `
        <div class="page">
            <h1>Settings ⚙️</h1>

            <div class="card">
                <button
                    class="secondary"
                    onclick="toggleDarkMode()">
                    🌙 Toggle Dark Mode
                </button>

                <br><br>

                <button
                    class="primary"
                    onclick="logout()">
                    Logout
                </button>
            </div>
        </div>
    `;
}
/* =====================================================
   SOCIAL X
   APP.JS - PART 2
   ===================================================== */

/* =========================
   FIREBASE AUTH
========================= */

function registerUser() {

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    if (!usernameInput || !passwordInput) {
        alert("Username or password field not found.");
        return;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        alert("Please enter username and password.");
        return;
    }

    if (username.length < 3) {
        alert("Username must be at least 3 characters.");
        return;
    }

    const email = authEmail(username);

    if (typeof firebase === "undefined") {
        alert("Firebase is not connected.");
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((result) => {

            return firebase.firestore()
                .collection("users")
                .doc(result.user.uid)
                .set({
                    uid: result.user.uid,
                    username: username,
                    usernameLower: username.toLowerCase(),
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

        })
        .then(() => {

            alert("Account created successfully! 🎉");
            closeLogin();

        })
        .catch((error) => {

            console.error(error);
            alert(error.message);

        });
}


/* =========================
   LOGIN
========================= */

function loginUser() {

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    if (!usernameInput || !passwordInput) {
        alert("Login fields not found.");
        return;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        alert("Please enter username and password.");
        return;
    }

    if (typeof firebase === "undefined") {
        alert("Firebase is not connected.");
        return;
    }

    const email = authEmail(username);

    firebase.auth()
        .signInWithEmailAndPassword(email, password)
        .then(() => {

            closeLogin();
            showHome();

        })
        .catch((error) => {

            console.error(error);
            alert("Login failed: " + error.message);

        });
}


/* =========================
   LOGOUT
========================= */

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

            alert("Logged out successfully.");

        })
        .catch((error) => {

            console.error(error);
            alert(error.message);

        });
}


/* =========================
   AUTH STATE
========================= */

if (typeof firebase !== "undefined") {

    firebase.auth().onAuthStateChanged((user) => {

        if (user) {

            console.log("Logged in:", user.uid);

            showHome();

        } else {

            console.log("No user logged in.");

        }

    });

}


/* =========================
   CREATE POST
========================= */

async function createPost() {

    const textInput = document.getElementById("postText");
    const imageInput = document.getElementById("postImage");

    const text = textInput ? textInput.value.trim() : "";
    const file = imageInput && imageInput.files
        ? imageInput.files[0]
        : null;

    if (!text && !file) {
        alert("Write something or select an image.");
        return;
    }

    const user = firebase.auth().currentUser;

    if (!user) {
        alert("Please login first.");
        openLogin();
        return;
    }

    let imageUrl = "";

    try {

        /* =========================
           CLOUDINARY IMAGE UPLOAD
        ========================= */

        if (file) {

            const formData = new FormData();

            formData.append("file", file);

            formData.append(
                "upload_preset",
                CLOUDINARY_UPLOAD_PRESET
            );

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: formData
                }
            );

            if (!response.ok) {
                throw new Error("Image upload failed.");
            }

            const data = await response.json();

            imageUrl = data.secure_url || "";

        }


        /* =========================
           GET USER PROFILE
        ========================= */

        let username = user.email
            ? user.email.split("@")[0]
            : "user";

        const userDoc = await firebase.firestore()
            .collection("users")
            .doc(user.uid)
            .get();

        if (userDoc.exists) {

            const userData = userDoc.data();

            if (userData.username) {
                username = userData.username;
            }

        }


        /* =========================
           SAVE POST
        ========================= */

        await firebase.firestore()
            .collection("posts")
            .add({

                uid: user.uid,

                username: username,

                text: text,

                image: imageUrl,

                likes: [],

                createdAt:
                    firebase.firestore.FieldValue.serverTimestamp()

            });


        if (textInput) {
            textInput.value = "";
        }

        if (imageInput) {
            imageInput.value = "";
        }

        closePost();

        alert("Post created successfully! 🎉");

        showHome();

        loadPosts();

    }

    catch (error) {

        console.error(error);

        alert(
            "Could not create post.\n\n" +
            error.message
        );

    }
}


/* =========================
   LOAD POSTS
========================= */

function loadPosts() {

    const postsContainer =
        document.getElementById("posts");

    if (!postsContainer) return;

    if (typeof firebase === "undefined") {
        return;
    }

    firebase.firestore()
        .collection("posts")
        .orderBy("createdAt", "desc")
        .onSnapshot(

            (snapshot) => {

                postsContainer.innerHTML = "";

                if (snapshot.empty) {

                    postsContainer.innerHTML = `
                        <div class="card">
                            <h3>No posts yet.</h3>
                            <p>Be the first person to post!</p>
                        </div>
                    `;

                    return;
                }


                snapshot.forEach((doc) => {

                    const post = doc.data();

                    const postId = doc.id;

                    const likes =
                        Array.isArray(post.likes)
                            ? post.likes
                            : [];

                    const currentUser =
                        firebase.auth().currentUser;

                    const liked =
                        currentUser &&
                        likes.includes(currentUser.uid);


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
                                    @${clean(post.username)}
                                </strong>

                            </div>

                            ${
                                post.text
                                    ? `
                                        <p>
                                            ${clean(post.text)}
                                        </p>
                                      `
                                    : ""
                            }

                            ${imageHTML}

                            <div class="postActions">

                                <button
                                    onclick="toggleLike('${postId}')">

                                    ${liked ? "❤️" : "🤍"}

                                    ${likes.length}

                                </button>

                                <button
                                    onclick="deletePost('${postId}')">

                                    🗑️

                                </button>

                            </div>

                        </div>

                    `;

                });

            },

            (error) => {

                console.error(error);

                postsContainer.innerHTML = `
                    <div class="card">
                        <p>
                            Unable to load posts.
                        </p>
                    </div>
                `;

            }

        );
}


/* =========================
   LIKE / UNLIKE
========================= */

async function toggleLike(postId) {

    const user =
        firebase.auth().currentUser;

    if (!user) {

        alert("Please login first.");

        openLogin();

        return;
    }

    const postRef =
        firebase.firestore()
            .collection("posts")
            .doc(postId);

    try {

        const doc =
            await postRef.get();

        if (!doc.exists) {
            return;
        }

        const data = doc.data();

        let likes =
            Array.isArray(data.likes)
                ? [...data.likes]
                : [];

        const index =
            likes.indexOf(user.uid);


        if (index === -1) {

            likes.push(user.uid);

        } else {

            likes.splice(index, 1);

        }


        await postRef.update({
            likes: likes
        });

    }

    catch (error) {

        console.error(error);

        alert("Could not update like.");

    }
}


/* =========================
   DELETE POST
========================= */

async function deletePost(postId) {

    const user =
        firebase.auth().currentUser;

    if (!user) {
        alert("Please login first.");
        return;
    }

    const confirmDelete =
        confirm("Delete this post?");

    if (!confirmDelete) {
        return;
    }

    try {

        const postRef =
            firebase.firestore()
                .collection("posts")
                .doc(postId);

        const postDoc =
            await postRef.get();

        if (!postDoc.exists) {
            return;
        }

        const post =
            postDoc.data();


        if (post.uid !== user.uid) {

            alert("You can delete only your own posts.");

            return;
        }


        await postRef.delete();

        alert("Post deleted.");

    }

    catch (error) {

        console.error(error);

        alert("Could not delete post.");

    }
}


/* =========================
   SEARCH USERS
========================= */

async function searchUsers() {

    const input =
        document.getElementById("exploreSearch");

    const results =
        document.getElementById("searchResults");

    if (!input || !results) {
        return;
    }

    const query =
        input.value.trim().toLowerCase();

    if (!query) {

        results.innerHTML = `
            <div class="card">
                Enter a username to search.
            </div>
        `;

        return;
    }


    try {

        const snapshot =
            await firebase.firestore()
                .collection("users")
                .where(
                    "usernameLower",
                    ">=",
                    query
                )
                .where(
                    "usernameLower",
                    "<=",
                    query + "\uf8ff"
                )
                .limit(20)
                .get();


        results.innerHTML = "";


        if (snapshot.empty) {

            results.innerHTML = `
                <div class="card">
                    No users found.
                </div>
            `;

            return;
        }


        snapshot.forEach((doc) => {

            const user =
                doc.data();

            results.innerHTML += `

                <div class="card">

                    <strong>
                        @${clean(user.username)}
                    </strong>

                    <br><br>

                    <button
                        class="primary"
                        onclick="openChat(
                            '${clean(user.uid)}',
                            '${clean(user.username)}'
                        )">

                        Message

                    </button>

                </div>

            `;

        });

    }

    catch (error) {

        console.error(error);

        results.innerHTML = `
            <div class="card">
                Search failed.
            </div>
        `;

    }
}


/* =========================
   OPEN CHAT
========================= */

function openChat(uid, username) {

    currentChatUser = {
        uid: uid,
        username: username
    };

    currentPage = "chat";

    if (!content) return;


    content.innerHTML = `

        <div class="page">

            <button
                class="secondary"
                onclick="showMessages()">

                ← Back

            </button>

            <h1>
                💬 @${clean(username)}
            </h1>

            <div
                id="chatMessages"
                class="chatMessages">
            </div>

            <div class="chatInputArea">

                <input
                    id="messageInput"
                    type="text"
                    placeholder="Write a message..."
                    oninput="handleTyping()"
                    onkeydown="
                        if(event.key === 'Enter')
                        sendMessage();
                    "
                >

                <button
                    class="primary"
                    onclick="sendMessage()">

                    Send

                </button>

            </div>

            <div
                id="typingIndicator">
            </div>

        </div>

    `;

    loadMessages();
    listenTyping();
}


/* =========================
   SEND MESSAGE
========================= */

async function sendMessage() {

    const input =
        document.getElementById("messageInput");

    const text =
        input ? input.value.trim() : "";

    const user =
        firebase.auth().currentUser;


    if (!user) {

        alert("Please login first.");

        return;
    }


    if (!currentChatUser) {

        alert("No chat selected.");

        return;
    }


    if (!text) {
        return;
    }


    const id =
        chatId(
            user.uid,
            currentChatUser.uid
        );


    try {

        await firebase.firestore()
            .collection("messages")
            .add({

                chatId: id,

                senderId: user.uid,

                receiverId:
                    currentChatUser.uid,

                text: text,

                createdAt:
                    firebase.firestore.FieldValue.serverTimestamp()

            });


        input.value = "";

        stopTyping();

    }

    catch (error) {

        console.error(error);

        alert("Message could not be sent.");

    }
}


/* =========================
   LOAD MESSAGES
========================= */

function loadMessages() {

    if (!currentChatUser) {
        return;
    }

    const user =
        firebase.auth().currentUser;

    if (!user) {
        return;
    }


    const id =
        chatId(
            user.uid,
            currentChatUser.uid
        );


    if (unsubscribeMessages) {
        unsubscribeMessages();
    }


    unsubscribeMessages =
        firebase.firestore()
            .collection("messages")
            .where("chatId", "==", id)
            .orderBy("createdAt", "asc")
            .onSnapshot(

                (snapshot) => {

                    const container =
                        document.getElementById(
                            "chatMessages"
                        );

                    if (!container) {
                        return;
                    }


                    container.innerHTML = "";


                    snapshot.forEach((doc) => {

                        const message =
                            doc.data();

                        const mine =
                            message.senderId ===
                            user.uid;


                        container.innerHTML += `

                            <div class="
                                message
                                ${mine ? "mine" : "other"}
                            ">

                                ${clean(message.text)}

                            </div>

                        `;

                    });


                    container.scrollTop =
                        container.scrollHeight;

                },

                (error) => {

                    console.error(error);

                    const container =
                        document.getElementById(
                            "chatMessages"
                        );

                    if (container) {

                        container.innerHTML = `
                            <p>
                                Unable to load messages.
                            </p>
                        `;

                    }

                }

            );
}


/* =========================
   TYPING
========================= */

function handleTyping() {

    const user =
        firebase.auth().currentUser;

    if (!user || !currentChatUser) {
        return;
    }


    const id =
        chatId(
            user.uid,
            currentChatUser.uid
        );


    firebase.firestore()
        .collection("typing")
        .doc(id)
        .set({

            userId: user.uid,

            typingTo:
                currentChatUser.uid,

            timestamp:
                firebase.firestore.FieldValue.serverTimestamp()

        });


    clearTimeout(typingTimer);

    typingTimer =
        setTimeout(
            stopTyping,
            1500
        );
}


function stopTyping() {

    const user =
        firebase.auth().currentUser;

    if (!user || !currentChatUser) {
        return;
    }


    const id =
        chatId(
            user.uid,
            currentChatUser.uid
        );


    firebase.firestore()
        .collection("typing")
        .doc(id)
        .delete()
        .catch(() => {});

}


function listenTyping() {

    const user =
        firebase.auth()
/* =====================================================
   SOCIAL X
   APP.JS - PART 3
   ===================================================== */

/* =========================
   NAVIGATION
========================= */

function goHome() {
    showHome();
    loadPosts();
}

function goExplore() {
    showExplore();
}

function goCreate() {
    showCreate();
}

function goNotifications() {
    showNotifications();
}

function goMessages() {
    showMessages();
}

function goProfile() {
    showProfile();
}

function goSettings() {
    showSettings();
}


/* =========================
   LOGIN / SIGNUP SWITCH
========================= */

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
        actionButton.textContent = "Login";
        actionButton.onclick = loginUser;
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
        title.textContent = "Create Account";
    }

    if (actionButton) {
        actionButton.textContent = "Sign Up";
        actionButton.onclick = registerUser;
    }

    if (switchButton) {
        switchButton.textContent =
            "Already have an account? Login";

        switchButton.onclick =
            switchToLogin;
    }
}


/* =========================
   OPEN LOGIN
========================= */

function openLoginBox() {

    openLogin();

    switchToLogin();

}


/* =========================
   CLOSE ALL MODALS
========================= */

function closeAllModals() {

    closeLogin();
    closePost();

}


/* =========================
   CREATE POST BUTTON
========================= */

function submitPost() {

    createPost();

}


/* =========================
   USER AUTH CHECK
========================= */

function requireLogin(callback) {

    if (
        typeof firebase === "undefined" ||
        !firebase.auth()
    ) {

        alert("Firebase is not connected.");

        return;
    }


    const user =
        firebase.auth().currentUser;


    if (!user) {

        alert("Please login first.");

        openLoginBox();

        return;
    }


    if (typeof callback === "function") {

        callback();

    }

}


/* =========================
   SAFE NAVIGATION
========================= */

function navigate(page) {

    switch (page) {

        case "home":
            goHome();
            break;

        case "explore":
            goExplore();
            break;

        case "create":

            requireLogin(() => {
                goCreate();
            });

            break;

        case "notifications":

            requireLogin(() => {
                goNotifications();
            });

            break;

        case "messages":

            requireLogin(() => {
                goMessages();
            });

            break;

        case "profile":

            requireLogin(() => {
                goProfile();
            });

            break;

        case "settings":

            requireLogin(() => {
                goSettings();
            });

            break;

        default:
            goHome();

    }

}


/* =========================
   CONNECT NAVIGATION BUTTONS
========================= */

function connectNavigation() {

    const homeButtons =
        document.querySelectorAll(
            '[data-page="home"]'
        );

    homeButtons.forEach((button) => {

        button.onclick = () => {
            navigate("home");
        };

    });


    const exploreButtons =
        document.querySelectorAll(
            '[data-page="explore"]'
        );

    exploreButtons.forEach((button) => {

        button.onclick = () => {
            navigate("explore");
        };

    });


    const createButtons =
        document.querySelectorAll(
            '[data-page="create"]'
        );

    createButtons.forEach((button) => {

        button.onclick = () => {
            navigate("create");
        };

    });


    const notificationButtons =
        document.querySelectorAll(
            '[data-page="notifications"]'
        );

    notificationButtons.forEach((button) => {

        button.onclick = () => {
            navigate("notifications");
        };

    });


    const messageButtons =
        document.querySelectorAll(
            '[data-page="messages"]'
        );

    messageButtons.forEach((button) => {

        button.onclick = () => {
            navigate("messages");
        };

    });


    const profileButtons =
        document.querySelectorAll(
            '[data-page="profile"]'
        );

    profileButtons.forEach((button) => {

        button.onclick = () => {
            navigate("profile");
        };

    });


    const settingsButtons =
        document.querySelectorAll(
            '[data-page="settings"]'
        );

    settingsButtons.forEach((button) => {

        button.onclick = () => {
            navigate("settings");
        };

    });

}


/* =========================
   GLOBAL BUTTON HANDLER
========================= */

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest("button");

        if (!button) {
            return;
        }


        /* Login */

        if (
            button.dataset.action === "login"
        ) {

            openLoginBox();

        }


        /* Create */

        if (
            button.dataset.action === "create"
        ) {

            requireLogin(() => {
                openPost();
            });

        }


        /* Logout */

        if (
            button.dataset.action === "logout"
        ) {

            logout();

        }

    }
);


/* =========================
   MODAL BACKDROP CLOSE
========================= */

document.addEventListener(
    "click",
    function (event) {

        if (
            event.target === loginModal
        ) {

            closeLogin();

        }


        if (
            event.target === postModal
        ) {

            closePost();

        }

    }
);


/* =========================
   ESC KEY
========================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeAllModals();

        }

    }
);


/* =========================
   FIREBASE READY
========================= */

function initializeSocialX() {

    console.log(
        "Social X initialized successfully 🚀"
    );


    connectNavigation();


    if (
        typeof firebase !== "undefined"
    ) {

        firebase.auth()
            .onAuthStateChanged((user) => {

                if (user) {

                    console.log(
                        "Social X user:",
                        user.uid
                    );

                    showHome();

                    setTimeout(() => {
                        loadPosts();
                    }, 100);

                }

            });

    }

}


/* =========================
   PAGE LOAD
========================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeSocialX
    );

} else {

    initializeSocialX();

}


/* =========================
   GLOBAL FUNCTIONS
========================= */

window.openLogin =
    openLogin;

window.closeLogin =
    closeLogin;

window.openPost =
    openPost;

window.closePost =
    closePost;

window.loginUser =
    loginUser;

window.registerUser =
    registerUser;

window.logout =
    logout;

window.createPost =
    createPost;

window.showHome =
    showHome;

window.showExplore =
    showExplore;

window.showCreate =
    showCreate;

window.showNotifications =
    showNotifications;

window.showMessages =
    showMessages;

window.showProfile =
    showProfile;

window.showSettings =
    showSettings;

window.toggleDarkMode =
    toggleDarkMode;

window.searchUsers =
    searchUsers;

window.openChat =
    openChat;

window.sendMessage =
    sendMessage;

window.toggleLike =
    toggleLike;

window.deletePost =
    deletePost;

window.navigate =
    navigate;

window.goHome =
    goHome;

window.goExplore =
    goExplore;

window.goCreate =
    goCreate;

window.goNotifications =
    goNotifications;

window.goMessages =
    goMessages;

window.goProfile =
    goProfile;

window.goSettings =
    goSettings;

window.switchToLogin =
    switchToLogin;

window.switchToSignup =
    switchToSignup;

window.submitPost =
    submitPost;


/* =====================================================
   END OF SOCIAL X APP.JS
   ===================================================== */
