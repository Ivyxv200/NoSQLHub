const token = localStorage.getItem("token");

if (!token) {
    alert("请先登录");
    location.href = "login.html";
}

const titleInput = document.getElementById("announcementTitle");
const contentInput = document.getElementById("announcementContent");
const publishBtn = document.getElementById("publishAnnouncementBtn");
const announcementList = document.getElementById("adminAnnouncementList");

publishBtn.addEventListener("click", publishAnnouncement);

loadAnnouncements();

// 发布公告
async function publishAnnouncement() {

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title) {
        alert("请输入公告标题");
        return;
    }

    if (!content) {
        alert("请输入公告内容");
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:3000/admin/announcement",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization: token
                },
                body: JSON.stringify({
                    title,
                    content
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            alert("公告发布成功");

            titleInput.value = "";
            contentInput.value = "";

            loadAnnouncements();

        } else {

            alert(data.message);

        }

    } catch (error) {

        console.error(error);

        alert("公告发布失败");

    }

}

// 加载历史公告
async function loadAnnouncements() {

    try {

        const response = await fetch(
            "http://localhost:3000/admin/announcements",
            {
                headers: {
                    authorization: token
                }
            }
        );

        const announcements = await response.json();

        if (announcements.length === 0) {

            announcementList.innerHTML = `
                <div class="empty-report">
                    暂无历史公告
                </div>
            `;

            return;
        }

        announcementList.innerHTML = "";

        announcements.forEach(item => {

            const preview =
                item.content.length > 60
                    ? item.content.slice(0, 60) + "..."
                    : item.content;

            announcementList.innerHTML += `
                <div class="admin-item">

                    <div>
                        <b>
                            <a
                                href="announcement.html?id=${item._id}"
                                class="announcement-link"
                            >
                                ${item.title}
                            </a>
                        </b>

                        <p class="announcement-preview">
                            ${preview}
                        </p>

                        <span class="announcement-time">
                            ${new Date(item.createdAt).toLocaleString()}
                        </span>
                    </div>

                    <div class="admin-announcement-actions">
                        <button
                            class="view-btn"
                            onclick="location.href='announcement.html?id=${item._id}'"
                        >
                            查看详情
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteAnnouncement('${item._id}')"
                        >
                            删除
                        </button>
                    </div>

                </div>
            `;

        });

    } catch (error) {

        console.error(error);

        announcementList.innerHTML = `
            <div class="empty-report">
                加载失败
            </div>
        `;

    }

}

// 删除公告
async function deleteAnnouncement(id) {

    if (!confirm("确定删除该公告吗？")) {
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:3000/admin/announcement/${id}`,
            {
                method: "DELETE",
                headers: {
                    authorization: token
                }
            }
        );

        const data = await response.json();

        alert(data.message);

        loadAnnouncements();

    } catch (error) {

        console.error(error);

        alert("删除失败");

    }

}