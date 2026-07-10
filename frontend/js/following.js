const followingList = document.getElementById("followingList");
const token = localStorage.getItem("token");

loadFollowing();

async function loadFollowing() {
    try {
        const response = await fetch(
            "http://localhost:3000/user/following",
            {
                headers: {
                    authorization: token
                }
            }
        );

        const users = await response.json();
        followingList.innerHTML = "";
        if (users.length === 0) {
            followingList.innerHTML = `
                <div class="empty-tip">
                    暂无关注用户
                </div>
            `;
            return;
        }
        users.forEach(user => {
            followingList.innerHTML += `
                <div class="following-card">

                    <div
                        class="user-info"
                        onclick="location.href='author.html?id=${user._id}'"
                        style="cursor:pointer"
                    >

                        <div class="user-avatar">
                            ${user.username.charAt(0).toUpperCase()}
                        </div>

                        <div class="user-detail">
                            <h2>
                                ${user.username}
                            </h2>

                            <p>
                                ${user.email}
                            </p>
                        </div>
                    </div>

                    <button
                        class="unfollow-btn"
                        onclick="unfollowUser('${user._id}')"
                    >
                        取消关注
                    </button>
                </div>
            `;
        });
    } catch(error) {
        console.error(error);
    }
}

async function unfollowUser(userId) {
    const ok = confirm("确定取消关注吗？");
    if (!ok) {
        return;
    }
    try {
        const response = await fetch(
            `http://localhost:3000/user/unfollow/${userId}`,
            {
                method: "PUT",
                headers: {
                    authorization: token
                }
            }
        );

        const data = await response.json();
        if (!response.ok) {
            alert(data.message);
            return;
        }
        loadFollowing();
    } catch(error) {
        console.error(error);
    }
}