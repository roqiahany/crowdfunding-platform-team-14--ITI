window.addEventListener("load", () => {
    document.querySelector("#loginForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.querySelector("#form3Example3").value.trim();
        const password = document.querySelector("#form3Example4").value.trim();

        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        try {
            const res = await fetch(`http://localhost:3000/users?email=${email}`);
            const users = await res.json();

            if (users.length > 0) {
                const user = users[0];

                if (user.password === password) {
                    localStorage.setItem("loggedInUser", JSON.stringify(user));

                    if (user.role.toLowerCase() === "backer") {
                        window.location.href = "../AllCampaigns/allCampaigns.html";
                    } else if (user.role.toLowerCase() === "approved_campaigner") {
                        window.location.href = "../DashBoardCampaigner/index.html";
                    }else if (user.role.toLowerCase() === "admin") {
                        window.location.href = "../DashBoardAdmin/index.html";
                    } else {
                        alert("Unknown user role. Please contact support.");
                    }
                } else {
                    alert("Incorrect password.");
                }
            } else {
                alert("User not found. Please register first.");
            }
        } catch (error) {
            alert("Server error. Please check your connection.");
            console.error(error);
        }
    });
});
