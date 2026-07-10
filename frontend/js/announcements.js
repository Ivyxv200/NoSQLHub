const announcementList = document.getElementById("announcementList");
const token = localStorage.getItem("token");

if (!token) {
    alert("请先登录");
    location.href = "login.html";
}

loadAnnouncements();

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

        const data = await response.json();

        if (!response.ok) {
            announcementList.innerHTML = `
                <div class="empty-announcement">
                    ${data.message || "公告加载失败"}
                </div>
            `;
            return;
        }

        if (data.length === 0) {
            announcementList.innerHTML = `
                <div class="empty-announcement">
                    暂无系统公告
                </div>
            `;
            return;
        }

        announcementList.innerHTML = "";

        data.forEach(item => {
            const div = document.createElement("div");
            div.className = "announcement-item";

            div.onclick = () => {
                location.href = `announcement.html?id=${item._id}`;
            };

            div.innerHTML = `
                <div>
                    <h2>${item.title}</h2>

                    <p>
                        ${item.content.length > 80
                            ? item.content.slice(0, 80) + "..."
                            : item.content}
                    </p>

                    <span>
                        ${new Date(item.createdAt).toLocaleString()}
                    </span>
                </div>

                <div class="announcement-arrow">
                    ＞
                </div>
            `;

            announcementList.appendChild(div);
        });

    } catch (error) {
        console.error(error);

        announcementList.innerHTML = `
            <div class="empty-announcement">
                公告加载失败
            </div>
        `;
    }
}