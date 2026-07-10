const token =
    localStorage.getItem("token");

const followersList =
    document.getElementById(
        "followersList"
    );

if (!token) {

    alert("请先登录");

    window.location.href =
        "login.html";
}

loadFollowers();

async function loadFollowers() {

    try {

        const response =
            await fetch(
                "http://localhost:3000/user/followers",
                {
                    headers: {
                        authorization: token
                    }
                }
            );

        const users =
            await response.json();

        followersList.innerHTML = "";

        if (users.length === 0) {

            followersList.innerHTML = `
                <div class="empty-tip">
                    暂无粉丝
                </div>
            `;

            return;
        }

        users.forEach(user => {

            followersList.innerHTML += `
                <div class="follower-card">

                    <div
                        class="follower-left"
                    >

                        <div
                            class="follower-avatar"
                        >
                            ${user.username
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div
                            class="follower-info"
                        >

                            <h2>
                                ${user.username}
                            </h2>

                            <p>
                                ${
                                    user.profile ||
                                    "这个人很懒，还没有简介"
                                }
                            </p>

                        </div>

                    </div>

                </div>
            `;
        });

    } catch(error) {

        console.error(error);
    }
}