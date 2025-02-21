document.getElementById("submit_info").addEventListener('click', (event) => {
    event.preventDefault();

    const inputData = {
        'email': document.getElementById("email").value,
        'password': document.getElementById("password").value
    };

    jQuery.ajax({
        url: "/process_sign_in",
        data: JSON.stringify(inputData),
        contentType: "application/json",
        type: "POST",
        success:function(returnedData) {
            if ('success' in returnedData) {
                window.location.href = "/home";
            } else {
                document.getElementById("incorrect_credentials").textContent = "Incorrect Credentials. Try Again.";
            }
        }
    });
});