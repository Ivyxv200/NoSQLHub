const reportList = document.getElementById("reportList");
const token = localStorage.getItem("token");

if (!token) {
    alert("请先登录");
    location.href = "login.html";
}

loadReports();

async function loadReports() {
    try {
        const res = await fetch("http://localhost:3000/admin/reports", {
            headers: {
                authorization: token
            }
        });

        const data = await res.json();

        if (!data.success) {
            reportList.innerHTML = "<p>加载失败</p>";
            return;
        }

        if (data.reports.length === 0) {
            reportList.innerHTML = `
                <div class="empty-report">
                    暂无待处理举报
                </div>
            `;
            return;
        }

        reportList.innerHTML = "";

        data.reports.forEach(report => {
            const div = document.createElement("div");
            div.className = "report-item";

            div.innerHTML = `
                <h3>
                    <a 
                        href="detail.html?id=${report.post._id}"
                        target="_blank"
                        class="report-post-link"
                    >
                        ${report.post.title}
                    </a>
                </h3>
                <p>举报人：${report.reporter.username}</p>
                <p>举报原因：${report.reason}</p>

                <div class="report-btns">
                    <button class="delete-btn" onclick="deletePost('${report._id}')">
                        删除帖子
                    </button>

                    <button class="reject-btn" onclick="rejectReport('${report._id}')">
                        驳回举报
                    </button>
                </div>
            `;

            reportList.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        reportList.innerHTML = "<p>加载失败</p>";
    }
}

async function deletePost(id) {
    if (!confirm("确定删除该帖子吗？")) return;

    const res = await fetch(`http://localhost:3000/admin/report/${id}/delete`, {
        method: "PUT",
        headers: {
            authorization: token
        }
    });

    const data = await res.json();
    alert(data.message);
    loadReports();
}

async function rejectReport(id) {
    const res = await fetch(`http://localhost:3000/admin/report/${id}/reject`, {
        method: "PUT",
        headers: {
            authorization: token
        }
    });

    const data = await res.json();
    alert(data.message);
    loadReports();
}