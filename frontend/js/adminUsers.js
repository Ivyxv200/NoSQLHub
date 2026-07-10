const token = localStorage.getItem("token");

if (!token) {
    alert("请先登录");
    location.href = "login.html";
}

let currentPage = 1;
const limit = 10;

loadUsers(currentPage);


// 加载用户
async function loadUsers(page = 1) {

    currentPage = page;

    const response = await fetch(
        `http://localhost:3000/admin/users?page=${currentPage}&limit=${limit}`,
        {
            headers: {
                authorization: token
            }
        }
    );

    const data = await response.json();

    const userList =
        document.getElementById("userList");

    userList.innerHTML = "";

    if (!data.users || data.users.length === 0) {

        userList.innerHTML = `
            <div class="admin-item">
                暂无用户
            </div>
        `;

        return;
    }

    data.users.forEach(user => {

        userList.innerHTML += `
            <div class="admin-item">

                <div>

                    <b>${user.username}</b>

                    <br>

                    邮箱：${user.email}

                    <br>

                    身份：${user.role}

                    <br>

                    状态：${user.status}

                </div>

                ${
                    user.role === "ADMIN"
                        ? `
                            <span>
                                管理员
                            </span>
                        `
                        : user.status === "NORMAL"
                            ? `
                                <button
                                    onclick="banUser('${user._id}')"
                                >
                                    封禁
                                </button>
                            `
                            : `
                                <button
                                    onclick="unbanUser('${user._id}')"
                                >
                                    恢复
                                </button>
                            `
                }

            </div>
        `;

    });

    renderPagination(data.page, data.totalPages);

}


// 封禁用户
async function banUser(id) {

    if (!confirm("确定封禁该用户？")) {
        return;
    }

    const response = await fetch(
        `http://localhost:3000/admin/users/${id}/ban`,
        {
            method: "PUT",
            headers: {
                authorization: token
            }
        }
    );

    const data = await response.json();

    alert(data.message);

    loadUsers(currentPage);

}


// 恢复用户
async function unbanUser(id) {

    if (!confirm("确定恢复该用户？")) {
        return;
    }

    const response = await fetch(
        `http://localhost:3000/admin/users/${id}/unban`,
        {
            method: "PUT",
            headers: {
                authorization: token
            }
        }
    );

    const data = await response.json();

    alert(data.message);

    loadUsers(currentPage);

}


// 分页
function renderPagination(page, totalPages) {

    const pagination =
        document.getElementById("userPagination");

    pagination.innerHTML = "";

    if (!totalPages || totalPages <= 1) {
        return;
    }

    // 上一页
    pagination.innerHTML += `
        <button
            class="page-btn"
            ${page === 1 ? "disabled" : ""}
            onclick="loadUsers(${page - 1})"
        >
            上一页
        </button>
    `;

    // 页码
    for (let i = 1; i <= totalPages; i++) {

        if (
            i === 1 ||
            i === totalPages ||
            Math.abs(i - page) <= 2
        ) {

            pagination.innerHTML += `
                <button
                    class="page-btn ${i === page ? "active" : ""}"
                    onclick="loadUsers(${i})"
                >
                    ${i}
                </button>
            `;

        }

    }

    // 下一页
    pagination.innerHTML += `
        <button
            class="page-btn"
            ${page === totalPages ? "disabled" : ""}
            onclick="loadUsers(${page + 1})"
        >
            下一页
        </button>
    `;

}