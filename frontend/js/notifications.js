const notificationList = document.getElementById("notificationList");
const notificationToken = localStorage.getItem("token");

if (!notificationToken) {
    alert("请先登录");
    window.location.href = "login.html";
}

loadNotifications();
clearUnreadNotificationCount();

async function loadNotifications() {
    try {
        const response = await fetch(
            "http://localhost:3000/notification",
            {
                headers: {
                    authorization: notificationToken
                }
            }
        );

        const notifications = await response.json();
        notificationList.innerHTML = "";
        if (notifications.length === 0) {
            notificationList.innerHTML = `
                <div class="empty-tip">
                    暂无通知
                </div>
            `;
            return;
        }

        notifications.forEach(item => {
            let title = "";
            let content = "";
            if (item.type === "like") {
                title = `${item.sender} 点赞了你的帖子`;
                content = "点击查看帖子";
            }
            else if (item.type === "comment") {
                title = `${item.sender} 评论了你的帖子`;
                content = "点击查看帖子";
            }
            else if (item.type === "comment_like") {
                title = `${item.sender} 点赞了你的评论`;
                content = "点击查看帖子";
            }
            else if (item.type === "favorite") {
                title = `${item.sender} 收藏了你的帖子`;
                content = "点击查看帖子";
            }
            else if (item.type === "reply") {
                title = `${item.sender} 回复了你的评论`;
                content = "点击查看回复内容";
            }
            else if (item.type === "reportReject") {
                title = "管理员驳回了你的举报";
                content = "经审核，该帖子未发现违规内容。";
            }
            else if (item.type === "reportAccepted") {
                title = "管理员处理了你的举报";
                content = "感谢你的反馈，该违规帖子已被删除。";
            }
            else if (item.type === "ban") {
                title = "账号已封禁";
                content = "你的账号因违反社区规范已被管理员封禁。";
            }
            else if (item.type === "unban") {
                title = "账号已恢复";
                content = "你的账号已恢复正常使用，请遵守社区规范。";
            }
            else if (item.type === "system") {
                title = item.title || "系统通知";
                content = item.content || "请查看最新系统消息。";
            }

            const avatar = item.sender.charAt(0).toUpperCase();

            const unreadClass = item.isRead ? "" : "unread";
            notificationList.innerHTML += `
                <div
                    class="notification-card ${unreadClass}"
                    onclick="
                        openNotification(
                            '${item._id}',
                            '${item.postId}',
                            '${item.commentId || ""}',
                            '${item.type}',
                            '${item.announcementId || ""}',
                            '${encodeURIComponent(title)}',
                            '${encodeURIComponent(content)}'
                        )
                    "
                >

                    <div class="notification-avatar">
                        ${avatar}
                    </div>

                    <div class="notification-content">

                        <h2>
                            ${title}
                        </h2>

                        <p>
                            ${content}
                        </p>

                        <span>
                            ${new Date(
                                item.createdAt
                            ).toLocaleString()}
                        </span>

                    </div>

                </div>
            `;
        });

    } catch(error) {
        console.error(error);
        notificationList.innerHTML = `
            <div class="empty-tip">
                通知加载失败
            </div>
        `;
    }
}

async function openNotification(notificationId, postId, commentId, type, announcementId, title, content) {
    try {
        await fetch(
            `http://localhost:3000/notification/read/${notificationId}`,
            {
                method: "PUT",
                headers: {
                    authorization: notificationToken
                }
            }
        );
    } catch(error) {
        console.error(error);
    }

    if (type === "system") {
        if (announcementId) {
            location.href = `announcement.html?id=${announcementId}`;
        }
        else {
            alert(
                decodeURIComponent(title) +
                "\n\n" +
                decodeURIComponent(content)
            );
            loadNotifications();
        }
        return;
    }

    if (
        type === "ban" ||
        type === "unban" ||
        type === "reportAccepted"
    ) {
        alert(
            decodeURIComponent(title) +
            "\n\n" +
            decodeURIComponent(content)
        );

        loadNotifications();
        return;
    }

    if (!postId || postId === "undefined" || postId === "null") {
        loadNotifications();
        return;
    }

    if (commentId) {
        location.href = `detail.html?id=${postId}&comment=${commentId}`;
    }
    else {
        location.href = `detail.html?id=${postId}`;
    }
}

function initNotificationSocket() {
    const username = localStorage.getItem("username");
    if (!username) {
        return;
    }
    const socket = io("http://localhost:3000");
    socket.on(
        "connect",
        () => {
            socket.emit("join", username);
        }
    );
    socket.on(
        "newNotification",
        notification => {
            console.log("通知页收到实时通知:", notification
            );
            loadNotifications();
        }
    );
}

async function clearUnreadNotificationCount() {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            return;
        }

        await fetch(
            "http://localhost:3000/notification/unread-count/clear",
            {
                method: "PUT",
                headers: {
                    authorization: token
                }
            }
        );

    } catch (error) {
        console.error("清空未读消息数量失败：", error);
    }
}

initNotificationSocket();