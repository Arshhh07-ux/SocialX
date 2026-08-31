/* =====================================================
   SOCIAL X - FREE VERSION
   ACCOUNT + PROFILE + TEXT POSTS + MESSAGES
   NO FIREBASE STORAGE
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
   HELPER
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
   HOME
   ===================================================== */

function showHome() {

    const user = firebase.auth().currentUser;

    content.innerHTML = `

        <div class="card">

            <div class="createCard">

                <div class="avatar">
                    ${user ? "👤" : "?"}
                </div>

                <button
                    class="createInput"
                    onclick="${user ? "openPost()" : "openLogin()"}">

                    ${user
                        ? "✨ What's on your mind?"
                        : "🔐 Login to create a post..."}

                </button>

            </div>

        </div>

        <div
            id="posts"
            class="card empty">

            <div class="emptyIcon">📝</div>

            <h2>Social X</h2>

            <p>Loading posts...</p>

        </div>
    `;

    loadPosts();
}


/* =====================================================
   LOAD TEXT POSTS
   ===================================================== */

function loadPosts() {

    firebase.firestore()
        .collection("posts")
        .orderBy("createdAt", "desc")
        .limit(50)
        .onSnapshot(snapshot => {

            const box =
                document.getElementById("posts");

            if (!box) return;

            if (snapshot.empty) {

                box.innerHTML = `

                    <div class="emptyIcon">📝</div>

                    <h2>No Posts Yet</h2>

                    <p>
                        Be the first person to post on Social X.
                    </p>

                `;

                return;
            }

            let html = "";

            snapshot.forEach(doc => {

                const post = doc.data();

                let time = "";

                if (post.createdAt) {

                    time =
                        post.createdAt
                        .toDate()
                        .toLocaleString();
                }

                html += `

                    <div
                        style="
                            text-align:left;
                            border-bottom:1px solid #eee;
                            padding:15px 0;
                        ">

                        <strong>
                            @${clean(post.username || "user")}
                        </strong>

                        <p>
                            ${clean(post.text)}
                        </p>

                        <small>
                            ${time}
                        </small>

                    </div>
                `;
            });

            box.classList.remove("empty");

            box.innerHTML = html;

        }, error => {

            console.error(error);

            const box =
                document.getElementById("posts");

            if (box) {

                box.innerHTML = `
                    <h3>Unable to load posts.</h3>
                    <p>${clean(error.message)}</p>
                `;
            }
        });
}


/* =====================================================
   EXPLORE
   ===================================================== */

function showExplore() {

    content.innerHTML = `

        <div class="card">

            <h2>🔎 Explore</h2>

            <input
                id="userSearch"
                type="text"
                placeholder="Search username..."
                style="
                    width:100%;
                    padding:12px;
                    margin-top:15px;
                    border:1px solid #ddd;
                    border-radius:20px;
                "
                oninput="searchUsers(this.value)"
            >

            <div id="userResults"></div>

        </div>
    `;
}


async function searchUsers(value) {

    const box =
        document.getElementById("userResults");

    if (!box) return;

    value = value.trim().toLowerCase();

    if (!value) {

        box.innerHTML = "";

        return;
    }

    try {

        const snapshot =
            await firebase.firestore()
            .collection("users")
            .orderBy("usernameLower")
            .startAt(value)
            .endAt(value + "\uf8ff")
            .limit(20)
            .get();

        if (snapshot.empty) {

            box.innerHTML =
                "<p>No users found.</p>";

            return;
        }

        let html = "";

        snapshot.forEach(doc => {

            const data = doc.data();

            html += `

                <div
                    class="card"
                    style="
                        display:flex;
                        align-items:center;
                        gap:12px;
                        cursor:pointer;
                    "
                    onclick="openChat('${doc.id}')">

                    <div class="avatar">
                        👤
                    </div>

                    <div>

                        <strong>
                            @${clean(data.username)}
                        </strong>

                        <div>
                            💬 Message
                        </div>

                    </div>

                </div>
            `;
        });

        box.innerHTML = html;

    } catch (error) {

        console.error(error);

        box.innerHTML =
            "<p>Search failed.</p>";
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

            <p>
                Notifications will appear here.
            </p>

        </div>
    `;
}


/* =====================================================
   MESSAGES
   ===================================================== */

function showMessages() {

    const user =
        firebase.auth().currentUser;

    if (!user) {

        content.innerHTML = `

            <div class="card empty">

                <div class="emptyIcon">🔐</div>

                <h2>Login Required</h2>

                <p>
                    Login to use Messages.
                </p>

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
                id="messageSearch"
                type="text"
                placeholder="🔎 Search username..."
                style="
                    width:100%;
                    padding:12px;
                    margin-top:15px;
                    border:1px solid #ddd;
                    border-radius:20px;
                "
                oninput="searchMessageUsers(this.value)"
            >

            <div id="messageUsers"></div>

        </div>

        <div id="chatArea"></div>
    `;
}


/* =====================================================
   MESSAGE USER SEARCH
   ===================================================== */

async function searchMessageUsers(value) {

    const box =
        document.getElementById("messageUsers");

    if (!box) return;

    value =
        value.trim().toLowerCase();

    if (!value) {

        box.innerHTML = "";

        return;
    }

    try {

        const snapshot =
            await firebase.firestore()
            .collection("users")
            .orderBy("usernameLower")
            .startAt(value)
            .endAt(value + "\uf8ff")
            .limit(20)
            .get();

        if (snapshot.empty) {

            box.innerHTML =
                "<p>No users found.</p>";

            return;
        }

        let html = "";

        snapshot.forEach(doc => {

            const data = doc.data();

            html += `

                <div
                    class="card"
                    style="
                        display:flex;
                        gap:12px;
                        align-items:center;
                        cursor:pointer;
                    "
                    onclick="openChat('${doc.id}')">

                    <div class="avatar">
                        👤
                    </div>

                    <div>

                        <strong>
                            @${clean(data.username)}
                        </strong>

                        <div>
                            Tap to message
                        </div>

                    </div>

                </div>
            `;
        });

        box.innerHTML = html;

    } catch (error) {

        console.error(error);

        box.innerHTML =
            "<p>Unable to search users.</p>";
    }
}


/* =====================================================
   OPEN CHAT
   ===================================================== */

async function openChat(otherUid) {

    const me =
        firebase.auth().currentUser;

    if (!me) {

        openLogin();

        return;
    }

    if (me.uid === otherUid) {

        alert("You cannot message yourself.");

        return;
    }

    currentChatUser = otherUid;

    const doc =
        await firebase.firestore()
        .collection("users")
        .doc(otherUid)
        .get();

    if (!doc.exists) {

        alert("User not found.");

        return;
    }

    const other =
        doc.data();

    const area =
        document.getElementById("chatArea");

    if (!area) return;

    area.innerHTML = `

        <div
            class="card"
            style="padding:0;overflow:hidden;">

            <div
                style="
                    padding:15px;
                    border-bottom:1px solid #ddd;
                ">

                <strong>
                    👤 @${clean(other.username)}
                </strong>

                <div
                    id="chatStatus"
                    style="
                        font-size:12px;
                        color:#777;
                    ">

                    Checking status...

                </div>

            </div>


            <div
                id="messagesList"
                style="
                    height:50vh;
                    overflow-y:auto;
                    padding:15px;
                ">
            </div>


            <div
                id="typingIndicator"
                style="
                    min-height:20px;
                    padding:0 15px;
                    font-size:13px;
                    color:#777;
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
                        padding:12px;
                        outline:none;
                    "
                    oninput="typing()"
                    onkeydown="messageKey(event)"
                >

                <button
                    class="primary"
                    onclick="sendMessage()">

                    ➤

                </button>

            </div>

        </div>
    `;

    listenMessages(
        me.uid,
        otherUid
    );

    listenTyping(
        me.uid,
        otherUid
    );

    listenStatus(otherUid);
}


/* =====================================================
   SEND MESSAGE
   ===================================================== */

async function sendMessage() {

    const me =
        firebase.auth().currentUser;

    const input =
        document.getElementById(
            "messageInput"
        );

    if (!me || !currentChatUser || !input)
        return;

    const text =
        input.value.trim();

    if (!text) return;

    try {

        const meDoc =
            await firebase.firestore()
            .collection("users")
            .doc(me.uid)
            .get();

        const myData =
            meDoc.data() || {};

        await firebase.firestore()
            .collection("messages")
            .add({

                chatId:
                    chatId(
                        me.uid,
                        currentChatUser
                    ),

                senderId:
                    me.uid,

                receiverId:
                    currentChatUser,

                senderUsername:
                    myData.username || "User",

                text:
                    text,

                delivered:
                    false,

                seen:
                    false,

                createdAt:
                    firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

                deliveredAt:
                    null,

                seenAt:
                    null
            });

        input.value = "";

        setTyping(false);

    } catch (error) {

        console.error(error);

        alert(
            "Message failed: " +
            error.message
        );
    }
}


/* =====================================================
   MESSAGE LISTENER
   ===================================================== */

function listenMessages(me, other) {

    if (unsubscribeMessages) {

        unsubscribeMessages();

        unsubscribeMessages = null;
    }

    const id =
        chatId(me, other);

    unsubscribeMessages =
        firebase.firestore()
        .collection("messages")
        .where("chatId", "==", id)
        .orderBy("createdAt", "asc")
        .onSnapshot(snapshot => {

            const list =
                document.getElementById(
                    "messagesList"
                );

            if (!list) return;

            let html = "";

            snapshot.forEach(doc => {

                const msg =
                    doc.data();

                const mine =
                    msg.senderId === me;

                let time = "";

                if (msg.createdAt) {

                    time =
                        msg.createdAt
                        .toDate()
                        .toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                        });
                }

                let status = "";

                if (mine) {

                    if (msg.seen) {

                        status = " · ✓✓ Seen";

                    } else if (msg.delivered) {

                        status =
                            " · ✓✓ Delivered";

                    } else {

                        status =
                            " · ✓ Sent";
                    }
                }

                html += `

                    <div
                        style="
                            display:flex;
                            justify-content:
                                ${mine
                                    ? "flex-end"
                                    : "flex-start"};
                            margin:8px 0;
                        ">

                        <div
                            style="
                                max-width:75%;
                                padding:10px 13px;
                                border-radius:16px;
                                background:
                                    ${mine
                                        ? "#111"
                                        : "#eeeeee"};
                                color:
                                    ${mine
                                        ? "white"
                                        : "#111"};
                            ">

                            ${clean(msg.text)}

                            <div
                                style="
                                    font-size:10px;
                                    opacity:.65;
                                    margin-top:4px;
                                    text-align:right;
                                ">

                                ${time}
                                ${status}

                            </div>

                        </div>

                    </div>
                `;
            });

            list.innerHTML =
                html ||
                `<p style="text-align:center;">
                    No messages yet 👋
                </p>`;

            list.scrollTop =
                list.scrollHeight;

            markSeen(me, other);

        });
}


/* =====================================================
   SEEN
   ===================================================== */

async function markSeen(me, other) {

    const id =
        chatId(me, other);

    try {

        const snapshot =
            await firebase.firestore()
            .collection("messages")
            .where("chatId", "==", id)
            .where("receiverId", "==", me)
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
                        firebase.firestore
                        .FieldValue
                        .serverTimestamp()
                }
            );
        });

        await batch.commit();

    } catch (error) {

        console.error(error);
    }
}


/* =====================================================
   TYPING
   ===================================================== */

function typing() {

    setTyping(true);

    clearTimeout(typingTimer);

    typingTimer =
        setTimeout(
            () => setTyping(false),
            1500
        );
}


async function setTyping(value) {

    const me =
        firebase.auth().currentUser;

    if (!me || !currentChatUser)
        return;

    const id =
        chatId(
            me.uid,
            currentChatUser
        );

    try {

        await firebase.firestore()
            .collection("typing")
            .doc(id)
            .set({

                [me.uid]:
    value

            }, {
                merge: true
            });

    } catch (error) {

        console.error(
            "Typing error:",
            error
        );
    }
}


/* =========================
   LISTEN TYPING
========================= */

function listenTyping() {

    const me =
        firebase.auth().currentUser;

    if (!me || !currentChatUser)
        return;

    const id =
        chatId(
            me.uid,
            currentChatUser
        );

    firebase.firestore()
        .collection("typing")
        .doc(id)
        .onSnapshot(snapshot => {

            const data =
                snapshot.data() || {};

            const otherUser =
                currentChatUser.uid;

            const typingStatus =
                data[otherUser];

            const typingElement =
                document.getElementById(
                    "typing"
                );

            if (!typingElement)
                return;

            if (
                typingStatus === true
            ) {

                typingElement.innerText =
                    "typing...";

                typingElement.style.display =
                    "block";

            } else {

                typingElement.innerText =
                    "";

                typingElement.style.display =
                    "none";
            }

        });
}


/* =========================
   MESSAGE INPUT
========================= */

function setupMessageInput() {

    const input =
        document.getElementById(
            "messageInput"
        );

    if (!input)
        return;

    input.addEventListener(
        "input",
        function() {

            if (
                this.value.trim()
            ) {

                typing();

            } else {

                setTyping(false);

            }

        }
    );

    input.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );
}


/* =========================
   END TYPING
========================= */
/* =========================
   SEND MESSAGE
========================= */

async function sendMessage() {

    const me =
        firebase.auth().currentUser;

    if (!me || !currentChatUser)
        return;

    const input =
        document.getElementById(
            "messageInput"
        );

    if (!input)
        return;

    const text =
        input.value.trim();

    if (!text)
        return;

    try {

        const id =
            chatId(
                me.uid,
                currentChatUser
            );

        await firebase.firestore()
            .collection("messages")
            .add({

                chatId: id,

                senderId:
                    me.uid,

                receiverId:
                    currentChatUser.uid,

                text: text,

                seen: false,

                createdAt:
                    firebase.firestore
                    .FieldValue
                    .serverTimestamp()
            });

        input.value = "";

        setTyping(false);

    } catch (error) {

        console.error(
            "Send message error:",
            error
        );

        alert(
            "Message could not be sent."
        );
    }
}


/* =========================
   MESSAGE LISTENER
========================= */

function listenMessages() {

    const me =
        firebase.auth().currentUser;

    if (!me || !currentChatUser)
        return;

    const id =
        chatId(
            me.uid,
            currentChatUser
        );

    firebase.firestore()
        .collection("messages")
        .where(
            "chatId",
            "==",
            id
        )
        .orderBy(
            "createdAt",
            "asc"
        )
        .onSnapshot(snapshot => {

            const chat =
                document.getElementById(
                    "chatMessages"
                );

            if (!chat)
                return;

            chat.innerHTML = "";

            snapshot.forEach(doc => {

                const message =
                    doc.data();

                const mine =
                    message.senderId ===
                    me.uid;

                const div =
                    document.createElement(
                        "div"
                    );

                div.className =
                    mine
                        ? "message me"
                        : "message";

                const time =
                    message.createdAt
                        ? message.createdAt
                            .toDate()
                            .toLocaleTimeString(
                                [],
                                {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                }
                            )
                        : "";

                div.innerHTML = `

                    <div class="messageText">
                        ${escapeHTML(
                            message.text
                        )}
                    </div>

                    <div class="messageTime">
                        ${time}

                        ${
                            mine
                                ? (
                                    message.seen
                                        ? " ✓✓ Seen"
                                        : " ✓ Sent"
                                  )
                                : ""
                        }
                    </div>

                `;

                chat.appendChild(div);

            });

            chat.scrollTop =
                chat.scrollHeight;

        });
}


/* =========================
   MARK SEEN
========================= */

async function markMessagesSeen() {

    const me =
        firebase.auth().currentUser;

    if (!me || !currentChatUser)
        return;

    const id =
        chatId(
            me.uid,
            currentChatUser
        );

    const snapshot =
        await firebase.firestore()
        .collection("messages")
        .where(
            "chatId",
            "==",
            id
        )
        .where(
            "receiverId",
            "==",
            me.uid
        )
        .where(
            "seen",
            "==",
            false
        )
        .get();

    const batch =
        firebase.firestore()
        .batch();

    snapshot.forEach(doc => {

        batch.update(
            doc.ref,
            {
                seen: true
            }
        );

    });

    await batch.commit();
}


/* =========================
   HTML SAFETY
========================= */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;
}


/* =========================
   LOGOUT
========================= */

async function logout() {

    const me =
        firebase.auth().currentUser;

    if (me) {

        await firebase.firestore()
            .collection("users")
            .doc(me.uid)
            .set({

                online: false,

                lastSeen:
                    firebase.firestore
                    .FieldValue
                    .serverTimestamp()

            }, {
                merge: true
            });
    }

    await firebase.auth()
        .signOut();

    currentPage = "home";

    render();
}


/* =========================
   DARK MODE
========================= */

function toggleDarkMode() {

    document.body
        .classList
        .toggle("dark");
}


/* =========================
   START APP
========================= */

render();
