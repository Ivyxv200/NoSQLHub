async function getCurrentUser() {
    const token = localStorage.getItem("token");
    if (!token) {
        return null;
    }

    try {
        const response = await fetch(
            "http://localhost:3000/user/profile",
            {
                headers: { authorization: token }
            }
        );
        return await response.json();
    } catch(error) {
        console.error(error);
        return null;
    }
}

function getAvatarHtml(user) {
    const username = localStorage.getItem("username") || "U";
    const avatarText = username.charAt(0).toUpperCase();
    const avatarClass = user && user.role === "ADMIN" ? "avatar admin-avatar" : "avatar";
    if (user && user.avatar) {
        return `
            <a class="${avatarClass}" href="profile.html">
                <img
                    src="http://localhost:3000${user.avatar}"
                    class="navbar-avatar-image"
                >
            </a>
        `;
    }
    return `
        <a class="${avatarClass}" href="profile.html">
            ${avatarText}
        </a>
    `;
}

fetch("../html/components/navbar.html")
    .then(response => response.text())
    .then(async data => {
        document.getElementById("navbar-container").innerHTML = data;

        const searchBtn = document.getElementById("searchBtn");
        const searchInput = document.getElementById("searchInput");
        const suggestionBox = document.getElementById("suggestionBox");
        const userArea = document.getElementById("userArea");
        const isLogin = localStorage.getItem("isLogin");

        searchBtn.addEventListener("click", () => {
            const keyword = searchInput.value.trim();

            if (!keyword) {
                alert("请输入搜索内容");
                return;
            }

            window.location.href = `search.html?keyword=${encodeURIComponent(keyword)}`;
        });

        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                searchBtn.click();
            }
        });

        searchInput.addEventListener("input", async () => {
            const keyword = searchInput.value.trim();

            if (!keyword) {
                suggestionBox.style.display = "none";
                return;
            }

            try {
                const response = await fetch(
                    `http://localhost:3000/post/suggest?keyword=${encodeURIComponent(keyword)}`
                );

                const posts = await response.json();

                suggestionBox.innerHTML = "";

                if (posts.length === 0) {
                    suggestionBox.style.display = "none";
                    return;
                }

                posts.forEach(post => {
                    suggestionBox.innerHTML += `
                        <div
                            class="suggestion-item"
                            onclick="location.href='detail.html?id=${post._id}'"
                        >
                            ${post.title}
                        </div>
                    `;
                });

                suggestionBox.style.display = "block";
            } catch(error) {
                console.error(error);
            }
        });

        if (isLogin === "true") {
            const currentUser = await getCurrentUser();
            const avatarHtml = getAvatarHtml(currentUser);

            userArea.innerHTML = `
                <a
                    href="publish.html"
                    class="nav-btn"
                >
                    + 发帖
                </a>

                <a
                    href="announcements.html"
                    class="nav-btn"
                >
                    公告
                </a>

                ${avatarHtml}

                <div class="dropdown">
                    <button class="dropdown-btn">
                        <span class="arrow-icon"></span>
                    </button>

                    <div class="dropdown-content">
                        <a href="profile.html">
                            我的主页
                        </a>

                        <a href="myposts.html">
                            我的帖子
                        </a>

                        <a href="mycomments.html">
                            我的评论
                        </a>

                        <a
                            href="notifications.html"
                            class="notification-link"
                        >
                            消息通知
                            <span
                                id="notificationBadge"
                                class="notification-badge"
                            ></span>
                        </a>

                        <a href="history.html">
                            历史浏览
                        </a>

                        ${
                            currentUser && currentUser.role === "ADMIN"
                                ? `
                                    <a href="admin.html">
                                        管理员后台
                                    </a>
                                `
                                : ""
                        }

                        <a href="settings.html">
                            设置
                        </a>

                        <a
                            href="homepage.html"
                            class="logout-btn"
                            id="logoutBtn"
                        >
                            退出登录
                        </a>
                    </div>
                </div>
            `;

            loadUnreadNotificationCount();
            setInterval(loadUnreadNotificationCount, 5000);

            const logoutBtn = document.getElementById("logoutBtn");

            logoutBtn.addEventListener("click", () => {
                localStorage.removeItem("token");
                localStorage.removeItem("isLogin");
                localStorage.removeItem("username");
                localStorage.removeItem("email");
            });
        } else {
            userArea.innerHTML = `
                <a
                    href="announcements.html"
                    class="nav-btn"
                >
                    公告
                </a>

                <a
                    href="login.html"
                    class="nav-btn"
                >
                    登录
                </a>
            `;
        }
    });

document.addEventListener("click", (e) => {
    const suggestionBox = document.getElementById("suggestionBox");

    if (suggestionBox && !e.target.closest(".search-box")) {
        suggestionBox.style.display = "none";
    }
});

async function loadUnreadNotificationCount() {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            return;
        }

        const response = await fetch(
            "http://localhost:3000/notification/unread-count",
            {
                headers: {
                    authorization: token
                }
            }
        );

        const data = await response.json();
        const badge = document.getElementById("notificationBadge");

        if (!badge) {
            return;
        }

        if (data.count > 0) {
            badge.innerText = `🔔 ${data.count}`;
            badge.style.display = "inline-flex";
        } else {
            badge.innerText = "";
            badge.style.display = "none";
        }

    } catch(error) {
        console.error(error);
    }
}

function initNavbarSocket() {
    const username = localStorage.getItem("username");

    if (!username) {
        return;
    }

    const socket = io("http://localhost:3000");

    socket.on("connect", () => {
        socket.emit("join", username);
    });

    socket.on("newNotification", () => {
        loadUnreadNotificationCount();
    });
}

initNavbarSocket();