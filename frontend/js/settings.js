const token = localStorage.getItem("token");

if (!token) {
    alert("请先登录");
    window.location.href = "login.html";
}

// ======================
// 深色模式
// ======================

const darkMode =
    document.getElementById(
        "darkMode"
    );

darkMode.addEventListener("change", () => {

    if (darkMode.checked) {

        document.body.style.backgroundColor =
            "#0f172a";

        alert("已开启深色模式");

    }
    else {

        document.body.style.backgroundColor =
            "#f5f7fb";

        alert("已关闭深色模式");

    }

});

// ======================
// 修改密码
// ======================

const changePasswordBtn =
    document.getElementById(
        "changePasswordBtn"
    );

changePasswordBtn.addEventListener("click", async () => {

    const oldPassword =
        document.getElementById(
            "oldPassword"
        ).value.trim();

    const newPassword =
        document.getElementById(
            "newPassword"
        ).value.trim();

    const confirmPassword =
        document.getElementById(
            "confirmPassword"
        ).value.trim();

    if (
        !oldPassword ||
        !newPassword ||
        !confirmPassword
    ) {

        alert("请填写完整信息");
        return;

    }

    if (
        newPassword !==
        confirmPassword
    ) {

        alert("两次输入的新密码不一致");
        return;

    }

    if (newPassword.length < 6) {

        alert("新密码长度不能少于6位");
        return;

    }

    try {

        const response = await fetch(
            "http://localhost:3000/user/password",
            {
                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json",

                    authorization:
                        token

                },

                body: JSON.stringify({

                    oldPassword,

                    newPassword,

                    confirmPassword

                })

            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.message ||
                "修改失败"
            );

            return;

        }

        alert(
            data.message ||
            "密码修改成功，请重新登录"
        );

        // 清除登录状态

        localStorage.removeItem("token");
        localStorage.removeItem("isLogin");
        localStorage.removeItem("username");
        localStorage.removeItem("email");

        // 跳转登录

        window.location.href =
            "login.html";

    }
    catch(error) {

        console.error(error);

        alert("服务器错误");

    }

});

// ======================
// 删除账户
// ======================

const deleteBtn =
    document.getElementById(
        "deleteAccountBtn"
    );

deleteBtn.addEventListener("click", () => {

    const confirmDelete =
        confirm("确定删除账户吗？");

    if (confirmDelete) {

        alert("账户已删除（模拟）");

        // 清除登录状态

        localStorage.removeItem("token");
        localStorage.removeItem("isLogin");
        localStorage.removeItem("username");
        localStorage.removeItem("email");

        // 返回首页

        window.location.href =
            "homepage.html";

    }

});