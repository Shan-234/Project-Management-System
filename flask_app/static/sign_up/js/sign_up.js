document.getElementById("submit_info").addEventListener('click', (event) => {
    event.preventDefault();

    const inputData = {
        'email': document.getElementById("email").value,
        'password': document.getElementById("password").value
    };

    jQuery.ajax({
        url: "/process_sign_up",
        data: JSON.stringify(inputData),
        contentType: "application/json",
        type: "POST",
        success:function(returnedData) {
            console.log(returnedData);
            if (returnedData === "User Already Exists.") {
                document.getElementById("user_exists").textContent = returnedData;
            } else {
                window.location.href = "/home";
            }
        }
    });
});