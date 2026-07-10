const token = localStorage.getItem("token");

if (!token) {
    alert("请先登录");
    location.href = "login.html";
}

const params = new URLSearchParams(location.search);
const id = params.get("id");

const title = document.getElementById("announcementTitle");
const publisher = document.getElementById("announcementPublisher");
const time = document.getElementById("announcementTime");
const content = document.getElementById("announcementContent");

if (!id) {
    title.textContent = "公告不存在";
    content.textContent = "未找到公告编号。";
}
else {
    loadAnnouncement();
}

async function loadAnnouncement() {

    try {

        const response = await fetch(
            `http://localhost:3000/admin/announcement/${id}`,
            {
                headers: {
                    authorization: token
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            title.textContent = "加载失败";
            content.textContent = data.message;

            return;
        }

        title.textContent = data.title;

        publisher.textContent =
            data.publisher || "系统";

        time.textContent =
            new Date(data.createdAt).toLocaleString();

        content.innerHTML =
            data.content.replace(/\n/g, "<br>");

    }
    catch (error) {

        console.error(error);

        title.textContent = "加载失败";

        content.textContent =
            "服务器连接失败。";

    }

}