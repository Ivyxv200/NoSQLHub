const token = localStorage.getItem("token");

if (!token) {
    alert("请先登录");
    location.href = "login.html";
}

let currentPage = 1;
const limit = 10;

loadPosts(currentPage);

// 加载帖子
async function loadPosts(page = 1) {

    currentPage = page;

    const response = await fetch(
        `http://localhost:3000/admin/posts?page=${currentPage}&limit=${limit}`,
        {
            headers: {
                authorization: token
            }
        }
    );

    const data = await response.json();

    const postList =
        document.getElementById("postList");

    postList.innerHTML = "";

    if (data.posts.length === 0) {

        postList.innerHTML = `
            <div class="admin-item">
                暂无帖子
            </div>
        `;

        return;
    }

    data.posts.forEach(post => {

        postList.innerHTML += `
            <div class="admin-item">

                <div>

                    <b>${post.title}</b>

                    <br>

                    作者：${post.author}

                </div>

                <button
                    onclick="deletePost('${post._id}')"
                >
                    删除
                </button>

            </div>
        `;

    });

    renderPagination(data.page, data.totalPages);

}

// 删除帖子
async function deletePost(id) {

    if (!confirm("确定删除该帖子？")) {
        return;
    }

    const response = await fetch(
        `http://localhost:3000/admin/posts/${id}`,
        {
            method: "DELETE",
            headers: {
                authorization: token
            }
        }
    );

    const data = await response.json();

    alert(data.message);

    loadPosts(currentPage);

}

// 分页
function renderPagination(page, totalPages) {

    const pagination =
        document.getElementById("postPagination");

    pagination.innerHTML = "";

    // 上一页

    pagination.innerHTML += `
        <button
            class="page-btn"
            ${page === 1 ? "disabled" : ""}
            onclick="loadPosts(${page - 1})"
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
                    onclick="loadPosts(${i})"
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
            onclick="loadPosts(${page + 1})"
        >
            下一页
        </button>
    `;

}