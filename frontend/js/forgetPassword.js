const resetPasswordBtn =
    document.getElementById("resetPasswordBtn");

resetPasswordBtn.addEventListener("click", async () => {
    const username =
        document.getElementById("username").value.trim();

    const oldPassword =
        document.getElementById("oldPassword").value.trim();

    const newPassword =
        document.getElementById("newPassword").value.trim();

    const confirmPassword =
        document.getElementById("confirmPassword").value.trim();

    if (
        !username ||
        !oldPassword ||
        !newPassword ||
        !confirmPassword
    ) {
        alert("请填写完整信息");
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("两次输入的新密码不一致");
        return;
    }

    if (newPassword.length < 6) {
        alert("新密码长度不能少于6位");
        return;
    }

    try {
        const response = await fetch(
            "http://localhost:3000/user/forget-password",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    oldPassword,
                    newPassword,
                    confirmPassword
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "密码修改失败");
            return;
        }

        alert(data.message || "密码修改成功，请重新登录");

        window.location.href = "login.html";

    } catch(error) {
        console.error(error);
        alert("服务器错误");
    }
});