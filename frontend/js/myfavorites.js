const favoritesList =
    document.getElementById(
        "favoritesList"
    );

const token =
    localStorage.getItem(
        "token"
    );

if (!token) {

    alert("请先登录");

    window.location.href =
        "login.html";
}

loadFavorites();

async function loadFavorites() {

    try {

        const response =
            await fetch(
                "http://localhost:3000/post/user/favorites",
                {
                    headers: {
                        authorization: token
                    }
                }
            );

        const favorites =
            await response.json();

        favoritesList.innerHTML = "";

        if (
            favorites.length === 0
        ) {

            favoritesList.innerHTML = `

                <div class="empty-tip">

                    暂无收藏帖子

                </div>

            `;

            return;
        }

        favorites.forEach(post => {

            favoritesList.innerHTML += `

                <div
                    class="favorite-card"
                >

                    <div
                        onclick="
                            location.href=
                            'detail.html?id=${post._id}'
                        "
                    >

                        <h2>

                            ${post.title}

                        </h2>

                        <p>

                            ${post.content}

                        </p>

                        <div
                            class="favorite-info"
                        >

                            <span>

                                作者：
                                ${post.author}

                            </span>

                            <span>

                                浏览量：
                                ${post.views}

                            </span>

                        </div>

                    </div>

                    <button
                        class="remove-btn"
                        onclick="
                            event.stopPropagation();
                            removeFavorite(
                                '${post._id}'
                            )
                        "
                    >

                        取消收藏

                    </button>

                </div>

            `;
        });

    }

    catch(error) {

        console.error(error);

        favoritesList.innerHTML =

            "<div class='empty-tip'>加载失败</div>";
    }
}

async function removeFavorite(postId) {

    const ok =
        confirm(
            "确定取消收藏吗？"
        );

    if (!ok) {

        return;
    }

    try {

        const response =
            await fetch(
                `http://localhost:3000/post/unfavorite/${postId}`,
                {
                    method: "PUT",
                    headers: {
                        authorization: token
                    }
                }
            );

        const data =
            await response.json();

        if (response.ok) {

            loadFavorites();

        }

        else {

            alert(data.message);
        }

    }

    catch(error) {

        console.error(error);

        alert("操作失败");
    }
}