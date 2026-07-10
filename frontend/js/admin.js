const token = localStorage.getItem("token");

if (!token) {
    alert("请先登录");
    location.href = "login.html";
}

const adminPostsCard = document.getElementById("adminPostsCard");
const adminCommentsCard = document.getElementById("adminCommentsCard");
const adminUsersCard = document.getElementById("adminUsersCard");
const adminReportsCard = document.getElementById("adminReportsCard");
const adminAnnouncementsCard = document.getElementById("adminAnnouncementsCard");

// 管理页面跳转
adminPostsCard.addEventListener("click", () => { location.href = "adminPosts.html"; });
adminCommentsCard.addEventListener("click", () => { location.href = "adminComments.html"; });
adminUsersCard.addEventListener("click", () => { location.href = "adminUsers.html"; });
adminReportsCard.addEventListener("click", () => { location.href = "adminReports.html"; });
adminAnnouncementsCard.addEventListener("click", () => { location.href = "adminAnnouncements.html"; });

// 加载后台统计数据
async function loadStats() {
    try {
        const response = await fetch(
            "http://localhost:3000/admin/stats",
            {
                headers: {
                    Authorization: "Bearer " + token
                }
            }
        );
        const result = await response.json();
        if (!result.success) {
            return;
        }
        const data = result.data;
        document.getElementById("totalUsers").innerText = data.totalUsers;
        document.getElementById("totalPosts").innerText = data.totalPosts;
        document.getElementById("totalComments").innerText = data.totalComments;
        document.getElementById("todayActiveUsers").innerText = data.todayActiveUsers;
        document.getElementById("onlineUsers").innerText = data.onlineUsers;
    } catch (error) {
        console.error("加载统计数据失败：", error);
    }
}

// 页面加载时获取一次
loadStats();

// 每5秒自动刷新一次统计数据
setInterval(loadStats, 5000);