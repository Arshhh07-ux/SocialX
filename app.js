/* =====================================================
   SOCIAL X
   AUTH + PROFILE + REAL-TIME MESSAGES
   ===================================================== */

let currentPage = "home";
let currentChatUser = null;
let unsubscribeMessages = null;
let unsubscribeTyping = null;
let typingTimer = null;

const content = document.getElementById("content");
const loginModal = document.getElementById("loginModal");
const postModal = document.getElementById("postModal");


/* =====================================================
   HELPERS
   ===================================================== */

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
}

function usernameToAuthEmail(username) {
    return username.toLowerCase().replace(/[^a-z0-9_]/g, "") +
        "@socialx.app";
}


/* =====================================================
   HOME
   ===================================================== */

function showHome() {

    const user = firebase.auth().currentUser;

    content.innerHTML = `

        <div class="card">

            <div class="createCard">

                <div class="avatar">
                    👤
                </div>

                <button
                    class="createInput"
                    onclick="${user ? "openPost()" : "openLogin()"}">

                    ${user
                        ? "✨ Create your first post..."
                        : "🔐 Login to create a post..."}

                </button>

            </div>

        </div>

        <div class="card empty">

            <div class="emptyIcon">🎬</div>

            <h2>No Posts Yet 😏</h2>

            <p>
                ${user
                    ? "Create your first post and share it with Social X."
                    : "Login to create your first post."}
            </p>

            <button
                class="primary"
                onclick="${user ? "openPost()" : "openLogin()"}">

                ${user
                    ? "➕ Create Post"
                    : "✨ Login / Sign Up"}

            </button>

        </div>
    `;
}


/* =====================================================
   EXPLORE
   ===================================================== */

function showExplore() {

    content.innerHTML = `
        <div class="card">
            <h2>🔎 Explore</h2>
            <p>Find real Social X users.</p>

            <input
                id="userSearch"
                class="createInput"
                style="width:100%; border:none;"
                placeholder="🔍 Search username..."
                oninput="searchUsers(this.value)"
            >

            <div id="userResults"></div>
        </div>
    `;
}


/* =====================================================
   USER SEARCH
   ===================================================== */

async function searchUsers(value) {

    const results = document.getElementById("userResults");

    if (!results) return;

    value = value.trim().toLowerCase();

    if (!value) {
        results.innerHTML = "";
        return;
    }

    try {

        const snapshot = await firebase.firestore()
            .collection("users")
            .orderBy("usernameLower")
            .startAt(value)
            .endAt(value + "\uf8ff")
            .limit(20)
            .get();

        if (snapshot.empty) {

            results.innerHTML = `
                <div class="empty">
                    <div class="emptyIcon">🔎</div>
                    <p>No users found.</p>
                </div>
            `;

            return;
        }

        let html = "";

        snapshot.forEach(doc => {

            const user = doc.data();

            html += `

                <div
                    class="card"
                    style="display:flex;align-items:center;gap:12px;cursor:pointer;"
                    onclick="openChat('${doc.id}')">

                    <div class="avatar">
                        ${user.photoURL
                            ? `<img src="${escapeHTML(user.photoURL)}"
                               style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
                            : "👤"}
                    </div>

                    <div>
                        <strong>${escapeHTML(user.username)}</strong>
                        <div style="font-size:13px;color:#777;">
                            Tap to message
                        </div>
                    </div>

                </div>
            `;
        });

        results.innerHTML = html;

    } catch (error) {

        console.error(error);

        results.innerHTML = `
            <p>Unable to search users.</p>
        `;
    }
}


/* =====================================================
   CREATE
   ===================================================== */

function showCreate() {
    openPost();
}


/* =====================================================
   NOTIFICATIONS
   ===================================================== */

function showNotifications() {

    content.innerHTML = `
        <div class="card empty">
            <div class="emptyIcon">🔔</div>
            <h2>No notifications</h2>
            <p>Your notifications will appear here.</p>
        </div>
    `;
}


/* =====================================================
   MESSAGES
   ===================================================== */

function showMessages() {

    const user = firebase.auth().currentUser;

    if (!user) {

        content.innerHTML = `
            <div class="card empty">

                <div class="emptyIcon">🔐</div>

                <h2>Login Required</h2>

                <p>Login to use Social X Messages.</p>

                <button
                    class="primary"
                    onclick="openLogin()">

                    Login / Sign Up

                </button>

            </div>
        `;

        return;
    }

    content.innerHTML = `

        <div class="card">

            <h2>💬 Messages</h2>

            <input
                id="messageUserSearch"
                class="createInput"
                style="width:100%;border:none;margin-top:12px;"
                placeholder="🔍 Search a user to chat..."
                oninput="searchMessageUsers(this.value)"
            >

            <div id="messageUserResults"></div>

        </div>

        <div id="chatArea"></div>
    `;
}


/* =====================================================
   MESSAGE USER SEARCH
   ===================================================== */

async function searchMessageUsers(value) {

    const box = document.getElementById("messageUserResults");

    if (!box) return;

    value = value.trim().toLowerCase();

    if (!value) {
        box.innerHTML = "";
        return;
    }

    try {

        const snapshot = await firebase.firestore()
            .collection("users")
            .orderBy("usernameLower")
            .startAt(value)
            .endAt(value + "\uf8ff")
            .limit(20)
            .get();

        if (snapshot.empty) {

            box.innerHTML = `
                <p style="padding:15px;">No users found.</p>
            `;

            return;
        }

        let html = "";

        snapshot.forEach(doc => {

            const data = doc.data();

            html += `

                <div
                    class="card"
                    style="display:flex;align-items:center;gap:12px;cursor:pointer;"
                    onclick="openChat('${doc.id}')">

                    <div class="avatar">
                        ${data.photoURL
                            ? `<img src="${escapeHTML(data.photoURL)}"
                               style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
                            : "👤"}
                    </div>

                    <div>
                        <strong>${escapeHTML(data.username)}</strong>
                        <div style="font-size:13px;color:#777;">
                            Message
                        </div>
                    </div>

                </div>
            `;
        });

        box.innerHTML = html;

    } catch (error) {

        console.error(error);

        box.innerHTML = `
            <p>Search failed.</p>
        `;
    }
}


/* =====================================================
   CHAT ID
   ===================================================== */

function getChatId(uid1, uid2) {

    return [uid1, uid2]
        .sort()
        .join("_");
}


/* =====================================================
   OPEN CHAT
   ===================================================== */

async function openChat(otherUid) {

    const currentUser = firebase.auth().currentUser;

    if (!currentUser) {
        openLogin();
        return;
    }

    if (otherUid === currentUser.uid) {

        alert("You cannot message yourself.");

        return;
    }

    currentChatUser = otherUid;

    const userDoc = await firebase.firestore()
        .collection("users")
        .doc(otherUid)
        .get();

    if (!userDoc.exists) {

        alert("User not found.");

        return;
    }

    const otherUser = userDoc.data();

    const chatArea = document.getElementById("chatArea");

    if (!chatArea) return;

    chatArea.innerHTML = `

        <div
            class="card"
            style="padding:0;overflow:hidden;">

            <div
                style="
                    padding:14px;
                    border-bottom:1px solid #ddd;
                    display:flex;
                    align-items:center;
                    gap:10px;
                ">

                <div class="avatar">

                    ${otherUser.photoURL
                        ? `<img src="${escapeHTML(otherUser.photoURL)}"
                           style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
                        : "👤"}

                </div>

                <div>

                    <strong>
                        ${escapeHTML(otherUser.username)}
                    </strong>

                    <div
                        id="onlineStatus"
                        style="font-size:12px;color:#777;">

                        Checking status...

                    </div>

                </div>

            </div>

            <div
                id="messagesList"
                style="
                    height:55vh;
                    overflow-y:auto;
                    padding:15px;
                ">
            </div>

            <div
                id="typingIndicator"
                style="
                    padding:0 15px 5px;
                    font-size:13px;
                    color:#777;
                    min-height:20px;
                ">
            </div>

            <div
                style="
                    display:flex;
                    gap:8px;
                    padding:12px;
                    border-top:1px solid #ddd;
                ">

                <input
                    id="messageInput"
                    type="text"
                    placeholder="Write a message..."
                    style="
                        flex:1;
                        border:1px solid #ddd;
                        border-radius:22px;
                        padding:12px 15px;
                        outline:none;
                    "
                    oninput="handleTyping()"
                    onkeydown="handleMessageKey(event)"
                >

                <button
                    class="primary"
                    onclick="sendMessage()">

                    ➤

                </button>

            </div>

        </div>
    `;

    listenToMessages(currentUser.uid, otherUid);

    listenToTyping(currentUser.uid, otherUid);

    listenToPresence(otherUid);

    markMessagesSeen(currentUser.uid, otherUid);

    const input = document.getElementById("messageInput");

    if (input) input.focus();
}


/* =====================================================
   SEND MESSAGE
   ===================================================== */

async function sendMessage() {

    const currentUser = firebase.auth().currentUser;

    const input = document.getElementById("messageInput");

    if (!currentUser || !currentChatUser || !input) return;

    const text = input.value.trim();

    if (!text) return;

    input.disabled = true;

    try {

        const currentUserDoc = await firebase.firestore()
            .collection("users")
            .doc(currentUser.uid)
            .get();

        const senderData = currentUserDoc.data() || {};

        const chatId =
            getChatId(currentUser.uid, currentChatUser);

        await firebase.firestore()
            .collection("messages")
            .add({

                chatId: chatId,

                senderId: currentUser.uid,

                receiverId: currentChatUser,

                senderUsername:
                    senderData.username || "User",

                text: text,

                delivered: false,

                seen: false,

                createdAt:
                    firebase.firestore.FieldValue.serverTimestamp(),

                seenAt: null,

                deliveredAt: null

            });

        input.value = "";

        await setTyping(false);

    } catch (error) {

        console.error(error);

        alert("Message could not be sent.");

    } finally {

        input.disabled = false;

        input.focus();
    }
}


/* =====================================================
   ENTER TO SEND
   ===================================================== */

function handleMessageKey(event) {

    if (event.key === "Enter") {

        event.preventDefault();

        sendMessage();
    }
}


/* =====================================================
   REAL-TIME MESSAGES
   ===================================================== */

function listenToMessages(myUid, otherUid) {

    if (unsubscribeMessages) {

        unsubscribeMessages();

        unsubscribeMessages = null;
    }

    const chatId = getChatId(myUid, otherUid);

    unsubscribeMessages =
        firebase.firestore()
        .collection("messages")
        .where("chatId", "==", chatId)
        .orderBy("createdAt", "asc")
        .onSnapshot(async snapshot => {

            const list =
                document.getElementById("messagesList");

            if (!list) return;

            let html = "";

            const batch =
                firebase.firestore().batch();

            let needsUpdate = false;

            snapshot.forEach(doc => {

                const message = doc.data();

                const mine =
                    message.senderId === myUid;

                const timestamp =
                    message.createdAt
                    ? message.createdAt.toDate()
                    : new Date();

                const time =
                    timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                    });

                let status = "";

                if (mine) {

                    if (message.seen) {

                        status = `✓✓ Seen`;

                    } else if (message.delivered) {

                        status = `✓✓ Delivered`;

                    } else {

                        status = `✓ Sent`;
                    }
                }

                html += `

                    <div
                        style="
                            display:flex;
                            justify-content:${mine ? "flex-end" : "flex-start"};
                            margin:8px 0;
                        ">

                        <div
                            style="
                                max-width:75%;
                                padding:10px 13px;
                                border-radius:16px;
                                background:${mine ? "#111" : "#f0f0f0"};
                                color:${mine ? "white" : "#111"};
                            ">

                            <div>
                                ${escapeHTML(message.text)}
                            </div>

                            <div
                                style="
                                    font-size:10px;
                                    opacity:.65;
                                    margin-top:4px;
                                    text-align:right;
                                ">

                                ${time}
                                ${mine ? " · " + status : ""}

                            </div>

                        </div>

                    </div>
                `;

                if (
                    message.receiverId === myUid &&
                    !message.delivered
                ) {

                    batch.update(
                        doc.ref,
                        {
                            delivered: true,
                            deliveredAt:
                                firebase.firestore.FieldValue.serverTimestamp()
                        }
                    );

                    needsUpdate = true;
                }
            });

            list.innerHTML =
                html ||
                `<p style="text-align:center;color:#777;">
                    No messages yet. Say hello! 👋
                </p>`;

            list.scrollTop = list.scrollHeight;

            if (needsUpdate) {

                try {
                    await batch.commit();
                } catch (error) {
                    console.error(error);
                }
            }

            markMessagesSeen(myUid, otherUid);

        });
}


/* =====================================================
   MARK SEEN
   ===================================================== */

async function markMessagesSeen(myUid, otherUid) {

    const chatId = getChatId(myUid, otherUid);

    try {

        const snapshot =
            await firebase.firestore()
            .collection("messages")
            .where("chatId", "==", chatId)
            .where("receiverId", "==", myUid)
            .where("seen", "==", false)
            .get();

        if (snapshot.empty) return;

        const batch =
            firebase.firestore().batch();

        snapshot.forEach(doc => {

            batch.update(
                doc.ref,
                {
                    seen: true,
                    delivered: true,
                    seenAt:
                        firebase.firestore.FieldValue.serverTimestamp()
                }
            );

        });

        await batch.commit();

    } catch (error) {

        console.error("Seen error:", error);
    }
}


/* =====================================================
   TYPING
   ===================================================== */

function handleTyping() {

    setTyping(true);

    clearTimeout(typingTimer);

    typingTimer = setTimeout(
        function() {
            setTyping(false);
        },
        1500
    );
}


async function setTyping(isTyping) {

    const currentUser =
        firebase.auth().currentUser;

    if (!currentUser || !currentChatUser) return;

    const chatId =
        getChatId(
            currentUser.uid,
            currentChatUser
        );

    try {

        await firebase.firestore()
            .collection("typing")
            .doc(chatId)
            .set({

                [currentUser.uid]: isTyping,

                updatedAt:
                    firebase.firestore.FieldValue.serverTimestamp()

            }, { merge: true });

    } catch (error) {

        console.error(error);
    }
}


function listenToTyping(myUid, otherUid) {

    if (unsubscribeTyping) {

        unsubscribeTyping();

        unsubscribeTyping = null;
    }

    const chatId =
        getChatId(myUid, otherUid);

    unsubscribeTyping =
        firebase.firestore()
        .collection("typing")
        .doc(chatId)
        .onSnapshot(doc => {

            const data =
                doc.exists ? doc.data() : {};

            const indicator =
                document.getElementById(
                    "typingIndicator"
                );

            if (!indicator) return;

            indicator.innerText =
                data[otherUid]
                    ? "Typing..."
                    : "";

        });
}


/* =====================================================
   ONLINE / OFFLINE
   ===================================================== */

function setPresence() {

    const user =
        firebase.auth().currentUser;

    if (!user) return;

    firebase.firestore()
        .collection("users")
        .doc(user.uid)
        .set({

            online: true,

            lastSeen:
                firebase.firestore.FieldValue.serverTimestamp()

        }, { merge: true });

    window.addEventListener(
        "beforeunload",
        function() {

            firebase.firestore()
                .collection("users")
                .doc(user.uid)
                .set({

                    online: false,

                    lastSeen:
                        firebase.firestore.FieldValue.serverTimestamp()

                }, { merge: true });

        }
    );
}


function listenToPresence(otherUid) {

    firebase.firestore()
        .collection("users")
        .doc(otherUid)
        .onSnapshot(doc => {

            const data = doc.data();

            const status =
                document.getElementById(
                    "onlineStatus"
                );

            if (!status || !data) return;

            if (data.online) {

                status.innerText = "🟢 Online";

            } else if (data.lastSeen) {

                const date =
                    data.lastSeen.toDate();

                status.innerText =
                    "Last seen " +
                    date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                    });

            } else {

                status.innerText = "Offline";
            }
        });
}


/* =====================================================
   PROFILE
   ===================================================== */

async function showProfile() {

    const user =
        firebase.auth().currentUser;

    if (!user) {

        content.innerHTML = `
            <div class="card empty">

                <div class="emptyIcon">👤</div>

                <h2>Your Profile</h2>

                <p>Please login or create an account.</p>

                <button
                    class="primary"
                    onclick="openLogin()">

                    🔐 Login / Sign Up

                </button>

            </div>
        `;

        return;
    }

    const doc =
        await firebase.firestore()
        .collection("users")
        .doc(user.uid)
        .get();

    const data =
        doc.exists ? doc.data() : {};

    content.innerHTML = `

        <div class="card">

            <div class="cover"></div>

            <div class="profileInfo">

                <div
                    class="avatar profileAvatar"
                    style="overflow:hidden;">

                    ${data.photoURL
                        ? `<img src="${escapeHTML(data.photoURL)}"
                           style="width:100%;height:100%;object-fit:cover;">`
                        : "👤"}

                </div>

                <h2>
                    ${escapeHTML(data.username || "User")}
                </h2>

                <p>
                    ${escapeHTML(data.bio || "No bio yet.")}
                </p>

                <button
                    class="secondary"
                    onclick="editProfile()">

                    ✏️ Edit Profile

                </button>

                <button
                    class="secondary"
                    onclick="logout()">

                    🚪 Logout

                </button>

            </div>

        </div>

        <div class="card empty">

            <div class="emptyIcon">📸</div>

            <h3>Your posts will appear here</h3>

        </div>
    `;
}


/* =====================================================
   EDIT PROFILE
   ===================================================== */

async function editProfile() {

    const user =
        firebase.auth().currentUser;

    if (!user) return;

    const doc =
        await firebase.firestore()
        .collection("users")
        .doc(user.uid)
        .get();

    const data =
        doc.exists ? doc.data() : {};

    content.innerHTML = `

        <div class="card">

            <h2>✏️ Edit Profile</h2>

            <input
                id="editUsername"
                value="${escapeHTML(data.username || "")}"
                placeholder="Username"
                style="width:100%;padding:12px;margin:8px 0;"
            >

            <textarea
                id="editBio"
                placeholder="Bio"
                style="width:100%;padding:12px;margin:8px 0;"
            >${escapeHTML(data.bio || "")}</textarea>

            <input
                id="editPhoto"
                value="${escapeHTML(data.photoURL || "")}"
                placeholder="Profile picture URL (optional)"
                style="width:100%;padding:12px;margin:8px 0;"
            >

            <button
                class="primary"
                onclick="saveProfile()">

                💾 Save Profile

            </button>

        </div>
    `;
}


async function saveProfile() {

    const user =
        firebase.auth().currentUser;

    if (!user) return;

    const username =
        document.getElementById(
            "editUsername"
        ).value.trim();

    const bio =
        document.getElementById(
            "editBio"
        ).value.trim();

    const photoURL =
        document.getElementById(
            "editPhoto"
        ).value.trim();

    if (!username) {

        alert("Username is required.");

        return;
    }

    try {

        await firebase.firestore()
            .collection("users")
            .doc(user.uid)
            .update({

                username: username,

                usernameLower:
                    username.toLowerCase(),

                bio: bio,

                photoURL: photoURL

            });

        alert("Profile updated! 🎉");

        showProfile();

    } catch (error) {

        console.error(error);

        alert(error.message);
    }
}


/* =====================================================
   SETTINGS
   ===================================================== */

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


/* =====================================================
   PAGE ROUTER
   ===================================================== */

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


/* =====================================================
   NAVIGATION
   ===================================================== */

document
    .querySelectorAll(".menu")
    .forEach(button => {

        button.addEventListener(
            "click",
            function() {

                currentPage =
                    this.dataset.page;

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


/* =====================================================
   LOGIN MODAL
   ===================================================== */

function openLogin() {

    loginModal.classList.remove("hidden");
}


function closeLogin() {

    loginModal.classList.add("hidden");
}


/* =====================================================
   SIGNUP
   ===================================================== */

async function signup() {

    const usernameInput =
        document.getElementById("username");

    const emailInput =
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    const username =
        usernameInput
        ? usernameInput.value.trim()
        : "";

    const optionalEmail =
        emailInput
        ? emailInput.value.trim()
        : "";

    const password =
        passwordInput
        ? passwordInput.value
        : "";

    if (!username) {

        alert("Username is required.");

        return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {

        alert(
            "Username must be 3-20 characters and use only letters, numbers or _."
        );

        return;
    }

    if (!password || password.length < 6) {

        alert(
            "Password must be at least 6 characters."
        );

        return;
    }

    const usernameLower =
        username.toLowerCase();

    try {

        const existing =
            await firebase.firestore()
            .collection("users")
            .where(
                "usernameLower",
                "==",
                usernameLower
            )
            .limit(1)
            .get();

        if (!existing.empty) {

            alert("This username is already taken.");

            return;
        }

        const authEmail =
            usernameToAuthEmail(username);

        const credential =
            await firebase.auth()
            .createUserWithEmailAndPassword(
                authEmail,
                password
            );

        await firebase.firestore()
            .collection("users")
            .doc(credential.user.uid)
            .set({

                uid: credential.user.uid,

                username: username,

                usernameLower: usernameLower,

                optionalEmail: optionalEmail,

                photoURL: "",

                bio: "",

                online: true,

                createdAt:
                    firebase.firestore.FieldValue.serverTimestamp(),

                lastSeen:
                    firebase.firestore.FieldValue.serverTimestamp()

            });

        alert("Account created successfully! 🎉");

        closeLogin();

        render();

    } catch (error) {

        console.error(error);

        alert(error.message);
    }
}


/* =====================================================
   LOGIN
   ===================================================== */

async function login() {

    const usernameInput =
        document.getElementById("username");

    const emailInput =
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    const username =
        usernameInput
        ? usernameInput.value.trim()
        : "";

    const password =
        passwordInput
        ? passwordInput.value
        : "";

    /*
       Email field is NOT required.
       Login uses username + password.
    */

    if (!username || !password) {

        alert(
            "Please enter username and password."
        );

        return;
    }

    try {

        const snapshot =
            await firebase.firestore()
            .collection("users")
            .where(
                "usernameLower",
                "==",
                username.toLowerCase()
            )
            .limit(1)
            .get();

        if (snapshot.empty) {

            alert("Username not found.");

            return;
        }

        const userData =
            snapshot.docs[0].data();

        const authEmail =
            usernameToAuthEmail(
                userData.username
            );

        await firebase.auth()
            .signInWithEmailAndPassword(
                authEmail,
                password
            );

        alert("Login successful! 🎉");

        closeLogin();

        render();

    } catch (error) {

        console.error(error);

        alert("Incorrect username or password.");
    }
}


/* =====================================================
   LOGOUT
   ===================================================== */

function logout() {

    const user =
        firebase.auth().currentUser;

    if (user) {

        firebase.firestore()
            .collection("users")
            .doc(user.uid)
            .set({

                online: false,

                lastSeen:
                    firebase.firestore.FieldValue.serverTimestamp()

            }, { merge: true });
    }

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


/* =====================================================
   AUTH STATE
   ===================================================== */

firebase.auth().onAuthStateChanged(
    function(user) {

        if (user) {

            console.log(
                "Logged in:",
                user.uid
            );

            setPresence();

        } else {

            console.log(
                "No user logged in."
            );
        }

        render();
    }
);


/* =====================================================
   CREATE POST
   ===================================================== */

function openPost() {

    const user =
        firebase.auth().currentUser;

    if (!user) {

        openLogin();

        return;
    }

    postModal.classList.remove("hidden");
}


function closePost() {

    postModal.classList.add("hidden");
}


function createPost() {

    const user =
        firebase.auth().currentUser;

    if (!user) {

        alert("Please login first.");

        openLogin();

        return;
    }

    const fileInput =
        document.getElementById("postFile");

    const text =
        document.getElementById(
            "postText"
        ).value.trim();

    const location =
        document.getElementById(
            "location"
        ).value.trim();

    const hashtags =
        document.getElementById(
            "hashtags"
        ).value.trim();

    const file =
        fileInput.files[0];

    if (!file) {

        alert(
            "Please select an image or video."
        );

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

        alert(
            "Please select a valid image or video."
        );

        return;
    }

    const maxSize =
        50 * 1024 * 1024;

    if (file.size > maxSize) {

        alert(
            "File must be smaller than 50 MB."
        );

        return;
    }

    const button =
        document.querySelector(
            '#postModal button[onclick="createPost()"]'
        );

    if (button) {

        button.disabled = true;

        button.innerText =
            "⏳ Uploading...";
    }

    const fileName =
        Date.now() + "_" + file.name;

    const storageRef =
        firebase.storage()
        .ref()
        .child(
            "posts/" +
            user.uid +
            "/" +
            fileName
        );

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

                    text: text,

                    location: location,

                    hashtags: hashtags,

                    mediaURL: downloadURL,

                    mediaType:
                        file.type.startsWith("video/")
                            ? "video"
                            : "image",

                    createdAt:
                        firebase.firestore.FieldValue.serverTimestamp()

                });

        })
        .then(function() {

            alert(
                "Post uploaded successfully! 🎉"
            );

            document.getElementById(
                "postFile"
            ).value = "";

            document.getElementById(
                "postText"
            ).value = "";

            document.getElementById(
                "location"
            ).value = "";

            document.getElementById(
                "hashtags"
            ).value = "";

            closePost();

            if (button) {

                button.disabled = false;

                button.innerText =
                    "🚀 Post";
            }

        })
        .catch(function(error) {

            console.error(
                "Post upload error:",
                error
            );

            alert(
                "Post upload failed: " +
                error.message
            );

            if (button) {

                button.disabled = false;

                button.innerText =
                    "🚀 Post";
            }
        });
}


/* =====================================================
   DARK MODE
   ===================================================== */

function toggleDarkMode() {

    document.body.classList.toggle("dark");
}


/* =====================================================
   SEARCH
   ===================================================== */

const searchBox =
    document.getElementById("search");

if (searchBox) {

    searchBox.addEventListener(
        "input",
        function() {

            console.log(
                "Searching:",
                this.value
            );
        }
    );
}


/* =====================================================
   START
   ===================================================== */

render();
