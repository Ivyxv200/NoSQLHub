const likesList = document.getElementById("likesList");
const token = localStorage.getItem("token");

if (!token) {
    alert("请先登录");
    window.location.href = "login.html";
}

loadLikes();

async function loadLikes() {
    try {
        const response = await fetch(
            "http://localhost:3000/post/user/likes",
            {
                headers: {
                    authorization: token
                }
            }
        );

        const likedPosts = await response.json();
        likesList.innerHTML = "";

        if (likedPosts.length === 0) {
            likesList.innerHTML = `
                <div class="empty-tip">
                    暂无点赞记录
                </div>
            `;
            return;
        }

        likedPosts.forEach(post => {
            likesList.innerHTML += `
                <div
                    class="like-card"
                    onclick="location.href='detail.html?id=${post._id}'"
                >

                    <h2>
                        ${post.title}
                    </h2>

                    <p>
                        ${post.content}
                    </p>

                    <div class="like-info">
                        <span>
                            作者：${post.author}
                        </span>

                        <span>
                            点赞：${post.likes}
                        </span>
                    </div>

                </div>
            `;
        });
    } catch(error) {
        console.error(error);
        likesList.innerHTML = `
            <div class="empty-tip">
                加载失败
            </div>
        `;
    }
}