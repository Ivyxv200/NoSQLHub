const token = localStorage.getItem("token");

if (!token) {
    alert("请先登录");
    location.href = "login.html";
}

let currentPage = 1;
const limit = 10;

loadComments(currentPage);


// 加载评论
async function loadComments(page = 1) {

    currentPage = page;

    const response = await fetch(
        `http://localhost:3000/admin/comments?page=${currentPage}&limit=${limit}`,
        {
            headers: {
                authorization: token
            }
        }
    );

    const data = await response.json();

    const commentList =
        document.getElementById("commentList");

    commentList.innerHTML = "";

    if (!data.comments || data.comments.length === 0) {

        commentList.innerHTML = `
            <div class="admin-item">
                暂无评论
            </div>
        `;

        return;
    }

    data.comments.forEach(comment => {

        commentList.innerHTML += `
            <div class="admin-item">

                <div>

                    ${comment.content}

                    <br>

                    作者：${comment.author}

                    <br>

                    所属帖子：${
                        comment.postId
                            ? comment.postId.title
                            : "帖子已删除"
                    }

                </div>

                <button
                    onclick="deleteComment('${comment._id}')"
                >
                    删除
                </button>

            </div>
        `;

    });

    renderPagination(data.page, data.totalPages);

}


// 删除评论
async function deleteComment(id) {

    if (!confirm("确定删除该评论？")) {
        return;
    }

    const response = await fetch(
        `http://localhost:3000/admin/comments/${id}`,
        {
            method: "DELETE",
            headers: {
                authorization: token
            }
        }
    );

    const data = await response.json();

    alert(data.message);

    loadComments(currentPage);

}


// 分页
function renderPagination(page, totalPages) {

    const pagination =
        document.getElementById("commentPagination");

    pagination.innerHTML = "";

    if (!totalPages || totalPages <= 1) {
        return;
    }

    pagination.innerHTML += `
        <button
            class="page-btn"
            ${page === 1 ? "disabled" : ""}
            onclick="loadComments(${page - 1})"
        >
            上一页
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {

        if (
            i === 1 ||
            i === totalPages ||
            Math.abs(i - page) <= 2
        ) {

            pagination.innerHTML += `
                <button
                    class="page-btn ${i === page ? "active" : ""}"
                    onclick="loadComments(${i})"
                >
                    ${i}
                </button>
            `;

        }

    }

    pagination.innerHTML += `
        <button
            class="page-btn"
            ${page === totalPages ? "disabled" : ""}
            onclick="loadComments(${page + 1})"
        >
            下一页
        </button>
    `;

}